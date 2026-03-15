/**
 * UGROW Internationalization Configuration
 * react-i18next setup for EN (default) and AR (RTL)
 * SRS Section 5.6 - Language Switcher requirements
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import enTranslations from './locales/en.json'
import arTranslations from './locales/ar.json'

// ============================================
// Type definitions for TypeScript support
// ============================================

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof enTranslations
    }
  }
}

// ============================================
// Supported locales configuration
// ============================================

export const SUPPORTED_LOCALES = ['en', 'ar'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: SupportedLocale = 'en'

// ============================================
// RTL Configuration
// ============================================

export const RTL_LOCALES: SupportedLocale[] = ['ar']

export function isRTL(locale: string): boolean {
  return RTL_LOCALES.includes(locale as SupportedLocale)
}

export function getTextDirection(locale: string): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr'
}

// ============================================
// Language names for display
// ============================================

export const LANGUAGE_NAMES: Record<SupportedLocale, { native: string; flag: string }> = {
  en: { native: 'English', flag: '🇬🇧' },
  ar: { native: 'العربية', flag: '🇸🇦' },
}

// ============================================
// i18n Initialization
// ============================================

const i18nConfig = {
  resources: {
    en: {
      common: enTranslations,
    },
    ar: {
      common: arTranslations,
    },
  },
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: SUPPORTED_LOCALES,
  
  // Detection order: localStorage -> navigator -> htmlTag -> default
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    lookupLocalStorage: 'ugrow-language',
    caches: ['localStorage'],
  },
  
  interpolation: {
    escapeValue: false, // React already escapes
  },
  
  react: {
    useSuspense: false, // Important for Next.js
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added removed',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'span'],
  },
  
  // Namespace configuration
  defaultNS: 'common',
  ns: ['common'],
  
  // Debug mode (set to true in development)
  debug: process.env.NODE_ENV === 'development',
  
  // Load strategy
  load: 'languageOnly' as const, // Load 'en' instead of 'en-US'
  
  // Preload languages
  preload: [DEFAULT_LOCALE],
}

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(i18nConfig)

// ============================================
// Utility Functions
// ============================================

/**
 * Change language and persist to localStorage
 */
export function changeLanguage(locale: SupportedLocale): void {
  i18n.changeLanguage(locale)
  
  // Update HTML dir attribute for RTL
  if (typeof document !== 'undefined') {
    document.documentElement.dir = getTextDirection(locale)
    document.documentElement.lang = locale
    
    // Add/remove RTL class for Tailwind
    if (isRTL(locale)) {
      document.documentElement.classList.add('rtl')
      document.documentElement.classList.remove('ltr')
    } else {
      document.documentElement.classList.add('ltr')
      document.documentElement.classList.remove('rtl')
    }
  }
}

/**
 * Get current language
 */
export function getCurrentLanguage(): SupportedLocale {
  return (i18n.language || DEFAULT_LOCALE) as SupportedLocale
}

/**
 * Toggle between EN and AR
 */
export function toggleLanguage(): void {
  const current = getCurrentLanguage()
  const next = current === 'en' ? 'ar' : 'en'
  changeLanguage(next)
}

/**
 * Initialize language on app mount
 */
export function initializeLanguage(): void {
  if (typeof document === 'undefined') return
  
  const savedLang = localStorage.getItem('ugrow-language') as SupportedLocale | null
  const lang = savedLang && SUPPORTED_LOCALES.includes(savedLang) ? savedLang : DEFAULT_LOCALE
  
  changeLanguage(lang)
}

// ============================================
// Formatting Helpers
// ============================================

/**
 * Format number with locale
 */
export function formatNumber(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale || getCurrentLanguage()).format(value)
}

/**
 * Format currency (AED) with locale
 */
export function formatCurrency(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale || getCurrentLanguage(), {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format date with locale
 */
export function formatDate(date: Date | string, locale?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale || getCurrentLanguage(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

/**
 * Format date range for reports
 */
export function formatDateRange(from: Date | string, to: Date | string, locale?: string): string {
  const fromDate = typeof from === 'string' ? new Date(from) : from
  const toDate = typeof to === 'string' ? new Date(to) : to
  
  return `${formatDate(fromDate, locale)} - ${formatDate(toDate, locale)}`
}

// ============================================
// Export configured instance
// ============================================

export default i18n