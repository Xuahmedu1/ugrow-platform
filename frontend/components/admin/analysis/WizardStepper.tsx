'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface Step {
  number: number
  title: string
  description: string
}

interface WizardStepperProps {
  steps: Step[]
  currentStep: number
}

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number
          const isCurrent = currentStep === step.number
          const isUpcoming = currentStep < step.number
          
          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center relative">
                <motion.div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    font-bold text-lg transition-colors duration-300
                    ${isCompleted 
                      ? 'bg-[#FF305D] text-white' 
                      : isCurrent 
                        ? 'bg-[#2E1C5F] text-white ring-4 ring-[#2E1C5F]/20' 
                        : 'bg-gray-200 text-gray-400'
                    }
                  `}
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Check className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    step.number
                  )}
                </motion.div>
                
                {/* Step Label */}
                <div className="mt-3 text-center">
                  <p className={`
                    text-sm font-semibold transition-colors duration-300
                    ${isCurrent ? 'text-[#2E1C5F]' : isCompleted ? 'text-[#FF305D]' : 'text-gray-400'}
                  `}>
                    {step.title}
                  </p>
                  <p className={`
                    text-xs mt-0.5 transition-colors duration-300
                    ${isCurrent || isCompleted ? 'text-gray-500' : 'text-gray-300'}
                  `}>
                    {step.description}
                  </p>
                </div>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-4 mt-[-2rem] rounded-full bg-gray-200 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#FF305D]"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: isCompleted ? '100%' : isCurrent ? '50%' : '0%' 
                    }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
