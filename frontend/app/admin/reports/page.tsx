'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useRestaurantStore } from '@/stores/restaurantStore'
import { useReportsStore } from '@/stores/reportsStore'
import { PLATFORMS, type Report, type PlatformType } from '@/lib/types'
import { formatCurrency } from '@/lib/kpiCalculations'
import { 
  FileText, 
  Calendar, 
  Eye, 
  Trash2, 
  ChevronDown,
  Search,
  AlertTriangle,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { KPIResults } from '@/components/kpi/KPIResults'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
}

// Report Card Component
function ReportCard({ 
  report, 
  onView, 
  onDelete 
}: { 
  report: Report
  onView: () => void
  onDelete: () => void
}) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCreatedAt = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <motion.div
      variants={cardVariants}
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border border-gray-100 hover:border-[#2E1C5F]/20 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-5 border-b border-gray-50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Date Range */}
                <div className="flex items-center gap-2 text-[#2E1C5F] mb-2">
                  <Calendar className="h-4 w-4 text-[#FF305D]" />
                  <span className="font-semibold">
                    {formatDate(report.dateFrom)} — {formatDate(report.dateTo)}
                  </span>
                </div>
                {/* Created At */}
                <p className="text-xs text-gray-500">
                  Created on {formatCreatedAt(report.createdAt)}
                </p>
              </div>
              
              {/* Total Orders Badge */}
              <div className="bg-[#2E1C5F]/5 rounded-lg px-3 py-1.5">
                <p className="text-xs text-gray-500">Orders</p>
                <p className="text-lg font-bold text-[#2E1C5F]">{report.totalKPI.numOrders}</p>
              </div>
            </div>
          </div>

          {/* Platforms */}
          <div className="px-5 py-4 bg-gray-50/50">
            <p className="text-xs text-gray-500 mb-3">Platforms Included</p>
            <div className="flex flex-wrap gap-2">
              {report.platforms.map((platform) => (
                <motion.div
                  key={platform}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 border border-gray-100"
                >
                  <Image
                    src={PLATFORMS[platform].logo}
                    alt={PLATFORMS[platform].name}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                  <span className="text-xs font-medium text-gray-700">
                    {PLATFORMS[platform].name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Total Sales</p>
              <p className="text-sm font-semibold text-[#2E1C5F]">
                {formatCurrency(report.totalKPI.totalSales)}
              </p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Net Revenue</p>
              <p className="text-sm font-semibold text-emerald-600">
                {formatCurrency(report.totalKPI.netRevenue)}
              </p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Expenses</p>
              <p className="text-sm font-semibold text-red-500">
                {formatCurrency(report.totalKPI.expenses)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 flex gap-2 border-t border-gray-100 bg-white">
            <Button
              onClick={onView}
              className="flex-1 gap-2 bg-[#2E1C5F] hover:bg-[#2E1C5F]/90"
            >
              <Eye className="h-4 w-4" />
              View Report
            </Button>
            <Button
              onClick={onDelete}
              variant="outline"
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Delete Confirmation Dialog
function DeleteConfirmDialog({
  open,
  onOpenChange,
  report,
  onConfirm
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: Report | null
  onConfirm: () => void
}) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg">Delete Report</DialogTitle>
              <DialogDescription className="text-sm">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        {report && (
          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <div className="flex items-center gap-2 text-[#2E1C5F] mb-2">
              <Calendar className="h-4 w-4 text-[#FF305D]" />
              <span className="font-medium">
                {formatDate(report.dateFrom)} — {formatDate(report.dateTo)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {report.platforms.map((platform) => (
                <span 
                  key={platform}
                  className="text-xs bg-white rounded-full px-2 py-0.5 border border-gray-200"
                >
                  {PLATFORMS[platform].name}
                </span>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// View Report Modal
function ViewReportModal({
  open,
  onOpenChange,
  report
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: Report | null
}) {
  if (!report) return null

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl text-[#2E1C5F]">
                {report.restaurantName}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-[#FF305D]" />
                {formatDate(report.dateFrom)} — {formatDate(report.dateTo)}
              </DialogDescription>
            </div>
            <div className="flex gap-1">
              {report.platforms.map((platform) => (
                <Image
                  key={platform}
                  src={PLATFORMS[platform].logo}
                  alt={PLATFORMS[platform].name}
                  width={28}
                  height={28}
                  className="object-contain"
                />
              ))}
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <KPIResults 
            results={report.results} 
            totalKPI={report.totalKPI}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main Page Component
export default function SavedReportsPage() {
  const { restaurants } = useRestaurantStore()
  const { reports, deleteReport, getReportsByRestaurant } = useReportsStore()
  
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  // Get filtered reports
  const filteredReports = useMemo(() => {
    if (!selectedRestaurantId) return []
    
    let results = getReportsByRestaurant(selectedRestaurantId)
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter(report => 
        report.platforms.some(p => PLATFORMS[p].name.toLowerCase().includes(query)) ||
        report.dateFrom.includes(query) ||
        report.dateTo.includes(query)
      )
    }
    
    return results
  }, [selectedRestaurantId, searchQuery, getReportsByRestaurant, reports])

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    setViewModalOpen(true)
  }

  const handleDeleteClick = (report: Report) => {
    setSelectedReport(report)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedReport) {
      deleteReport(selectedReport.id)
      setDeleteDialogOpen(false)
      setSelectedReport(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#FF305D]/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-[#FF305D]" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#2E1C5F]">
            Saved Reports
          </h1>
        </div>
        <p className="text-gray-600 ml-13">
          View and manage saved analysis reports for your restaurants
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Restaurant Select */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Restaurant
            </label>
            <Select
              value={selectedRestaurantId}
              onValueChange={setSelectedRestaurantId}
            >
              <SelectTrigger className="w-full h-12 border-gray-200">
                <SelectValue placeholder="Choose a restaurant..." />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    <div className="flex items-center gap-2">
                      <span>{restaurant.name}</span>
                      <span className={`
                        text-xs px-2 py-0.5 rounded-full
                        ${restaurant.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                          restaurant.status === 'hold' ? 'bg-amber-100 text-amber-700' : 
                          'bg-gray-100 text-gray-500'}
                      `}>
                        {restaurant.status}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          {selectedRestaurantId && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              className="lg:w-80"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Reports
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by platform or date..."
                  className="pl-10 h-12 border-gray-200"
                />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Reports Grid */}
      <AnimatePresence mode="wait">
        {!selectedRestaurantId ? (
          // Empty state - No restaurant selected
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FileText className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Select a Restaurant
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Choose a restaurant from the dropdown above to view its saved reports.
            </p>
          </motion.div>
        ) : filteredReports.length === 0 ? (
          // Empty state - No reports
          <motion.div
            key="no-reports"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FileText className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No Reports Found
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              {searchQuery 
                ? "No reports match your search criteria. Try a different search term."
                : "This restaurant doesn't have any saved reports yet. Create one from the Data Analysis section."}
            </p>
          </motion.div>
        ) : (
          // Reports grid
          <motion.div
            key="reports"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onView={() => handleViewReport(report)}
                onDelete={() => handleDeleteClick(report)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogs */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        report={selectedReport}
        onConfirm={handleConfirmDelete}
      />

      <ViewReportModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        report={selectedReport}
      />
    </div>
  )
}
