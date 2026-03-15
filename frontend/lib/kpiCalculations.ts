import type { 
  KPIResult, 
  PlatformKPIResult, 
  PlatformType, 
  AnalysisSettings,
  OrderData
} from '@/lib/types'

// Date range for filtering
interface DateRange {
  from: string // ISO date string YYYY-MM-DD
  to: string   // ISO date string YYYY-MM-DD
}

// Sheet data extracted from uploaded files
export interface SheetData {
  numOrders: number
  totalSales: number
  discount: number
  netRevenue: number
  filteredOrders?: OrderData[]
}

/**
 * Calculate all KPIs from sheet data and settings
 * 
 * Formula dependencies:
 * - earnings = totalSales - discount
 * - actualSales = totalSales * (actualSalesRate / 100)
 * - expenses = earnings - netRevenue
 * - difference = netRevenue - actualSales
 * - foodCost = actualSales * (foodCostRate / 100)
 * - differenceCost = netRevenue - foodCost
 */
export function calculateKPIs(
  sheetData: SheetData,
  settings: AnalysisSettings
): KPIResult {
  const { numOrders, totalSales, discount, netRevenue } = sheetData
  const { actualSalesRate, foodCostRate } = settings

  const earnings = totalSales - discount
  const actualSales = totalSales * (actualSalesRate / 100)
  const expenses = earnings - netRevenue
  const difference = netRevenue - actualSales
  const foodCost = actualSales * (foodCostRate / 100)
  const differenceCost = netRevenue - foodCost

  return {
    numOrders,
    totalSales,
    discount,
    earnings,
    actualSales,
    netRevenue,
    expenses,
    difference,
    foodCost,
    differenceCost
  }
}

/**
 * Calculate total KPIs from all platform results
 * NOTE: Difference and differenceCost are recalculated from totals, NOT summed
 */
export function calculateTotalKPIs(
  platformResults: PlatformKPIResult[],
  settings: AnalysisSettings
): KPIResult {
  const totals = platformResults.reduce(
    (acc, { kpi }) => ({
      numOrders: acc.numOrders + kpi.numOrders,
      totalSales: acc.totalSales + kpi.totalSales,
      discount: acc.discount + kpi.discount,
      netRevenue: acc.netRevenue + kpi.netRevenue,
      earnings: acc.earnings + kpi.earnings,
      expenses: acc.expenses + kpi.expenses,
      actualSales: acc.actualSales + kpi.actualSales,
      foodCost: acc.foodCost + kpi.foodCost
    }),
    {
      numOrders: 0,
      totalSales: 0,
      discount: 0,
      netRevenue: 0,
      earnings: 0,
      expenses: 0,
      actualSales: 0,
      foodCost: 0
    }
  )

  // Recalculate difference and differenceCost from totals
  const difference = totals.netRevenue - totals.actualSales
  const differenceCost = totals.netRevenue - totals.foodCost

  return {
    numOrders: totals.numOrders,
    totalSales: totals.totalSales,
    discount: totals.discount,
    earnings: totals.earnings,
    actualSales: totals.actualSales,
    netRevenue: totals.netRevenue,
    expenses: totals.expenses,
    difference,
    foodCost: totals.foodCost,
    differenceCost
  }
}

/**
 * Mock data for different platforms (used when actual parsing is not available)
 */
const MOCK_PLATFORM_DATA: Record<PlatformType, SheetData> = {
  talabat: {
    numOrders: 376,
    totalSales: 18420.50,
    discount: 2340.00,
    netRevenue: 12340.80
  },
  keeta: {
    numOrders: 218,
    totalSales: 9840.00,
    discount: 1230.00,
    netRevenue: 6540.20
  },
  noon: {
    numOrders: 145,
    totalSales: 7250.00,
    discount: 890.00,
    netRevenue: 4980.50
  },
  smiles: {
    numOrders: 89,
    totalSales: 4450.00,
    discount: 520.00,
    netRevenue: 3120.30
  },
  deliveroo: {
    numOrders: 267,
    totalSales: 13350.00,
    discount: 1680.00,
    netRevenue: 8940.60
  },
  careem: {
    numOrders: 198,
    totalSales: 9900.00,
    discount: 1240.00,
    netRevenue: 6580.40
  }
}

/**
 * Check if a date falls within the specified range
 */
function isDateInRange(dateStr: string, dateRange: DateRange): boolean {
  const date = new Date(dateStr)
  const from = new Date(dateRange.from)
  const to = new Date(dateRange.to)
  
  // Set times to midnight for proper comparison
  from.setHours(0, 0, 0, 0)
  to.setHours(23, 59, 59, 999)
  date.setHours(12, 0, 0, 0)
  
  return date >= from && date <= to
}

/**
 * Generate mock orders with dates for a platform
 * In production, this would be replaced with actual file parsing
 */
function generateMockOrders(platform: PlatformType, dateRange: DateRange): OrderData[] {
  const baseData = MOCK_PLATFORM_DATA[platform]
  const orders: OrderData[] = []
  
  // Generate orders across a wider date range (30 days before and after selected range)
  const startDate = new Date(dateRange.from)
  startDate.setDate(startDate.getDate() - 15)
  const endDate = new Date(dateRange.to)
  endDate.setDate(endDate.getDate() + 15)
  
  // Generate random orders across the extended date range
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const ordersPerDay = Math.ceil(baseData.numOrders / 15) // Spread orders across ~15 days
  
  for (let day = 0; day < totalDays; day++) {
    const orderDate = new Date(startDate)
    orderDate.setDate(orderDate.getDate() + day)
    
    // Random number of orders for this day (0 to ordersPerDay * 2)
    const dailyOrders = Math.floor(Math.random() * ordersPerDay * 2)
    
    for (let i = 0; i < dailyOrders; i++) {
      const subtotal = 30 + Math.random() * 120 // Random order value between 30-150
      const discount = Math.random() > 0.7 ? subtotal * (0.05 + Math.random() * 0.15) : 0 // 30% chance of discount
      const payout = (subtotal - discount) * (0.65 + Math.random() * 0.15) // Platform takes 20-35% commission
      
      orders.push({
        orderId: `${platform.toUpperCase()}-${Date.now()}-${day}-${i}`,
        date: orderDate.toISOString().split('T')[0],
        subtotal: Math.round(subtotal * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        payout: Math.round(payout * 100) / 100
      })
    }
  }
  
  return orders
}

/**
 * Filter orders by date range and calculate sheet data
 */
function filterAndCalculateSheetData(orders: OrderData[], dateRange: DateRange): SheetData {
  // Filter orders within date range
  const filteredOrders = orders.filter(order => isDateInRange(order.date, dateRange))
  
  // Calculate totals from filtered orders
  const numOrders = filteredOrders.length
  const totalSales = filteredOrders.reduce((sum, order) => sum + order.subtotal, 0)
  const discount = filteredOrders.reduce((sum, order) => sum + order.discount, 0)
  const netRevenue = filteredOrders.reduce((sum, order) => sum + order.payout, 0)
  
  return {
    numOrders,
    totalSales: Math.round(totalSales * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    netRevenue: Math.round(netRevenue * 100) / 100,
    filteredOrders
  }
}

/**
 * Parse uploaded file and extract sheet data filtered by date range
 * For now, returns mock data - in production, this would parse actual Excel/CSV files
 */
async function parseSheetFile(
  platform: PlatformType,
  files: File[],
  dateRange: DateRange
): Promise<SheetData> {
  if (platform === 'talabat') {
    const { parseTalabatSheet } = await import('./parsers/parseTalabat')
    return parseTalabatSheet(files, dateRange.from, dateRange.to)
  }

  if (platform === 'noon') {
    const { parseNoonSheet } = await import('./parsers/parseNoon')
    return parseNoonSheet(files, dateRange.from, dateRange.to)
  }

  if (platform === 'careem') {
    const { parseCareemSheet } = await import('./parsers/parseCareem')
    return parseCareemSheet(files, dateRange.from, dateRange.to)
  }

  if (platform === 'keeta') {
    const { parseKeetaSheet } = await import('./parsers/parseKeeta')
    return parseKeetaSheet(files, dateRange.from, dateRange.to)
  }

  if (platform === 'smiles') {
    const { parseSmilesSheet } = await import('./parsers/parseSmiles')
    return parseSmilesSheet(files, dateRange.from, dateRange.to)
  }

  if (platform === 'deliveroo') {
    const { parseDeliverooSheets } = await import('./parsers/parseDeliveroo')
    return parseDeliverooSheets(files, dateRange.from, dateRange.to)
  }

  // Fallback مؤقت للمنصات اللي لسه ما اتعملتش parser ليها
  return { numOrders: 0, totalSales: 0, discount: 0, netRevenue: 0 }
}

/**
 * Process all uploaded files for all platforms with date range filtering
 */
export async function processAllPlatforms(
  uploadedFiles: Record<PlatformType, File[]>,
  selectedPlatforms: PlatformType[],
  settings: AnalysisSettings,
  dateRange: DateRange
): Promise<{
  platformResults: PlatformKPIResult[]
  totalKPI: KPIResult
}> {
  const platformResults: PlatformKPIResult[] = []

  for (const platform of selectedPlatforms) {
    const files = uploadedFiles[platform]
    if (files && files.length > 0) {
      // Pass date range to filter data before calculations
      const sheetData = await parseSheetFile(platform, files, dateRange)
      const kpi = calculateKPIs(sheetData, settings)
      
      platformResults.push({
        platform,
        kpi,
        ordersData: sheetData.filteredOrders
      })
    }
  }

  const totalKPI = calculateTotalKPIs(platformResults, settings)

  return { platformResults, totalKPI }
}

/**
 * Format number as AED currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

/**
 * Format number with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-AE').format(value)
}

/**
 * KPI metadata for display
 */
export const KPI_CONFIG = {
  numOrders: {
    label: 'Number of Orders',
    format: 'number',
    icon: 'package',
    description: 'Total orders received'
  },
  totalSales: {
    label: 'Total Sales',
    format: 'currency',
    icon: 'trending-up',
    description: 'Gross order values'
  },
  discount: {
    label: 'Discount',
    format: 'currency',
    icon: 'percent',
    description: 'Vendor-funded discounts'
  },
  earnings: {
    label: 'Earnings',
    format: 'currency',
    icon: 'wallet',
    description: 'Total Sales - Discount'
  },
  actualSales: {
    label: 'Actual Sales',
    format: 'currency',
    icon: 'target',
    description: 'Based on Actual Sales Rate %',
    requiresSettings: true
  },
  netRevenue: {
    label: 'Net Revenue',
    format: 'currency',
    icon: 'banknote',
    description: 'Sum of payout amounts'
  },
  expenses: {
    label: 'Expenses',
    format: 'currency',
    icon: 'minus-circle',
    description: 'Earnings - Net Revenue'
  },
  difference: {
    label: 'Difference',
    format: 'currency',
    icon: 'scale',
    description: 'Net Revenue - Actual Sales',
    requiresSettings: true
  },
  foodCost: {
    label: 'Food Cost',
    format: 'currency',
    icon: 'utensils',
    description: 'Based on Food Cost Rate %',
    requiresSettings: true
  },
  differenceCost: {
    label: 'Difference Cost',
    format: 'currency',
    icon: 'calculator',
    description: 'Net Revenue - Food Cost',
    requiresSettings: true
  }
} as const

export type KPIKey = keyof typeof KPI_CONFIG
