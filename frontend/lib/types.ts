// User Types
export type UserRole = 'admin' | 'client'
export type AccountStatus = 'active' | 'hold' | 'deactivated'

export interface User {
  id: string
  email: string
  role: UserRole
  status: AccountStatus
  restaurantId?: string // For client users
  name?: string
}

// Platform Types
export type PlatformType = 'talabat' | 'keeta' | 'noon' | 'smiles' | 'deliveroo' | 'careem'

export interface PlatformCredential {
  platform: PlatformType
  email: string
  password: string
  tabletEmail?: string // For Deliveroo tablet access
  tabletPassword?: string
}

export interface PlatformInfo {
  id: PlatformType
  name: string
  logo: string
  color: string
  fileTypes: string[]
  description: string
}

export const PLATFORMS: Record<PlatformType, PlatformInfo> = {
  talabat: {
    id: 'talabat',
    name: 'Talabat',
    logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Talabat-S0rPZpi9CGespLsx7c4vPjRzrtG0Ks.png',
    color: '#FF305D',
    fileTypes: ['.xlsx'],
    description: 'Talabat food delivery platform'
  },
  keeta: {
    id: 'keeta',
    name: 'Keeta',
    logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Keeta-Gs6vjIV2B6HtzC9O4fiq8PuZE40mTP.png',
    color: '#FF305D',
    fileTypes: ['.xlsx'],
    description: 'Keeta food delivery platform'
  },
  noon: {
    id: 'noon',
    name: 'Noon Food',
    logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Noon-wny3gDaOcP9HSxnZg6ZX5PP970ayMM.png',
    color: '#FF305D',
    fileTypes: ['.csv'],
    description: 'Noon Food delivery platform'
  },
  smiles: {
    id: 'smiles',
    name: 'Smiles',
    logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Smiles-S13MhdNgulYz2uv9EY32YiV3NTHeqj.png',
    color: '#FF305D',
    fileTypes: ['.xls', '.xlsx'],
    description: 'Smiles UAE loyalty platform'
  },
  deliveroo: {
    id: 'deliveroo',
    name: 'Deliveroo',
    logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Delivroo-2CaepLMMWYnOXDechocmMkF4KOC1hM.png',
    color: '#FF305D',
    fileTypes: ['.csv'],
    description: 'Deliveroo food delivery platform'
  },
  careem: {
    id: 'careem',
    name: 'Careem',
    logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Careem-LKthnUWq3oVym44K1Mb54EEzvg3Hzk.png',
    color: '#FF305D',
    fileTypes: ['.csv', '.xlsx'],
    description: 'Careem food delivery platform'
  }
}

// Restaurant Types
export interface Restaurant {
  id: string
  name: string
  ownerName?: string
  ownerPhone?: string
  managerName?: string
  managerPhone?: string
  area?: string
  address?: string
  googleMapsUrl?: string
  profileImage?: string
  platforms: PlatformType[]
  credentials: PlatformCredential[]
  status: AccountStatus
  clientUsername?: string
  clientPassword?: string
  createdAt: string
  updatedAt: string
}

// KPI Types
export interface KPIResult {
  numOrders: number
  totalSales: number
  discount: number
  earnings: number
  actualSales: number
  netRevenue: number
  expenses: number
  difference: number
  foodCost: number
  differenceCost: number
}

export interface PlatformKPIResult {
  platform: PlatformType
  kpi: KPIResult
  ordersData?: OrderData[]
}

export interface OrderData {
  orderId: string
  date: string
  subtotal: number
  discount: number
  payout: number
}

// Analysis Settings
export interface AnalysisSettings {
  actualSalesRate: number // 0-100
  foodCostRate: number // 0-100
}

// Report Types
export interface Report {
  id: string
  restaurantId: string
  restaurantName: string
  dateFrom: string
  dateTo: string
  platforms: PlatformType[]
  results: PlatformKPIResult[]
  totalKPI: KPIResult
  settings: AnalysisSettings
  createdAt: string
  createdBy: string
}

// Analysis Wizard State
export interface AnalysisState {
  step: number
  selectedRestaurant: Restaurant | null
  dateFrom: string
  dateTo: string
  selectedPlatforms: PlatformType[]
  uploadedFiles: Record<PlatformType, File[]>
  settings: AnalysisSettings
  results: PlatformKPIResult[]
  totalKPI: KPIResult | null
  isProcessing: boolean
}

// Form Types
export interface LoginForm {
  emailPrefix: string
  password: string
}

export interface RestaurantForm {
  name: string
  ownerName: string
  ownerPhone: string
  managerName: string
  managerPhone: string
  area: string
  address: string
  googleMapsUrl: string
  profileImage?: File | string
  platforms: PlatformType[]
  credentials: PlatformCredential[]
  status: AccountStatus
  clientUsername: string
  clientPassword: string
}

// Navigation
export interface NavItem {
  label: string
  href: string
  icon: string
}


