'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface SplashScreenProps {
  isVisible: boolean
  onComplete: () => void
}

export function SplashScreen({ isVisible, onComplete }: SplashScreenProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white cursor-pointer"
          onClick={onComplete}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
            }}
            exit={{ 
              opacity: 0, 
              y: -50, 
              scale: 0.9 
            }}
            transition={{ 
              duration: 0.6, 
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8
              }}
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-7HgpWbAEIbyNtRTaMpX3iSMXBsdZVs.png"
                alt="U.GROW - Expand, Enhance, Earn"
                width={400}
                height={200}
                className="object-contain"
                priority
              />
            </motion.div>
            
            {/* Loading indicator */}
            <motion.div
              className="mt-12 flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#FF305D]"
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
            
            {/* Click to continue hint */}
            <motion.p
              className="mt-8 text-sm text-[#2E1C5F]/50 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              Click anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
