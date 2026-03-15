'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import type { Restaurant, PlatformType, PlatformCredential, AccountStatus } from '@/lib/types'
import { PLATFORMS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { 
  X, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Plus,
  User,
  MapPin,
  Building,
  Phone,
  Mail,
  Lock
} from 'lucide-react'

interface RestaurantFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (restaurant: Partial<Restaurant>) => void
  restaurant?: Restaurant | null
}

const allPlatforms: PlatformType[] = ['talabat', 'keeta', 'noon', 'smiles', 'deliveroo', 'careem']

export function RestaurantForm({ isOpen, onClose, onSave, restaurant }: RestaurantFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    ownerPhone: '',
    managerName: '',
    managerPhone: '',
    area: '',
    address: '',
    googleMapsUrl: '',
    platforms: [] as PlatformType[],
    credentials: [] as PlatformCredential[],
    status: 'active' as AccountStatus,
    clientUsername: '',
    clientPassword: ''
  })
  
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [locationOpen, setLocationOpen] = useState(false)
  const [credentialsOpen, setCredentialsOpen] = useState(false)

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        ownerName: restaurant.ownerName || '',
        ownerPhone: restaurant.ownerPhone || '',
        managerName: restaurant.managerName || '',
        managerPhone: restaurant.managerPhone || '',
        area: restaurant.area || '',
        address: restaurant.address || '',
        googleMapsUrl: restaurant.googleMapsUrl || '',
        platforms: restaurant.platforms || [],
        credentials: restaurant.credentials || [],
        status: restaurant.status || 'active',
        clientUsername: restaurant.clientUsername || '',
        clientPassword: restaurant.clientPassword || ''
      })
    } else {
      // Reset form for new restaurant
      setFormData({
        name: '',
        ownerName: '',
        ownerPhone: '',
        managerName: '',
        managerPhone: '',
        area: '',
        address: '',
        googleMapsUrl: '',
        platforms: [],
        credentials: [],
        status: 'active',
        clientUsername: '',
        clientPassword: ''
      })
    }
    setShowPasswords({})
  }, [restaurant, isOpen])

  const togglePlatform = (platform: PlatformType) => {
    setFormData(prev => {
      const platforms = prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
      
      // Update credentials accordingly
      const credentials = platforms.includes(platform)
        ? prev.credentials.some(c => c.platform === platform)
          ? prev.credentials
          : [...prev.credentials, { platform, email: '', password: '' }]
        : prev.credentials.filter(c => c.platform !== platform)
      
      return { ...prev, platforms, credentials }
    })
  }

  const updateCredential = (platform: PlatformType, field: keyof PlatformCredential, value: string) => {
    setFormData(prev => ({
      ...prev,
      credentials: prev.credentials.map(c =>
        c.platform === platform ? { ...c, [field]: value } : c
      )
    }))
  }

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#2E1C5F]">
            {restaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2E1C5F] font-semibold">
              <Building className="h-5 w-5" />
              <span>Basic Information</span>
            </div>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter restaurant name"
                  required
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                    placeholder="Owner name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ownerPhone">Owner Phone</Label>
                  <Input
                    id="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, ownerPhone: e.target.value }))}
                    placeholder="+971..."
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="managerName">Manager Name</Label>
                  <Input
                    id="managerName"
                    value={formData.managerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, managerName: e.target.value }))}
                    placeholder="Manager name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="managerPhone">Manager Phone</Label>
                  <Input
                    id="managerPhone"
                    value={formData.managerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, managerPhone: e.target.value }))}
                    placeholder="+971..."
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location (Collapsible) */}
          <Collapsible open={locationOpen} onOpenChange={setLocationOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 text-[#2E1C5F] font-semibold">
                  <MapPin className="h-5 w-5" />
                  <span>Location Details</span>
                </div>
                <motion.div
                  animate={{ rotate: locationOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </motion.div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-4 space-y-4">
                <div>
                  <Label htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    placeholder="e.g., Deira, Dubai Marina"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Full address"
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="googleMapsUrl">Google Maps URL</Label>
                  <Input
                    id="googleMapsUrl"
                    value={formData.googleMapsUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, googleMapsUrl: e.target.value }))}
                    placeholder="https://maps.google.com/..."
                    className="mt-1"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Platforms Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2E1C5F] font-semibold">
              <span>Delivery Platforms</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {allPlatforms.map((platformId) => {
                const platform = PLATFORMS[platformId]
                const isSelected = formData.platforms.includes(platformId)
                
                return (
                  <motion.button
                    key={platformId}
                    type="button"
                    onClick={() => togglePlatform(platformId)}
                    className={`
                      relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                      ${isSelected 
                        ? 'border-[#FF305D] bg-[#FF305D]/5' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                      <Image
                        src={platform.logo}
                        alt={platform.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-[#FF305D]' : 'text-gray-600'}`}>
                      {platform.name}
                    </span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 bg-[#FF305D] rounded-full flex items-center justify-center"
                      >
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Platform Credentials (Collapsible) */}
          <AnimatePresence>
            {formData.platforms.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Collapsible open={credentialsOpen} onOpenChange={setCredentialsOpen}>
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-[#2E1C5F] font-semibold">
                        <Lock className="h-5 w-5" />
                        <span>Platform Credentials</span>
                      </div>
                      <motion.div
                        animate={{ rotate: credentialsOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      </motion.div>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pt-4 space-y-4">
                      {formData.credentials.map((credential) => {
                        const platform = PLATFORMS[credential.platform]
                        return (
                          <div 
                            key={credential.platform}
                            className="p-4 border border-gray-200 rounded-lg space-y-3"
                          >
                            <div className="flex items-center gap-2">
                              <div className="relative w-6 h-6 rounded overflow-hidden">
                                <Image
                                  src={platform.logo}
                                  alt={platform.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <span className="font-medium text-[#2E1C5F]">{platform.name}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Email</Label>
                                <Input
                                  value={credential.email}
                                  onChange={(e) => updateCredential(credential.platform, 'email', e.target.value)}
                                  placeholder="email@platform.com"
                                  className="mt-1 h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Password</Label>
                                <div className="relative mt-1">
                                  <Input
                                    type={showPasswords[`${credential.platform}-pass`] ? 'text' : 'password'}
                                    value={credential.password}
                                    onChange={(e) => updateCredential(credential.platform, 'password', e.target.value)}
                                    placeholder="Password"
                                    className="h-9 pr-9"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(`${credential.platform}-pass`)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  >
                                    {showPasswords[`${credential.platform}-pass`] ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Deliveroo Tablet Access */}
                            {credential.platform === 'deliveroo' && (
                              <div className="pt-2 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-2">Tablet Access (Optional)</p>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Input
                                      value={credential.tabletEmail || ''}
                                      onChange={(e) => updateCredential(credential.platform, 'tabletEmail', e.target.value)}
                                      placeholder="Tablet email"
                                      className="h-9"
                                    />
                                  </div>
                                  <div className="relative">
                                    <Input
                                      type={showPasswords[`${credential.platform}-tablet`] ? 'text' : 'password'}
                                      value={credential.tabletPassword || ''}
                                      onChange={(e) => updateCredential(credential.platform, 'tabletPassword', e.target.value)}
                                      placeholder="Tablet password"
                                      className="h-9 pr-9"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => togglePasswordVisibility(`${credential.platform}-tablet`)}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                      {showPasswords[`${credential.platform}-tablet`] ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status & Client Access */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2E1C5F] font-semibold">
              <User className="h-5 w-5" />
              <span>Status & Client Access</span>
            </div>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="status">Account Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: AccountStatus) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="hold">On Hold</SelectItem>
                    <SelectItem value="deactivated">Deactivated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientUsername">Client Username</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      id="clientUsername"
                      value={formData.clientUsername}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientUsername: e.target.value }))}
                      placeholder="username"
                      className="rounded-r-none border-r-0"
                    />
                    <div className="h-10 px-3 flex items-center bg-gray-100 border border-l-0 border-input rounded-r-md text-xs text-gray-500">
                      @ugrow.com
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="clientPassword">Client Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="clientPassword"
                      type={showPasswords.clientPassword ? 'text' : 'password'}
                      value={formData.clientPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientPassword: e.target.value }))}
                      placeholder="Password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('clientPassword')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.clientPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-[#FF305D] hover:bg-[#e02850] text-white"
              disabled={!formData.name}
            >
              {restaurant ? 'Save Changes' : 'Add Restaurant'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
