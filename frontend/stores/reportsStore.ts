import { create } from 'zustand'
import type { Report } from '@/lib/types'

const API_URL = 'http://localhost:8000'

interface ReportsState {
  reports: Report[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchReportsByRestaurant: (restaurantId: string) => Promise<void>
  fetchAllReports: () => Promise<void>
  getReportsByRestaurant: (restaurantId: string) => Report[]
  getReportById: (id: string) => Report | undefined
  deleteReport: (id: string) => Promise<void>
}

export const useReportsStore = create<ReportsState>()((set, get) => ({
  reports: [],
  isLoading: false,
  error: null,

  // Fetch reports for a specific restaurant (client view)
  fetchReportsByRestaurant: async (restaurantId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/api/reports/restaurant/${restaurantId}`)
      if (!response.ok) throw new Error('Failed to fetch reports')
      const data = await response.json()
      set({ reports: data.reports as Report[], isLoading: false })
    } catch {
      set({ error: 'Cannot connect to server', isLoading: false })
    }
  },

  // Fetch all reports (admin view)
  fetchAllReports: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/api/reports/all`)
      if (!response.ok) throw new Error('Failed to fetch reports')
      const data = await response.json()
      set({ reports: data.reports as Report[], isLoading: false })
    } catch {
      set({ error: 'Cannot connect to server', isLoading: false })
    }
  },

  // Local getters
  getReportsByRestaurant: (restaurantId: string) => {
    return get().reports
      .filter(r => r.restaurantId === restaurantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getReportById: (id: string) => {
    return get().reports.find(r => r.id === id)
  },

  // Delete report
  deleteReport: async (id: string) => {
    try {
      await fetch(`${API_URL}/api/reports/${id}`, { method: 'DELETE' })
      set(state => ({ reports: state.reports.filter(r => r.id !== id) }))
    } catch {
      set({ error: 'Failed to delete report' })
    }
  },
}))