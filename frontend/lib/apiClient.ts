/**
 * UGROW API Client
 * Centralized HTTP client for backend communication
 * Handles auth tokens, error handling, request/response transformation
 */

import { useAuthStore } from '@/stores/authStore'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// HTTP methods type
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// Request options interface
interface RequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: unknown
  skipAuth?: boolean
  timeout?: number
}

// API Error class
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'APIError'
  }
}

/**
 * Core request function with interceptors
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    skipAuth = false,
    timeout = 30000
  } = options

  // Build URL
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  // Default headers
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  // Add auth token if available and not skipped
  if (!skipAuth) {
    const token = localStorage.getItem('ugrow_token')
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  // Merge headers
  const finalHeaders = { ...defaultHeaders, ...headers }

  // Prepare fetch options
  const fetchOptions: RequestInit = {
    method,
    headers: finalHeaders,
    credentials: 'include', // Include cookies for refresh token
  }

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body)
  }

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new APIError(408, 'Request timeout')), timeout)
  })

  try {
    // Race between fetch and timeout
    const response = await Promise.race([
      fetch(url, fetchOptions),
      timeoutPromise
    ])

    // Handle 401 - try to refresh token
    if (response.status === 401 && !skipAuth) {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        // Retry original request with new token
        const newToken = localStorage.getItem('ugrow_token')
        finalHeaders['Authorization'] = `Bearer ${newToken}`
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers: finalHeaders,
        })
        return handleResponse<T>(retryResponse)
      } else {
        // Refresh failed, logout user
        useAuthStore.getState().logout()
        throw new APIError(401, 'Session expired. Please login again.')
      }
    }

    return handleResponse<T>(response)
  } catch (error) {
    if (error instanceof APIError) throw error
    throw new APIError(500, error instanceof Error ? error.message : 'Network error')
  }
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  // Check if response is JSON
  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')

  let data: unknown
  try {
    data = isJson ? await response.json() : await response.text()
  } catch {
    data = null
  }

  // Handle error status codes
  if (!response.ok) {
    const message = isJson && data && typeof data === 'object' && 'message' in data
      ? String(data.message)
      : response.statusText || 'Unknown error'
    
    throw new APIError(response.status, message, data)
  }

  return data as T
}

/**
 * Refresh access token using refresh token cookie
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Send refresh token cookie
    })

    if (!response.ok) return false

    const data = await response.json()
    if (data.access_token) {
      localStorage.setItem('ugrow_token', data.access_token)
      return true
    }
    return false
  } catch {
    return false
  }
}

// ============================================
// API Client Methods
// ============================================

export const apiClient = {
  /**
   * GET request
   */
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * POST request
   */
  post: <T>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  /**
   * PUT request
   */
  put: <T>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),

  /**
   * PATCH request
   */
  patch: <T>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  /**
   * Upload file(s) with multipart/form-data
   */
  upload: async <T>(
    endpoint: string,
    files: File | File[],
    additionalData?: Record<string, string>
  ): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
    const formData = new FormData()

    // Append files
    if (Array.isArray(files)) {
      files.forEach((file) => formData.append('files', file))
    } else {
      formData.append('file', files)
    }

    // Append additional data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const token = localStorage.getItem('ugrow_token')
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    })

    return handleResponse<T>(response)
  },
}

// ============================================
// Typed API Endpoints
// ============================================

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post<{ access_token: string; refresh_token: string; user: unknown }>(
      '/api/auth/login',
      { email, password },
      { skipAuth: true }
    ),

  logout: () => apiClient.post('/api/auth/logout', {}),

  me: () => apiClient.get<unknown>('/api/auth/me'),
}

export const reportsAPI = {
  getAll: () => apiClient.get<{ reports: unknown[] }>('/api/reports/all'),

  getByRestaurant: (restaurantId: string) =>
    apiClient.get<{ reports: unknown[] }>(`/api/reports/restaurant/${restaurantId}`),

  getById: (id: string) => apiClient.get<unknown>(`/api/reports/${id}`),

  create: (data: unknown) => apiClient.post<unknown>('/api/reports', data),

  delete: (id: string) => apiClient.delete(`/api/reports/${id}`),

  export: (reportId: string) =>
    apiClient.get<Blob>(`/api/export/report/${reportId}`, {
      headers: { Accept: 'application/octet-stream' },
    }),
}

export const restaurantsAPI = {
  getAll: () => apiClient.get<{ restaurants: unknown[] }>('/api/restaurants'),

  getById: (id: string) => apiClient.get<unknown>(`/api/restaurants/${id}`),

  create: (data: unknown) => apiClient.post<unknown>('/api/restaurants', data),

  update: (id: string, data: unknown) =>
    apiClient.put<unknown>(`/api/restaurants/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/restaurants/${id}`),

  updateStatus: (id: string, status: string) =>
    apiClient.patch<unknown>(`/api/restaurants/${id}/status`, { status }),
}

export const analysisAPI = {
  processFiles: (
    files: Record<string, File[]>,
    settings: { actualSalesRate: number; foodCostRate: number },
    dateRange: { from: string; to: string }
  ) => {
    const formData = new FormData()
    
    // Append all files with platform prefix
    Object.entries(files).forEach(([platform, platformFiles]) => {
      platformFiles.forEach((file) => {
        formData.append(`${platform}_files`, file)
      })
    })

    formData.append('settings', JSON.stringify(settings))
    formData.append('dateRange', JSON.stringify(dateRange))

    return apiClient.upload('/api/analysis/process', [], {
      settings: JSON.stringify(settings),
      dateRange: JSON.stringify(dateRange),
    })
  },
}

// Export default for convenience
export default apiClient