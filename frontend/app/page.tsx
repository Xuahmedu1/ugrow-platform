'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SplashScreen } from '@/components/splash/SplashScreen'
import { LoginPage } from '@/components/auth/LoginPage'
import { useAuthStore } from '@/stores/authStore'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [showSplash, setShowSplash] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (isHydrated && isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/admin/restaurants')
      } else {
        router.push('/client/reports')
      }
    }
  }, [isHydrated, isAuthenticated, user, router])

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  // Show nothing during hydration to prevent flash
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-64 h-32 bg-gray-100 rounded-lg" />
        </div>
      </div>
    )
  }

  // If authenticated, show loading while redirecting
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-[#2E1C5F]">
          Redirecting...
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <SplashScreen 
        isVisible={showSplash} 
        onComplete={handleSplashComplete} 
      />
      {!showSplash && <LoginPage />}
    </main>
  )
}
