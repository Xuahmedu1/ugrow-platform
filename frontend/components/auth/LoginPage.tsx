'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  
  const [emailPrefix, setEmailPrefix] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    const email = `${emailPrefix}@ugrow.com`
    const success = await login(email, password)
    
    if (success) {
      const user = useAuthStore.getState().user
      if (user?.role === 'admin') {
        router.push('/admin/restaurants')
      } else {
        router.push('/client/reports')
      }
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-white px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-12"
      >
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-7HgpWbAEIbyNtRTaMpX3iSMXBsdZVs.png"
          alt="U.GROW"
          width={280}
          height={140}
          className="object-contain"
          priority
        />
      </motion.div>

      {/* Login Card */}
      <motion.div
        className={`w-full max-w-md bg-white rounded-2xl shadow-[0_4px_40px_rgba(46,28,95,0.12)] p-8 ${
          shake ? 'animate-shake' : ''
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          animation: shake ? 'shake 0.5s ease-in-out' : 'none'
        }}
      >
        <h1 className="text-2xl font-bold text-[#2E1C5F] text-center mb-8">
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2E1C5F]">
              Email Address
            </label>
            <div className="flex items-center">
              <Input
                type="text"
                value={emailPrefix}
                onChange={(e) => setEmailPrefix(e.target.value)}
                placeholder="username"
                className="rounded-r-none border-r-0 focus:ring-[#FF305D] focus:border-[#FF305D]"
                disabled={isLoading}
              />
              <div className="h-10 px-4 flex items-center bg-gray-100 border border-l-0 border-input rounded-r-md text-sm text-gray-500 font-medium">
                @ugrow.com
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2E1C5F]">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pr-10 focus:ring-[#FF305D] focus:border-[#FF305D]"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2E1C5F] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-lg bg-red-50 border border-red-100"
              >
                <p className="text-sm text-red-600 text-center">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !emailPrefix || !password}
            className="w-full h-12 bg-[#FF305D] hover:bg-[#e02850] text-white font-semibold text-base rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Demo Credentials Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-6 border-t border-gray-100"
        >
          <p className="text-xs text-gray-400 text-center">
            Demo: admin / admin123
          </p>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-sm text-gray-400"
      >
        U.GROW - Expand, Enhance, Earn
      </motion.p>

      {/* Shake animation keyframes */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </motion.div>
  )
}
