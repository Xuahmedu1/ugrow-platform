/**
 * UGROW Language Store
 * Zustand store for language state management
 * Integrates with react-i18next
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { 
  SUPPORTED_LOCALES, 
  type SupportedLocale, 
  DEFAULT_LOCALE,
  isRTL,
  getTextDirection 
} from '@/i18n/config'

interface LanguageState {
  locale: SupportedLocale
  isRTL: boolean
  direction: 'ltr' | 'rtl'
  setLocale: (locale: SupportedLocale) => void
  toggleLocale: () => void
  initialize: () => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_LOCALE,
      isRTL: false,
      direction: 'ltr',
      
      setLocale: (locale: SupportedLocale) => {
        const rtl = isRTL(locale)
        const dir = getTextDirection(locale)
        
        set({
          locale,
          isRTL: rtl,
          direction: dir,
        })
        
        // Update document attributes if in browser
        if (typeof document !== 'undefined') {
          document.documentElement.lang = locale
          document.documentElement.dir = dir
          
          // Update classes for Tailwind
          if (rtl) {
            document.documentElement.classList.add('rtl')
            document.documentElement.classList.remove('ltr')
          } else {
            document.documentElement.classList.add('ltr')
            document.documentElement.classList.remove('rtl')
          }
        }
        
        // Update i18n if available
        if (typeof window !== 'undefined') {
          const i18n = (window as unknown as { __i18n?: { changeLanguage: (l: string) => void } }).__i18n
          i18n?.changeLanguage(locale)
        }
      },
      
      toggleLocale: () => {
        const current = get().locale
        const next: SupportedLocale = current === 'en' ? 'ar' : 'en'
        get().setLocale(next)
      },
      
      initialize: () => {
        // Check for stored preference or browser preference
        const stored = get().locale
        if (stored && SUPPORTED_LOCALES.includes(stored)) {
          get().setLocale(stored)
        }
      },
    }),
    {
      name: 'ugrow-language-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ locale: state.locale }),
    }
  )
)

// Selector hooks for better performance
export const useLocale = () => useLanguageStore((state) => state.locale)
export const useIsRTL = () => useLanguageStore((state) => state.isRTL)
export const useDirection = () => useLanguageStore((state) => state.direction)
const translations: Record<string, string> = {
  'nav.restaurants': 'Restaurant Management',
  'nav.analysis': 'Data Analysis',
  'nav.reports': 'My Reports',
  'nav.savedReports': 'Saved Reports',
  'nav.credentials': 'Platform Credentials',
  'nav.about': 'About UGROW',
  'nav.contact': 'Contact',
  'nav.logout': 'Logout',

  'auth.login': 'Login',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.forgotPassword': 'Forgot Password?',
  'auth.invalidCredentials': 'Invalid email or password',
  'auth.accountOnHold': 'Your account is currently on hold. Please contact support.',
  'auth.accountDeactivated': 'Your account has been deactivated. Please contact support.',

  'restaurants.title': 'Restaurant Management',
  'restaurants.add': 'Add Restaurant',
  'restaurants.edit': 'Edit Restaurant',
  'restaurants.delete': 'Delete Restaurant',
  'restaurants.view': 'View Details',
  'restaurants.changeStatus': 'Change Status',
  'restaurants.active': 'Active',
  'restaurants.hold': 'On Hold',
  'restaurants.deactivated': 'Deactivated',

  'analysis.title': 'Data Analysis',
  'analysis.selectRestaurant': 'Select Restaurant',
  'analysis.selectDateRange': 'Select Date Range',
  'analysis.selectPlatforms': 'Select Platforms',
  'analysis.uploadSheets': 'Upload Sheets',
  'analysis.from': 'From',
  'analysis.to': 'To',
  'analysis.next': 'Next',
  'analysis.back': 'Back',
  'analysis.process': 'Process Data',
  'analysis.settings': 'Settings',
  'analysis.actualSalesRate': 'Actual Sales Rate',
  'analysis.foodCostRate': 'Food Cost Rate',

  'kpi.numOrders': 'Number of Orders',
  'kpi.totalSales': 'Total Sales',
  'kpi.discount': 'Discount',
  'kpi.earnings': 'Earnings',
  'kpi.actualSales': 'Actual Sales',
  'kpi.netRevenue': 'Net Revenue',
  'kpi.expenses': 'Expenses',
  'kpi.difference': 'Difference',
  'kpi.foodCost': 'Food Cost',
  'kpi.differenceCost': 'Difference Cost',
  'kpi.total': 'Total',

  'action.save': 'Save',
  'action.cancel': 'Cancel',
  'action.export': 'Export to Excel',
  'action.exportMaster': 'Export Master Sheet',
  'action.saveReport': 'Save Report',

  'common.loading': 'Loading...',
  'common.noData': 'No data available',
  'common.search': 'Search...',
  'common.currency': 'AED',
  'common.comingSoon': 'Coming Soon'
}

export const useTranslation = () => {
  const t = (key: string): string => translations[key] || key
  return { t }
}