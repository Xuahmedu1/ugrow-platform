'use client'

import { motion } from 'framer-motion'
import { useTranslation } from '@/stores/languageStore'
import { Clock, Mail, MessageSquare } from 'lucide-react'

export default function ContactPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Icon */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ 
            repeat: Infinity, 
            repeatType: 'reverse', 
            duration: 2,
            ease: 'easeInOut'
          }}
          className="w-24 h-24 bg-[#FF305D]/10 rounded-full flex items-center justify-center mx-auto"
        >
          <MessageSquare className="h-12 w-12 text-[#FF305D]" />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#2E1C5F]">Contact Us</h1>

        {/* Coming Soon Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 bg-[#FF305D]/10 text-[#FF305D] px-4 py-2 rounded-full"
        >
          <Clock className="h-4 w-4" />
          <span className="font-medium">{t('common.comingSoon')}</span>
        </motion.div>

        {/* Description */}
        <p className="text-gray-500 max-w-md mx-auto">
          Our contact form is currently being developed. In the meantime, 
          please reach out to your account manager or email us directly.
        </p>

        {/* Email Link */}
        <motion.a
          href="mailto:support@ugrow.com"
          className="inline-flex items-center gap-2 text-[#2E1C5F] hover:text-[#FF305D] transition-colors font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Mail className="h-5 w-5" />
          support@ugrow.com
        </motion.a>

        {/* Decorative Elements */}
        <div className="flex justify-center gap-4 pt-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-[#FF305D] rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
