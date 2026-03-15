/**
 * UGROW Next.js Middleware
 * Route protection, locale handling, and authentication
 * SRS 4.3 - JWT flow and role-based access control
 * 
 * NOTE: Uses 'jose' instead of 'jsonwebtoken' for Edge Runtime compatibility
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify, JWTPayload } from 'jose'

// ============================================
// Configuration
// ============================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here-change-in-production'
)

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/api/auth/login', '/api/auth/refresh']

// ============================================
// Helper Functions
// ============================================

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route) => path.startsWith(route))
}

function extractToken(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Check cookies
  const tokenCookie = request.cookies.get('access_token')
  if (tokenCookie) {
    return tokenCookie.value
  }
  
  return null
}

async function verifyToken(token: string): Promise<{ userId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // Ensure it's an access token, not refresh token
    if (payload.type !== 'access') {
      return null
    }
    
    return { 
      userId: payload.sub as string, 
      role: payload.role as string 
    }
  } catch {
    return null
  }
}

function getLocaleFromRequest(request: NextRequest): string {
  // Check cookie first
  const langCookie = request.cookies.get('ugrow-language')
  if (langCookie?.value) {
    return langCookie.value
  }
  
  // Check Accept-Language header
  const acceptLang = request.headers.get('accept-language')
  if (acceptLang?.includes('ar')) {
    return 'ar'
  }
  
  return 'en'
}

// ============================================
// Main Middleware Function
// ============================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and API routes handled separately
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Files with extensions
  ) {
    return NextResponse.next()
  }
  
  // ==========================================
  // Locale Handling
  // ==========================================
  
  const locale = getLocaleFromRequest(request)
  const isRTL = locale === 'ar'
  
  // Create response with locale headers
  const response = NextResponse.next()
  response.headers.set('x-locale', locale)
  response.headers.set('x-rtl', isRTL ? 'true' : 'false')
  
  // ==========================================
  // Authentication Check
  // ==========================================
  
  if (isPublicRoute(pathname)) {
    // Set locale cookie if not present
    if (!request.cookies.has('ugrow-language')) {
      response.cookies.set('ugrow-language', locale, {
        maxAge: 365 * 24 * 60 * 60, // 1 year
        path: '/',
      })
    }
    return response
  }
  
  // Extract and verify token
  const token = extractToken(request)
  
  if (!token) {
    // Redirect to login for protected routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  const userData = await verifyToken(token)
  
  if (!userData) {
    // Token invalid or expired
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // Clear invalid cookies and redirect
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'session_expired')
    return NextResponse.redirect(loginUrl)
  }
  
  // ==========================================
  // Role-Based Access Control
  // ==========================================
  
  const { role } = userData
  
  // Admin trying to access client routes
  if (pathname.startsWith('/client') && role !== 'client' && role !== 'admin') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  
  // Client trying to access admin routes
  if (pathname.startsWith('/admin') && role !== 'admin') {
    // Redirect clients to their dashboard
    if (role === 'client') {
      return NextResponse.redirect(new URL('/client/reports', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // API route protection
  if (pathname.startsWith('/api/admin') && role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }
  
  if (pathname.startsWith('/api/client') && role !== 'client') {
    return NextResponse.json(
      { error: 'Client access required' },
      { status: 403 }
    )
  }
  
  // Add user info to headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('x-user-id', userData.userId)
    response.headers.set('x-user-role', userData.role)
  }
  
  return response
}

// ============================================
// Middleware Configuration
// ============================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}