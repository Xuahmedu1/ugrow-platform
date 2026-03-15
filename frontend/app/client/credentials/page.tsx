'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useAuthStore } from '@/stores/authStore'
import { useRestaurantStore } from '@/stores/restaurantStore'
import { PLATFORMS, type PlatformCredential } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Copy, Check, KeyRound, Smartphone } from 'lucide-react'

export default function ClientCredentialsPage() {
  const { user } = useAuthStore()
  const { restaurants } = useRestaurantStore()
  
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({})

  // Find the restaurant associated with this client
  const clientRestaurant = restaurants.find(r => r.id === user?.restaurantId)
  const credentials = clientRestaurant?.credentials || []

  const togglePassword = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedFields(prev => ({ ...prev, [key]: true }))
    setTimeout(() => {
      setCopiedFields(prev => ({ ...prev, [key]: false }))
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2E1C5F]">Platform Credentials</h1>
        <p className="text-gray-500 mt-1">
          View your login credentials for each delivery platform
        </p>
      </div>

      {/* Credentials Grid */}
      {credentials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {credentials.map((credential, index) => {
            const platform = PLATFORMS[credential.platform]
            const emailKey = `${credential.platform}-email`
            const passKey = `${credential.platform}-pass`
            const tabletEmailKey = `${credential.platform}-tablet-email`
            const tabletPassKey = `${credential.platform}-tablet-pass`

            return (
              <motion.div
                key={credential.platform}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.07 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                {/* Platform Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md">
                    <Image
                      src={platform.logo}
                      alt={platform.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2E1C5F] text-lg">{platform.name}</h3>
                    <p className="text-sm text-gray-500">{platform.description}</p>
                  </div>
                </div>

                {/* Main Credentials */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#2E1C5F]">
                    <KeyRound className="h-4 w-4" />
                    <span>Login Credentials</span>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Email</label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={credential.email}
                        readOnly
                        className="bg-gray-50"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(credential.email, emailKey)}
                        className="shrink-0"
                      >
                        {copiedFields[emailKey] ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Password</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={showPasswords[passKey] ? 'text' : 'password'}
                          value={credential.password}
                          readOnly
                          className="bg-gray-50 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => togglePassword(passKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords[passKey] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(credential.password, passKey)}
                        className="shrink-0"
                      >
                        {copiedFields[passKey] ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tablet Credentials (Deliveroo only) */}
                {credential.platform === 'deliveroo' && credential.tabletEmail && (
                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#2E1C5F]">
                      <Smartphone className="h-4 w-4" />
                      <span>Tablet Access</span>
                    </div>

                    {/* Tablet Email */}
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Tablet Email</label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={credential.tabletEmail}
                          readOnly
                          className="bg-gray-50"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(credential.tabletEmail!, tabletEmailKey)}
                          className="shrink-0"
                        >
                          {copiedFields[tabletEmailKey] ? (
                            <Check className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Tablet Password */}
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Tablet Password</label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showPasswords[tabletPassKey] ? 'text' : 'password'}
                            value={credential.tabletPassword || ''}
                            readOnly
                            className="bg-gray-50 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => togglePassword(tabletPassKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords[tabletPassKey] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(credential.tabletPassword!, tabletPassKey)}
                          className="shrink-0"
                        >
                          {copiedFields[tabletPassKey] ? (
                            <Check className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No credentials found</h3>
          <p className="text-gray-500">
            Platform credentials will appear here once configured by the admin
          </p>
        </div>
      )}
    </div>
  )
}
