/**
 * UGROW Language Switcher
 * SRS 5.6 - Language switcher with EN/AR icons
 * Rotate + fade animation between languages
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  SUPPORTED_LOCALES, 
  type SupportedLocale, 
  isRTL,
  getTextDirection,
  LANGUAGE_NAMES 
} from '@/i18n/config'
import { useLanguageStore } from '@/stores/languageStore'
import Image from 'next/image'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const { locale, setLocale } = useLanguageStore()

  const currentLocale = (i18n.language || 'en') as SupportedLocale
  const isArabic = isRTL(currentLocale)

  const toggleLanguage = () => {
    const newLocale: SupportedLocale = currentLocale === 'en' ? 'ar' : 'en'
    
    // Update i18n
    i18n.changeLanguage(newLocale)
    
    // Update store (persists to localStorage)
    setLocale(newLocale)
    
    // Update HTML attributes
    if (typeof document !== 'undefined') {
      document.documentElement.dir = getTextDirection(newLocale)
      document.documentElement.lang = newLocale
      
      // Add/remove RTL classes for Tailwind
      if (isRTL(newLocale)) {
        document.documentElement.classList.add('rtl')
        document.documentElement.classList.remove('ltr')
      } else {
        document.documentElement.classList.add('ltr')
        document.documentElement.classList.remove('rtl')
      }
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="relative w-10 h-10 rounded-full overflow-hidden hover:bg-[#f4f0ff] transition-colors duration-200"
            aria-label={t('navigation.switchToArabic')}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentLocale}
                initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {currentLocale === 'en' ? (
                  // English icon (UK flag style)
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-600 via-white to-red-500 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-blue-800">
                    EN
                  </div>
                ) : (
                  // Arabic icon (Saudi flag style)
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-green-600 via-white to-green-600 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-green-800">
                    ع
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {isArabic 
              ? t('navigation.switchToEnglish') 
              : t('navigation.switchToArabic')}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Alternative version using image icons if available in public folder
export function LanguageSwitcherWithImages() {
  const { i18n, t } = useTranslation()
  const { setLocale } = useLanguageStore()

  const currentLocale = (i18n.language || 'en') as SupportedLocale
  const targetLocale = currentLocale === 'en' ? 'ar' : 'en'

  const handleSwitch = () => {
    setLocale(targetLocale)
    i18n.changeLanguage(targetLocale)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwitch}
            className="relative w-10 h-10 p-0 overflow-hidden hover:bg-[#f4f0ff] transition-colors duration-200"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentLocale}
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Image
                  src={currentLocale === 'en' ? '/en_Lang.png' : '/ar_Lang.png'}
                  alt={LANGUAGE_NAMES[currentLocale].native}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{LANGUAGE_NAMES[targetLocale].native}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}