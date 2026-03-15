'use client'

import { motion } from 'framer-motion'
import { useCountUp } from '@/hooks/useCountUp'
import { 
  Package, 
  TrendingUp, 
  Percent, 
  Wallet, 
  Target, 
  Banknote,
  MinusCircle,
  Scale,
  UtensilsCrossed,
  Calculator,
  AlertCircle
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface KPICardProps {
  kpiKey: string
  label: string
  value: number
  format: 'number' | 'currency'
  description?: string
  requiresSettings?: boolean
  settingsConfigured?: boolean
  index?: number
}

const iconMap: Record<string, React.ElementType> = {
  'package': Package,
  'trending-up': TrendingUp,
  'percent': Percent,
  'wallet': Wallet,
  'target': Target,
  'banknote': Banknote,
  'minus-circle': MinusCircle,
  'scale': Scale,
  'utensils': UtensilsCrossed,
  'calculator': Calculator
}

const iconKeyMap: Record<string, string> = {
  numOrders: 'package',
  totalSales: 'trending-up',
  discount: 'percent',
  earnings: 'wallet',
  actualSales: 'target',
  netRevenue: 'banknote',
  expenses: 'minus-circle',
  difference: 'scale',
  foodCost: 'utensils',
  differenceCost: 'calculator'
}

export function KPICard({
  kpiKey,
  label,
  value,
  format,
  description,
  requiresSettings = false,
  settingsConfigured = true,
  index = 0
}: KPICardProps) {
  const isWarning = requiresSettings && !settingsConfigured
  const isNegative = value < 0
  
  const { formattedValue, isComplete } = useCountUp({
    end: Math.abs(value),
    duration: 1200,
    decimals: format === 'currency' ? 2 : 0,
    delay: index * 100
  })

  const Icon = iconMap[iconKeyMap[kpiKey]] || Package

  const displayValue = format === 'currency' 
    ? `${isNegative ? '-' : ''}AED ${formattedValue}`
    : formattedValue

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ scale: 1.03, y: -4 }}
      className={`
        relative bg-white rounded-xl shadow-sm border p-6
        transition-shadow duration-300 hover:shadow-lg
        ${isWarning ? 'border-amber-300 bg-amber-50/50' : 'border-gray-100'}
        ${isNegative && isComplete ? 'bg-red-50/30' : ''}
      `}
    >
      {/* Warning indicator for settings-dependent KPIs */}
      {isWarning && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-3 right-3">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Configure settings to calculate this KPI</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Icon */}
      <div className={`
        w-12 h-12 rounded-xl flex items-center justify-center mb-4
        ${isWarning ? 'bg-amber-100' : 'bg-[#2E1C5F]/10'}
      `}>
        <Icon className={`h-6 w-6 ${isWarning ? 'text-amber-600' : 'text-[#2E1C5F]'}`} />
      </div>

      {/* Label */}
      <p className="text-sm text-gray-500 mb-1">{label}</p>

      {/* Value */}
      <motion.p 
        className={`
          text-2xl font-bold font-mono
          ${isWarning ? 'text-amber-600' : isNegative && isComplete ? 'text-red-600' : 'text-[#2E1C5F]'}
        `}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isWarning ? '--' : displayValue}
      </motion.p>

      {/* Description tooltip */}
      {description && (
        <p className="text-xs text-gray-400 mt-2">{description}</p>
      )}
    </motion.div>
  )
}
