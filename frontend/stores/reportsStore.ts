import { create } from 'zustand'
import type { Report } from '@/lib/types'

const API_URL = 'http://localhost:8000'

// Mock data fallback لما السيرفر مش شغال
const MOCK_REPORTS: Report[] = [
  {
    id: 'report-1',
    restaurantId: 'rest-1',
    restaurantName: 'Sharea Alkebda',
    dateFrom: '2026-02-01',
    dateTo: '2026-02-28',
    platforms: ['talabat', 'keeta', 'noon', 'deliveroo'],
    results: [
      {
        platform: 'talabat',
        kpi: {
          numOrders: 376,
          totalSales: 18420.50,
          discount: 2340.00,
          earnings: 16080.50,
          actualSales: 12280.33,
          netRevenue: 12340.80,
          expenses: 3739.70,
          difference: 60.47,
          foodCost: 3684.10,
          differenceCost: 8656.70
        }
      },
      {
        platform: 'keeta',
        kpi: {
          numOrders: 218,
          totalSales: 9840.00,
          discount: 1230.00,
          earnings: 8610.00,
          actualSales: 6560.00,
          netRevenue: 6540.20,
          expenses: 2069.80,
          difference: -19.80,
          foodCost: 1968.00,
          differenceCost: 4572.20
        }
      },
      {
        platform: 'noon',
        kpi: {
          numOrders: 145,
          totalSales: 7250.00,
          discount: 890.00,
          earnings: 6360.00,
          actualSales: 4833.33,
          netRevenue: 4980.50,
          expenses: 1379.50,
          difference: 147.17,
          foodCost: 1450.00,
          differenceCost: 3530.50
        }
      },
      {
        platform: 'deliveroo',
        kpi: {
          numOrders: 267,
          totalSales: 13350.00,
          discount: 1680.00,
          earnings: 11670.00,
          actualSales: 8900.00,
          netRevenue: 8940.60,
          expenses: 2730.00,
          difference: 40.60,
          foodCost: 2670.00,
          differenceCost: 6270.60
        }
      }
    ],
    totalKPI: {
      numOrders: 1006,
      totalSales: 48860.50,
      discount: 6140.00,
      earnings: 42720.50,
      actualSales: 32573.66,
      netRevenue: 32802.10,
      expenses: 9919.00,
      difference: 228.44,
      foodCost: 9772.10,
      differenceCost: 23030.00
    },
    settings: { actualSalesRate: 50, foodCostRate: 30 },
    createdAt: '2026-03-01T10:00:00Z',
    createdBy: 'admin@ugrow.com'
  },
  {
    id: 'report-2',
    restaurantId: 'rest-1',
    restaurantName: 'Sharea Alkebda',
    dateFrom: '2026-01-01',
    dateTo: '2026-01-31',
    platforms: ['talabat', 'noon'],
    results: [
      {
        platform: 'talabat',
        kpi: {
          numOrders: 342,
          totalSales: 16780.00,
          discount: 2100.00,
          earnings: 14680.00,
          actualSales: 11186.67,
          netRevenue: 11240.60,
          expenses: 3439.40,
          difference: 53.93,
          foodCost: 3356.00,
          differenceCost: 7884.60
        }
      },
      {
        platform: 'noon',
        kpi: {
          numOrders: 156,
          totalSales: 7890.00,
          discount: 980.00,
          earnings: 6910.00,
          actualSales: 5260.00,
          netRevenue: 5284.20,
          expenses: 1625.80,
          difference: 24.20,
          foodCost: 1578.00,
          differenceCost: 3706.20
        }
      }
    ],
    totalKPI: {
      numOrders: 498,
      totalSales: 24670.00,
      discount: 3080.00,
      earnings: 21590.00,
      actualSales: 16446.67,
      netRevenue: 16524.80,
      expenses: 5065.20,
      difference: 78.13,
      foodCost: 4934.00,
      differenceCost: 11590.80
    },
    settings: { actualSalesRate: 50, foodCostRate: 30 },
    createdAt: '2026-02-01T09:15:00Z',
    createdBy: 'admin@ugrow.com'
  },
  {
    id: 'report-3',
    restaurantId: 'rest-2',
    restaurantName: 'Bites Kitchen',
    dateFrom: '2026-02-01',
    dateTo: '2026-02-28',
    platforms: ['talabat', 'careem', 'smiles'],
    results: [
      {
        platform: 'talabat',
        kpi: {
          numOrders: 198,
          totalSales: 9240.00,
          discount: 1100.00,
          earnings: 8140.00,
          actualSales: 6160.00,
          netRevenue: 6180.40,
          expenses: 1960.00,
          difference: 20.40,
          foodCost: 1848.00,
          differenceCost: 4332.40
        }
      },
      {
        platform: 'careem',
        kpi: {
          numOrders: 134,
          totalSales: 6700.00,
          discount: 820.00,
          earnings: 5880.00,
          actualSales: 4466.67,
          netRevenue: 4480.30,
          expenses: 1399.70,
          difference: 13.63,
          foodCost: 1340.00,
          differenceCost: 3140.30
        }
      },
      {
        platform: 'smiles',
        kpi: {
          numOrders: 89,
          totalSales: 4450.00,
          discount: 520.00,
          earnings: 3930.00,
          actualSales: 2966.67,
          netRevenue: 3120.30,
          expenses: 809.70,
          difference: 153.63,
          foodCost: 890.00,
          differenceCost: 2230.30
        }
      }
    ],
    totalKPI: {
      numOrders: 421,
      totalSales: 20390.00,
      discount: 2440.00,
      earnings: 17950.00,
      actualSales: 13593.33,
      netRevenue: 13781.00,
      expenses: 4169.00,
      difference: 187.67,
      foodCost: 4078.00,
      differenceCost: 9703.00
    },
    settings: { actualSalesRate: 50, foodCostRate: 30 },
    createdAt: '2026-03-02T11:30:00Z',
    createdBy: 'admin@ugrow.com'
  }
]

interface ReportsState {
  reports: Report[]
  isLoading: boolean
  error: string | null
  fetchReportsByRestaurant: (restaurantId: string) => Promise<void>
  fetchAllReports: () => Promise<void>
  getReportsByRestaurant: (restaurantId: string) => Report[]
  getReportById: (id: string) => Report | undefined
  deleteReport: (id: string) => Promise<void>
}

export const useReportsStore = create<ReportsState>()((set, get) => ({
  // ابدأ بالـ mock data عشان الـ UI يشتغل فوراً
  reports: MOCK_REPORTS,
  isLoading: false,
  error: null,

  fetchReportsByRestaurant: async (restaurantId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/api/reports/restaurant/${restaurantId}`)
      if (!response.ok) throw new Error('Failed to fetch reports')
      const data = await response.json()
      set({ reports: data.reports as Report[], isLoading: false })
    } catch {
      // السيرفر مش شغال — استخدم الـ mock data الموجودة
      set({ isLoading: false })
    }
  },

  fetchAllReports: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/api/reports/all`)
      if (!response.ok) throw new Error('Failed to fetch reports')
      const data = await response.json()
      set({ reports: data.reports as Report[], isLoading: false })
    } catch {
      // السيرفر مش شغال — استخدم الـ mock data الموجودة
      set({ isLoading: false })
    }
  },

  getReportsByRestaurant: (restaurantId: string) => {
    return get().reports
      .filter(r => r.restaurantId === restaurantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getReportById: (id: string) => {
    return get().reports.find(r => r.id === id)
  },

  deleteReport: async (id: string) => {
    // امسح locally فوراً
    set(state => ({ reports: state.reports.filter(r => r.id !== id) }))
    try {
      await fetch(`${API_URL}/api/reports/${id}`, { method: 'DELETE' })
    } catch {
      // لو السيرفر مش شغال، الـ local delete كافي
    }
  },
}))