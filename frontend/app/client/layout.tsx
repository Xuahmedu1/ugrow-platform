'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/stores/languageStore'
import { 
  FileText, 
  KeyRound, 
  Info,
  Mail,
  LogOut, 
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  {
    key: 'reports',
    href: '/client/reports',
    icon: FileText,
    labelKey: 'nav.reports'
  },
  {
    key: 'credentials',
    href: '/client/credentials',
    icon: KeyRound,
    labelKey: 'nav.credentials'
  },
  {
    key: 'about',
    href: '/client/about',
    icon: Info,
    labelKey: 'nav.about'
  },
  {
    key: 'contact',
    href: '/client/contact',
    icon: Mail,
    labelKey: 'nav.contact'
  }
]

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { t } = useTranslation()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'client') {
      router.push('/')
    }
  }, [isAuthenticated, user, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!isAuthenticated || user?.role !== 'client') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-[#2E1C5F]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-[#2E1C5F] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/client/reports" className="flex items-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-7HgpWbAEIbyNtRTaMpX3iSMXBsdZVs.png"
                alt="U.GROW"
                width={120}
                height={60}
                className="object-contain brightness-0 invert"
              />
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                const Icon = item.icon
                
                return (
                  <Link key={item.key} href={item.href}>
                    <motion.div
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg
                        transition-colors duration-200
                        ${isActive 
                          ? 'bg-white/10 text-white' 
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{t(item.labelKey)}</span>
                      {isActive && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF305D]"
                          layoutId="clientActiveTab"
                        />
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </nav>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm text-white/70">Welcome,</p>
                <p className="text-sm font-medium">{user?.name || 'Client'}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-b sticky top-16 z-40">
        <div className="flex overflow-x-auto px-4 py-2 gap-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            
            return (
              <Link key={item.key} href={item.href}>
                <div
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap
                    ${isActive 
                      ? 'bg-[#FF305D] text-white' 
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{t(item.labelKey)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
