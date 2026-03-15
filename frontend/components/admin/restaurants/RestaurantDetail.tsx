'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import type { Restaurant } from '@/lib/types'
import { PLATFORMS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  User, 
  Phone, 
  MapPin, 
  ExternalLink, 
  Mail, 
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react'

interface RestaurantDetailProps {
  isOpen: boolean
  onClose: () => void
  restaurant: Restaurant | null
}

const statusConfig = {
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700' },
  hold: { label: 'On Hold', className: 'bg-amber-100 text-amber-700' },
  deactivated: { label: 'Deactivated', className: 'bg-red-100 text-red-700' }
}

export function RestaurantDetail({ isOpen, onClose, restaurant }: RestaurantDetailProps) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!restaurant) return null

  const status = statusConfig[restaurant.status]

  const togglePassword = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#2E1C5F]">
            Restaurant Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
              {restaurant.profileImage ? (
                <Image
                  src={restaurant.profileImage}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#2E1C5F]">{restaurant.name}</h2>
              <Badge className={`mt-2 ${status.className}`}>{status.label}</Badge>
              
              {/* Platforms */}
              <div className="flex items-center gap-2 mt-3">
                {restaurant.platforms.map((platformId) => {
                  const platform = PLATFORMS[platformId]
                  return (
                    <div
                      key={platformId}
                      className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm"
                      title={platform.name}
                    >
                      <Image
                        src={platform.logo}
                        alt={platform.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            {restaurant.ownerName && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Owner</p>
                <p className="font-medium text-[#2E1C5F]">{restaurant.ownerName}</p>
                {restaurant.ownerPhone && (
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {restaurant.ownerPhone}
                  </p>
                )}
              </div>
            )}
            {restaurant.managerName && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Manager</p>
                <p className="font-medium text-[#2E1C5F]">{restaurant.managerName}</p>
                {restaurant.managerPhone && (
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {restaurant.managerPhone}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Location */}
          {(restaurant.area || restaurant.address) && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-[#2E1C5F]" />
                <p className="font-medium text-[#2E1C5F]">Location</p>
              </div>
              {restaurant.area && <p className="text-sm text-gray-600">{restaurant.area}</p>}
              {restaurant.address && <p className="text-sm text-gray-500 mt-1">{restaurant.address}</p>}
              {restaurant.googleMapsUrl && (
                <a
                  href={restaurant.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#FF305D] hover:underline mt-2"
                >
                  Open in Google Maps
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {/* Platform Credentials */}
          {restaurant.credentials.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-[#2E1C5F] flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Platform Credentials
              </h3>
              <div className="space-y-2">
                {restaurant.credentials.map((credential) => {
                  const platform = PLATFORMS[credential.platform]
                  const passKey = `${credential.platform}-pass`
                  
                  return (
                    <div
                      key={credential.platform}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="relative w-6 h-6 rounded overflow-hidden">
                          <Image
                            src={platform.logo}
                            alt={platform.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium text-sm text-[#2E1C5F]">{platform.name}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600 truncate">{credential.email}</span>
                          <button
                            onClick={() => copyToClipboard(credential.email, `${credential.platform}-email`)}
                            className="text-gray-400 hover:text-[#2E1C5F]"
                          >
                            {copiedField === `${credential.platform}-email` ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lock className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">
                            {showPasswords[passKey] ? credential.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePassword(passKey)}
                            className="text-gray-400 hover:text-[#2E1C5F]"
                          >
                            {showPasswords[passKey] ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(credential.password, `${credential.platform}-pass`)}
                            className="text-gray-400 hover:text-[#2E1C5F]"
                          >
                            {copiedField === `${credential.platform}-pass` ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Client Access */}
          {restaurant.clientUsername && (
            <div className="p-4 bg-[#2E1C5F]/5 rounded-lg">
              <h3 className="font-semibold text-[#2E1C5F] flex items-center gap-2 mb-3">
                <User className="h-4 w-4" />
                Client Portal Access
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Username</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#2E1C5F]">
                      {restaurant.clientUsername}@ugrow.com
                    </span>
                    <button
                      onClick={() => copyToClipboard(`${restaurant.clientUsername}@ugrow.com`, 'client-email')}
                      className="text-gray-400 hover:text-[#2E1C5F]"
                    >
                      {copiedField === 'client-email' ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Password</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#2E1C5F]">
                      {showPasswords['client'] ? restaurant.clientPassword : '••••••••'}
                    </span>
                    <button
                      onClick={() => togglePassword('client')}
                      className="text-gray-400 hover:text-[#2E1C5F]"
                    >
                      {showPasswords['client'] ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </button>
                    {restaurant.clientPassword && (
                      <button
                        onClick={() => copyToClipboard(restaurant.clientPassword!, 'client-pass')}
                        className="text-gray-400 hover:text-[#2E1C5F]"
                      >
                        {copiedField === 'client-pass' ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t mt-6">
          <Button onClick={onClose} className="bg-[#2E1C5F] hover:bg-[#3d2878] text-white">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
