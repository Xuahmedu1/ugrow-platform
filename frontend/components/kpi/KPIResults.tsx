'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useAnalysisStore } from '@/stores/analysisStore'
import { useRestaurantStore } from '@/stores/restaurantStore'
import { PLATFORMS, type KPIResult, type PlatformKPIResult } from '@/lib/types'
import { KPI_CONFIG, type KPIKey } from '@/lib/kpiCalculations'
import { exportMasterSheet } from '@/lib/exportMasterSheet'
import { KPICard } from './KPICard'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, FileSpreadsheet } from 'lucide-react'

const KPI_ORDER: KPIKey[] = [
  'numOrders',
  'totalSales',
  'discount',
  'earnings',
  'actualSales',
  'netRevenue',
  'expenses',
  'difference',
  'foodCost',
  'differenceCost'
]

interface KPIResultsProps {
  results?: PlatformKPIResult[]
  totalKPI?: KPIResult | null
  readOnly?: boolean
}

export function KPIResults({
  results: propResults,
  totalKPI: propTotalKPI,
  readOnly = false
}: KPIResultsProps = {}) {
  const store = useAnalysisStore()
  const { selectedRestaurant } = useRestaurantStore()
  const [activeTab, setActiveTab] = useState<string>('total')

  const results = propResults ?? store.results
  const totalKPI = propTotalKPI ?? store.totalKPI
  const dateFrom = store.dateFrom
  const dateTo = store.dateTo
  const settings = store.settings

  const settingsConfigured = settings.actualSalesRate !== 100 || settings.foodCostRate !== 35

  const getCurrentKPIs = (): KPIResult | null => {
    if (activeTab === 'total') {
      return totalKPI
    }
    const platformResult = results.find(r => r.platform === activeTab)
    return platformResult?.kpi || null
  }

  const currentKPIs = getCurrentKPIs()

  // ✅ EXPORT محلي بدون API
  const handleExport = () => {
    if (!totalKPI) {
      alert('No data to export')
      return
    }

    if (!selectedRestaurant) {
      alert('Please select a restaurant first')
      return
    }

    // Export locally using XLSX
    exportMasterSheet({
      restaurant: selectedRestaurant,
      dateFrom: dateFrom || new Date().toISOString().split('T')[0],
      dateTo: dateTo || new Date().toISOString().split('T')[0],
      platformResults: results,
      totalKPI
    })
  }

  // ✅ SAVE REPORT (لسه بيكلم API - ممكن نعمله محلي بعدين)
  const handleSaveReport = async () => {
    if (!totalKPI) return
    
    try {
      // مؤقتًا: نحفظ في localStorage بدل API
      const reportData = {
        id: Date.now().toString(),
        restaurantId: selectedRestaurant?.id ?? '1',
        restaurantName: selectedRestaurant?.name ?? 'Restaurant',
        dateFrom,
        dateTo,
        platforms: results.map(r => r.platform),
        results,
        totalKPI,
        settings,
        createdBy: 'admin@ugrow.com',
        createdAt: new Date().toISOString()
      }

      // Get existing reports
      const existingReports = JSON.parse(localStorage.getItem('ugrow_reports') || '[]')
      existingReports.push(reportData)
      localStorage.setItem('ugrow_reports', JSON.stringify(existingReports))

      alert('Report saved successfully! ✓')
    } catch {
      alert('Failed to save report')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#2E1C5F]">
              Analysis Results
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {selectedRestaurant?.name} | {dateFrom} to {dateTo}
            </p>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleExport}
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export Master Sheet
              </Button>
              <Button
                onClick={handleSaveReport}
                className="bg-[#2E1C5F] hover:bg-[#3d2878] text-white gap-2"
              >
                <Save className="h-4 w-4" />
                Save Report
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Platform Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start gap-2 bg-gray-100/50 p-1 rounded-xl overflow-x-auto">
            {/* Total Tab */}
            <TabsTrigger
              value="total"
              className="data-[state=active]:bg-[#FF305D] data-[state=active]:text-white px-6"
            >
              <span className="font-medium">Total</span>
            </TabsTrigger>

            {/* Platform Tabs */}
            {results.map(({ platform }) => {
              const platformInfo = PLATFORMS[platform]
              return (
                <TabsTrigger
                  key={platform}
                  value={platform}
                  className="data-[state=active]:bg-[#FF305D] data-[state=active]:text-white gap-2 px-4"
                >
                  <div className="relative w-5 h-5 rounded overflow-hidden">
                    <Image
                      src={platformInfo.logo}
                      alt={platformInfo.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="hidden sm:inline font-medium">{platformInfo.name}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* KPI Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              {currentKPIs ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {KPI_ORDER.map((kpiKey, index) => {
                    const config = KPI_CONFIG[kpiKey]
                    const value = currentKPIs[kpiKey]

                    return (
                      <KPICard
                        key={kpiKey}
                        kpiKey={kpiKey}
                        label={config.label}
                        value={value}
                        format={config.format}
                        description={config.description}
                        requiresSettings={'requiresSettings' in config ? config.requiresSettings : false}
                        settingsConfigured={settingsConfigured}
                        index={index}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No data available for this platform
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>

      {/* Settings Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-[#2E1C5F]/5 rounded-xl p-4 flex items-center justify-between"
      >
        <div className="text-sm text-[#2E1C5F]">
          <span className="font-medium">Analysis Settings:</span>
          <span className="ml-2">
            Actual Sales Rate: {settings.actualSalesRate}% | Food Cost Rate: {settings.foodCostRate}%
          </span>
        </div>
      </motion.div>
    </div>
  )
}