'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { useAnalysisStore } from '@/stores/analysisStore'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DateRangeSelect() {
  const { dateFrom, dateTo, setDateRange, nextStep, prevStep } = useAnalysisStore()
  
  const [fromDate, setFromDate] = useState<Date | undefined>(
    dateFrom ? new Date(dateFrom) : undefined
  )
  const [toDate, setToDate] = useState<Date | undefined>(
    dateTo ? new Date(dateTo) : undefined
  )

  const handleFromDateSelect = (date: Date | undefined) => {
    setFromDate(date)
    if (date) {
      setDateRange(format(date, 'yyyy-MM-dd'), dateTo)
    }
  }

  const handleToDateSelect = (date: Date | undefined) => {
    setToDate(date)
    if (date) {
      setDateRange(dateFrom, format(date, 'yyyy-MM-dd'))
    }
  }

  const handleContinue = () => {
    if (fromDate && toDate) {
      setDateRange(format(fromDate, 'yyyy-MM-dd'), format(toDate, 'yyyy-MM-dd'))
      nextStep()
    }
  }

  const isValidRange = fromDate && toDate && fromDate <= toDate

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-[#2E1C5F]">Select Date Range</h2>
        <p className="text-gray-500 mt-1">Choose the period for data analysis</p>
      </div>

      {/* Date Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        {/* From Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2E1C5F]">From Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12",
                  !fromDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, "PPP") : "Select start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={handleFromDateSelect}
                disabled={(date) => toDate ? date > toDate : false}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* To Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2E1C5F]">To Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12",
                  !toDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate ? format(toDate, "PPP") : "Select end date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={handleToDateSelect}
                disabled={(date) => fromDate ? date < fromDate : false}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Selected Range Preview */}
      {isValidRange && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-[#2E1C5F]/5 rounded-lg max-w-2xl"
        >
          <p className="text-sm text-[#2E1C5F]">
            <span className="font-medium">Selected Period:</span>{' '}
            {format(fromDate, 'MMMM d, yyyy')} - {format(toDate, 'MMMM d, yyyy')}
          </p>
        </motion.div>
      )}

      {/* Warning if invalid range */}
      {fromDate && toDate && fromDate > toDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-100 rounded-lg max-w-2xl"
        >
          <p className="text-sm text-red-600">
            End date must be after start date
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
          disabled={!isValidRange}
          className="bg-[#FF305D] hover:bg-[#e02850] text-white gap-2 px-6"
        >
          Continue
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}
