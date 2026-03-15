'use client'

import { useEffect, useState, type ElementType } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useReportsStore } from '@/stores/reportsStore'
import { useAuthStore } from '@/stores/authStore'
import { PLATFORMS, type PlatformType, type Report, type KPIResult } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { KPI_CONFIG, type KPIKey } from '@/lib/kpiCalculations'
import { useCountUp } from '@/hooks/useCountUp'
import {
  FileText,
  Download,
  Calendar,
  X,
  TrendingUp,
  Package,
  Percent,
  Wallet,
  Target,
  Banknote,
  MinusCircle,
  Scale,
  UtensilsCrossed,
  Calculator,
  ChevronRight,
  Layers,
  BarChart3
} from 'lucide-react'

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

const iconMap: Record<string, ElementType> = {
  numOrders: Package,
  totalSales: TrendingUp,
  discount: Percent,
  earnings: Wallet,
  actualSales: Target,
  netRevenue: Banknote,
  expenses: MinusCircle,
  difference: Scale,
  foodCost: UtensilsCrossed,
  differenceCost: Calculator
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDateLong = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Premium KPI Card Component for Report View
function ReportKPICard({
  kpiKey,
  label,
  value,
  format,
  index = 0,
  isTotal = false
}: {
  kpiKey: string
  label: string
  value: number
  format: 'number' | 'currency'
  index?: number
  isTotal?: boolean
}) {
  const isNegative = value < 0
  const Icon = iconMap[kpiKey] || Package

  const { formattedValue, isComplete } = useCountUp({
    end: Math.abs(value),
    duration: 1500,
    decimals: format === 'currency' ? 2 : 0,
    delay: index * 80
  })

  const displayValue =
    format === 'currency'
      ? `${isNegative ? '-' : ''}AED ${formattedValue}`
      : formattedValue

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        scale: 1.04,
        y: -8,
        transition: { duration: 0.25 }
      }}
      className={`
      relative overflow-hidden rounded-2xl p-6
      transition-all duration-300
      ${isTotal
        ? 'text-white shadow-xl'
        : 'bg-white border border-gray-100 hover:border-[#FF305D]/30 hover:shadow-xl'
      }
    `}
    style={isTotal ? { background: 'linear-gradient(135deg, #2E1C5F, #4a2d8f)' } : {}}
    >
      <div
        className={`
          absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10
          ${isTotal ? 'bg-white' : 'bg-[#FF305D]'}
        `}
      />

      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.4, delay: index * 0.06 + 0.2 }}
        className={`
        w-14 h-14 rounded-2xl flex items-center justify-center mb-5
        ${isTotal ? 'bg-white/20' : ''}
      `}
      style={!isTotal ? { background: 'linear-gradient(135deg, rgba(46,28,95,0.1), rgba(255,48,93,0.1))' } : {}}
      >
        <Icon className={`h-7 w-7 ${isTotal ? 'text-white' : 'text-[#2E1C5F]'}`} />
      </motion.div>

      <p
        className={`
          text-sm font-medium mb-2 tracking-wide
          ${isTotal ? 'text-white/70' : 'text-gray-500'}
        `}
      >
        {label}
      </p>

      <motion.p
        className={`
          text-3xl font-bold font-mono tracking-tight
          ${
            isTotal
              ? 'text-white'
              : isNegative && isComplete
                ? 'text-red-600'
                : 'text-[#2E1C5F]'
          }
        `}
      >
        {displayValue}
      </motion.p>

      <motion.div
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', transform: 'translateX(-100%)' }}
        className="absolute inset-0 -translate-x-full"
        whileHover={{ translateX: '100%' }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  )
}

// Platform Section Component
function PlatformSection({
  platform,
  kpi,
  index
}: {
  platform: PlatformType
  kpi: KPIResult
  index: number
}) {
  const platformInfo = PLATFORMS[platform]

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-shadow duration-500"
    >
      <div className="bg-linear-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 + 0.2 }}
            className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-gray-200"
          >
            <Image
              src={platformInfo.logo}
              alt={platformInfo.name}
              fill
              className="object-cover"
            />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-[#2E1C5F]">{platformInfo.name}</h3>
            <p className="text-sm text-gray-500">{kpi.numOrders} orders processed</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {KPI_ORDER.map((kpiKey, kpiIndex) => {
            const config = KPI_CONFIG[kpiKey]
            const value = kpi[kpiKey]

            return (
              <ReportKPICard
                key={kpiKey}
                kpiKey={kpiKey}
                label={config.label}
                value={value}
                format={config.format}
                index={kpiIndex}
              />
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

export default function ClientReportsPage() {
  const { user } = useAuthStore()
  const { reports, fetchReportsByRestaurant, isLoading } = useReportsStore()
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [activeTab, setActiveTab] = useState<'total' | 'platforms'>('total')

  useEffect(() => {
    if (user?.restaurantId) {
      fetchReportsByRestaurant(user.restaurantId)
    }
  }, [user?.restaurantId, fetchReportsByRestaurant])

  const myReports = reports.filter((r) => r.restaurantId === user?.restaurantId)

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-[#2E1C5F]">My Reports</h1>
        <p className="text-gray-500 mt-2 text-lg">View your restaurant analysis reports</p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl h-64 animate-pulse" />
          ))}
        </div>
      ) : myReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {myReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -8 }}
              className="group bg-white rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-[#2E1C5F]/10 transition-all duration-500 cursor-pointer"
              onClick={() => {
                setSelectedReport(report)
                setActiveTab('total')
              }}
            >
              <div className="bg-linear-to-br from-[#2E1C5F] to-[#4a2d8f] p-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full" />
                <div className="absolute -right-5 -bottom-10 w-32 h-32 bg-[#FF305D]/10 rounded-full" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <FileText className="h-7 w-7 text-white" />
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1, x: 4 }}
                      className="flex items-center gap-1 text-white/80 group-hover:text-white transition-colors"
                    >
                      <span className="text-sm font-medium">View Report</span>
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">
                    {formatDate(report.dateFrom)} - {formatDate(report.dateTo)}
                  </h3>
                  <p className="text-white/60 text-sm">{report.restaurantName}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm text-gray-500">Platforms:</span>
                  <div className="flex items-center gap-2">
                    {report.platforms.map((platform, pIndex) => {
                      const platformInfo = PLATFORMS[platform]
                      return (
                        <motion.div
                          key={platform}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + pIndex * 0.05 + 0.3 }}
                          className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                        >
                          <Image
                            src={platformInfo.logo}
                            alt={platformInfo.name}
                            fill
                            className="object-cover"
                          />
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                    <p className="text-xl font-bold text-[#2E1C5F]">{report.totalKPI.numOrders}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Total Sales</p>
                    <p className="text-xl font-bold text-[#FF305D]">
                      AED {report.totalKPI.totalSales.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-400 pt-4 border-t border-gray-100">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created: {formatDate(report.createdAt)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24 bg-linear-to-br from-gray-50 to-white rounded-3xl border border-gray-100"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-linear-to-br from-[#2E1C5F]/10 to-[#FF305D]/10 rounded-3xl flex items-center justify-center mx-auto mb-6"
          >
            <FileText className="h-10 w-10 text-[#2E1C5F]" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No reports yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Your analysis reports will appear here once created by the admin
          </p>
        </motion.div>
      )}

      <Sheet open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-none p-0 border-0 bg-linear-to-br from-gray-50 via-white to-gray-50"
        >
          <SheetTitle className="sr-only">Report Details</SheetTitle>

          <AnimatePresence>
            {selectedReport && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col"
              >
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-linear-to-r from-[#2E1C5F] to-[#4a2d8f] text-white px-8 py-6 relative overflow-hidden shrink-0"
                >
                  <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-[#FF305D]/10 rounded-full translate-y-1/2" />

                  <div className="relative z-10 max-w-400 mx-auto">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <motion.div
                          initial={{ x: -30, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="flex items-center gap-3 mb-3"
                        >
                          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Analysis Report</p>
                            <h1 className="text-2xl font-bold">{selectedReport.restaurantName}</h1>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ x: -30, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center gap-6 text-white/80"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDateLong(selectedReport.dateFrom)}</span>
                            <span className="text-white/40">to</span>
                            <span>{formatDateLong(selectedReport.dateTo)}</span>
                          </div>
                        </motion.div>
                      </div>

                      <div className="flex items-center gap-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Button
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2"
                            onClick={() => alert('Exporting to Excel...')}
                          >
                            <Download className="h-4 w-4" />
                            Export
                          </Button>
                        </motion.div>

                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.35 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/60 hover:text-white hover:bg-white/10"
                            onClick={() => setSelectedReport(null)}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-4 mt-6"
                    >
                      <button
                        onClick={() => setActiveTab('total')}
                        className={`
                          px-6 py-3 rounded-xl font-medium transition-all duration-300
                          ${
                            activeTab === 'total'
                              ? 'bg-white text-[#2E1C5F] shadow-lg'
                              : 'bg-white/10 text-white/80 hover:bg-white/20'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4" />
                          Total Summary
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('platforms')}
                        className={`
                          px-6 py-3 rounded-xl font-medium transition-all duration-300
                          ${
                            activeTab === 'platforms'
                              ? 'bg-white text-[#2E1C5F] shadow-lg'
                              : 'bg-white/10 text-white/80 hover:bg-white/20'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          By Platform ({selectedReport.platforms.length})
                        </div>
                      </button>

                      <div className="flex items-center gap-2 ml-auto">
                        {selectedReport.platforms.map((platform, pIndex) => {
                          const platformInfo = PLATFORMS[platform]
                          return (
                            <motion.div
                              key={platform}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.4 + pIndex * 0.05 }}
                              className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/20"
                            >
                              <Image
                                src={platformInfo.logo}
                                alt={platformInfo.name}
                                fill
                                className="object-cover"
                              />
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                <div className="flex-1 overflow-y-auto">
                  <div className="max-w-400 mx-auto px-8 py-10">
                    <AnimatePresence mode="wait">
                      {activeTab === 'total' ? (
                        <motion.div
                          key="total"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -30 }}
                          transition={{ duration: 0.4 }}
                          className="space-y-10"
                        >
                          <div>
                            <motion.h2
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                              className="text-2xl font-bold text-[#2E1C5F] mb-8"
                            >
                              Combined Results Across All Platforms
                            </motion.h2>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                              {KPI_ORDER.map((kpiKey, index) => {
                                const config = KPI_CONFIG[kpiKey]
                                const value = selectedReport.totalKPI[kpiKey]

                                return (
                                  <ReportKPICard
                                    key={kpiKey}
                                    kpiKey={kpiKey}
                                    label={config.label}
                                    value={value}
                                    format={config.format}
                                    index={index}
                                    isTotal={true}
                                  />
                                )
                              })}
                            </div>
                          </div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="bg-linear-to-r from-[#2E1C5F]/5 to-[#FF305D]/5 rounded-2xl p-6 border border-[#2E1C5F]/10"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-[#2E1C5F]/10 rounded-xl flex items-center justify-center">
                                <Calculator className="h-6 w-6 text-[#2E1C5F]" />
                              </div>
                              <div>
                                <p className="font-medium text-[#2E1C5F]">Analysis Settings Used</p>
                                <p className="text-gray-500">
                                  Actual Sales Rate:{' '}
                                  <span className="font-semibold text-[#FF305D]">
                                    {selectedReport.settings.actualSalesRate}%
                                  </span>{' '}
                                  | Food Cost Rate:{' '}
                                  <span className="font-semibold text-[#FF305D]">
                                    {selectedReport.settings.foodCostRate}%
                                  </span>
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="platforms"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -30 }}
                          transition={{ duration: 0.4 }}
                          className="space-y-8"
                        >
                          {selectedReport.results.map((result, index) => (
                            <PlatformSection
                              key={result.platform}
                              platform={result.platform}
                              kpi={result.kpi}
                              index={index}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    </div>
  )
}
