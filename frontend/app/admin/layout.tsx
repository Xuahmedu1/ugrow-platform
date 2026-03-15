'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/stores/languageStore'
import { 
  Store, 
  BarChart3, 
  FileText,
  LogOut, 
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  {
    key: 'restaurants',
    href: '/admin/restaurants',
    icon: Store,
    labelKey: 'nav.restaurants'
  },
  {
    key: 'analysis',
    href: '/admin/analysis',
    icon: BarChart3,
    labelKey: 'nav.analysis'
  },
  {
    key: 'reports',
    href: '/admin/reports',
    icon: FileText,
    labelKey: 'nav.savedReports'
  }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { t } = useTranslation()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/')
    }
  }, [isAuthenticated, user, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-[#2E1C5F]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2E1C5F] text-white flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/admin/restaurants">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-7HgpWbAEIbyNtRTaMpX3iSMXBsdZVs.png"
              alt="U.GROW"
              width={140}
              height={70}
              className="object-contain brightness-0 invert"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const Icon = item.icon
              
              return (
                <li key={item.key}>
                  <Link href={item.href}>
                    <motion.div
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-colors duration-200 group relative
                        ${isActive 
                          ? 'bg-white/10 text-white' 
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                        }
                      `}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF305D] rounded-r-full"
                          layoutId="activeIndicator"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{t(item.labelKey)}</span>
                      <ChevronRight className={`
                        h-4 w-4 ml-auto transition-opacity duration-200
                        ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
                      `} />
                    </motion.div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* User Info & Logout */}
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-sm text-white/50 mb-1">Logged in as</p>
            <p className="font-medium text-white truncate">{user?.name || user?.email}</p>
          </div>
          
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-white/70 hover:text-[#FF305D] hover:bg-white/5"
          >
            <LogOut className="h-5 w-5" />
            <span>{t('nav.logout')}</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
