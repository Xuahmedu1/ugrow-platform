'use client'

import { AnimatePresence } from 'framer-motion'
import { useAnalysisStore } from '@/stores/analysisStore'
import { WizardStepper } from './WizardStepper'
import { RestaurantSelect } from './steps/RestaurantSelect'
import { DateRangeSelect } from './steps/DateRangeSelect'
import { PlatformSelect } from './steps/PlatformSelect'
import { UploadSheets } from './steps/UploadSheets'

const STEPS = [
  { number: 1, title: 'Restaurant', description: 'Select restaurant' },
  { number: 2, title: 'Date Range', description: 'Choose period' },
  { number: 3, title: 'Platforms', description: 'Select platforms' },
  { number: 4, title: 'Upload', description: 'Upload sheets' }
]

interface AnalysisWizardProps {
  onProcess: () => void
}

export function AnalysisWizard({ onProcess }: AnalysisWizardProps) {
  const { step } = useAnalysisStore()

  const renderStep = () => {
    switch (step) {
      case 1:
        return <RestaurantSelect />
      case 2:
        return <DateRangeSelect />
      case 3:
        return <PlatformSelect />
      case 4:
        return <UploadSheets onProcess={onProcess} />
      default:
        return <RestaurantSelect />
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {/* Stepper */}
      <WizardStepper steps={STEPS} currentStep={step} />
      
      {/* Step Content */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  )
}
