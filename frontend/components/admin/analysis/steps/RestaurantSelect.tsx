'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRestaurantStore } from '@/stores/restaurantStore'
import { useAnalysisStore } from '@/stores/analysisStore'
import type { Restaurant } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, User, ChevronRight } from 'lucide-react'

export function RestaurantSelect() {
  const { restaurants } = useRestaurantStore()
  const { selectedRestaurant, setSelectedRestaurant, nextStep } = useAnalysisStore()
  const [searchQuery, setSearchQuery] = useState('')

  // Only show active restaurants
  const activeRestaurants = restaurants.filter(r => r.status === 'active')
  
  const filteredRestaurants = activeRestaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
  }

  const handleContinue = () => {
    if (selectedRestaurant) {
      nextStep()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-[#2E1C5F]">Select Restaurant</h2>
        <p className="text-gray-500 mt-1">Choose the restaurant you want to analyze</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search restaurants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Restaurant List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
        {filteredRestaurants.map((restaurant, index) => {
          const isSelected = selectedRestaurant?.id === restaurant.id
          
          return (
            <motion.button
              key={restaurant.id}
              onClick={() => handleSelect(restaurant)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center gap-4 p-4 rounded-xl border-2 text-left
                transition-all duration-200 hover:shadow-md
                ${isSelected 
                  ? 'border-[#FF305D] bg-[#FF305D]/5 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* Profile Image */}
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
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
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold truncate ${isSelected ? 'text-[#FF305D]' : 'text-[#2E1C5F]'}`}>
                  {restaurant.name}
                </h3>
                {restaurant.area && (
                  <p className="text-sm text-gray-500 truncate">{restaurant.area}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {restaurant.platforms.length} platform{restaurant.platforms.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 bg-[#FF305D] rounded-full flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No active restaurants found</p>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={handleContinue}
          disabled={!selectedRestaurant}
          className="bg-[#FF305D] hover:bg-[#e02850] text-white gap-2 px-6"
        >
          Continue
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}
