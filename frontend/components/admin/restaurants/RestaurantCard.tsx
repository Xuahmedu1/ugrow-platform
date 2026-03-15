'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { Restaurant, AccountStatus } from '@/lib/types'
import { PLATFORMS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MoreVertical, 
  Edit, 
  Eye, 
  RefreshCw,
  User
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface RestaurantCardProps {
  restaurant: Restaurant
  index: number
  onEdit: (restaurant: Restaurant) => void
  onView: (restaurant: Restaurant) => void
  onChangeStatus: (restaurant: Restaurant) => void
}

const statusConfig: Record<AccountStatus, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  },
  hold: {
    label: 'On Hold',
    className: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  deactivated: {
    label: 'Deactivated',
    className: 'bg-red-100 text-red-700 border-red-200'
  }
}

export function RestaurantCard({ 
  restaurant, 
  index, 
  onEdit, 
  onView, 
  onChangeStatus 
}: RestaurantCardProps) {
  const status = statusConfig[restaurant.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 
                 hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
      onClick={() => onView(restaurant)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Profile Image */}
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
            {restaurant.profileImage ? (
              <Image
                src={restaurant.profileImage}
                alt={restaurant.name}
                fill
                className="object-cover"
              />
            ) : (
              <User className="h-7 w-7 text-gray-400" />
            )}
          </div>
          
          {/* Name & Status */}
          <div>
            <h3 className="font-bold text-[#2E1C5F] text-lg group-hover:text-[#FF305D] transition-colors">
              {restaurant.name}
            </h3>
            <Badge 
              variant="outline" 
              className={`mt-1 ${status.className}`}
            >
              {status.label}
            </Badge>
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-[#2E1C5F]"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(restaurant); }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(restaurant); }}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onChangeStatus(restaurant); }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Change Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Info */}
      {restaurant.area && (
        <p className="text-sm text-gray-500 mb-4">
          {restaurant.area}
        </p>
      )}

      {/* Platform Icons */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-400 mr-2">Platforms:</span>
        <div className="flex items-center gap-2">
          {restaurant.platforms.map((platformId) => {
            const platform = PLATFORMS[platformId]
            return (
              <motion.div
                key={platformId}
                whileHover={{ scale: 1.15 }}
                className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm"
              >
                <Image
                  src={platform.logo}
                  alt={platform.name}
                  fill
                  className="object-cover"
                />
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
