'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useAnalysisStore } from '@/stores/analysisStore'
import { PLATFORMS, type PlatformType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'

export function PlatformSelect() {
  const { 
    selectedRestaurant, 
    selectedPlatforms, 
    togglePlatform,
    nextStep, 
    prevStep 
  } = useAnalysisStore()

  // Only show platforms registered for the selected restaurant
  const availablePlatforms = selectedRestaurant?.platforms || []

  const handleContinue = () => {
    if (selectedPlatforms.length > 0) {
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
        <h2 className="text-2xl font-bold text-[#2E1C5F]">Select Platforms</h2>
        <p className="text-gray-500 mt-1">
          Choose which delivery platforms to include in the analysis
        </p>
      </div>

      {/* Platform Grid */}
      {availablePlatforms.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl">
          {availablePlatforms.map((platformId, index) => {
            const platform = PLATFORMS[platformId]
            const isSelected = selectedPlatforms.includes(platformId)
            
            return (
              <motion.button
                key={platformId}
                onClick={() => togglePlatform(platformId)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex flex-col items-center gap-3 p-6 rounded-xl border-2
                  transition-all duration-200
                  ${isSelected 
                    ? 'border-[#FF305D] bg-[#FF305D]/5 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }
                `}
              >
                {/* Platform Logo */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-sm">
                  <Image
                    src={platform.logo}
                    alt={platform.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Platform Name */}
                <span className={`
                  font-semibold transition-colors
                  ${isSelected ? 'text-[#FF305D]' : 'text-[#2E1C5F]'}
                `}>
                  {platform.name}
                </span>

                {/* File Types */}
                <span className="text-xs text-gray-400">
                  {platform.fileTypes.join(', ')}
                </span>

                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 bg-[#FF305D] rounded-full flex items-center justify-center"
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
      ) : (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-lg max-w-md">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <p className="text-sm text-amber-700">
            No platforms registered for this restaurant
          </p>
        </div>
      )}

      {/* Selection Summary */}
      {selectedPlatforms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-[#2E1C5F]/5 rounded-lg max-w-3xl"
        >
          <p className="text-sm text-[#2E1C5F]">
            <span className="font-medium">Selected:</span>{' '}
            {selectedPlatforms.map(p => PLATFORMS[p].name).join(', ')}
          </p>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={prevStep}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={selectedPlatforms.length === 0}
          className="bg-[#FF305D] hover:bg-[#e02850] text-white gap-2 px-6"
        >
          Continue
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}
