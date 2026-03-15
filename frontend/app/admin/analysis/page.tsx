'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAnalysisStore } from '@/stores/analysisStore'
import { useTranslation } from '@/stores/languageStore'
import { AnalysisWizard } from '@/components/admin/analysis/AnalysisWizard'
import { KPIResults } from '@/components/kpi/KPIResults'
import { processAllPlatforms } from '@/lib/kpiCalculations'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

export default function AnalysisPage() {
  const { t } = useTranslation()
  const { 
    results, 
    totalKPI,
    setResults,
    setProcessing,
    uploadedFiles,
    selectedPlatforms,
    settings,
    dateFrom,
    dateTo,
    reset
  } = useAnalysisStore()
  
  const [showResults, setShowResults] = useState(false)

  // Reset showResults when analysis state is reset
  useEffect(() => {
    if (results.length === 0) {
      setShowResults(false)
    }
  }, [results])

  const handleProcess = async () => {
    setProcessing(true, 0)
    
    try {
      // Process all uploaded files with date range filtering
      const { platformResults, totalKPI } = await processAllPlatforms(
        uploadedFiles,
        selectedPlatforms,
        settings,
        { from: dateFrom, to: dateTo }
      )
      
      setResults(platformResults, totalKPI)
      setShowResults(true)
    } catch (error) {
      console.error('Error processing files:', error)
    } finally {
      setProcessing(false, 100)
    }
  }

  const handleNewAnalysis = () => {
    reset()
    setShowResults(false)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#2E1C5F]">
            {t('analysis.title')}
          </h1>
          <p className="text-gray-500 mt-1">
            Analyze sales data from delivery platforms
          </p>
        </div>
        
        {showResults && (
          <Button
            variant="outline"
            onClick={handleNewAnalysis}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            New Analysis
          </Button>
        )}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {showResults && results.length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <KPIResults />
          </motion.div>
        ) : (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AnalysisWizard onProcess={handleProcess} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
