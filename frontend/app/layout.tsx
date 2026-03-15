/**
 * UGROW Root Layout
 * Next.js app router root layout with i18n, theme, and RTL support
 */

import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import './globals.css'

// ============================================
// Metadata
// ============================================

export const metadata: Metadata = {
  title: {
    default: 'UGROW - Marketing & Data Analysis Platform',
    template: '%s | UGROW',
  },
  description: 'Premium marketing and restaurant data analysis platform for UAE-based agencies',
  keywords: ['restaurant', 'analytics', 'marketing', 'data analysis', 'UAE', 'food delivery'],
  authors: [{ name: 'UGROW' }],
  creator: 'UGROW',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    url: '/',
    siteName: 'UGROW',
    title: 'UGROW - Marketing & Data Analysis Platform',
    description: 'Premium marketing and restaurant data analysis platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UGROW',
    description: 'Marketing & Data Analysis Platform',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#2E1C5F' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

// ============================================
// Font Configuration
// ============================================

// Import fonts based on SRS requirements
// Using DM Sans for English, Noto Sans Arabic for Arabic
import { DM_Sans, Noto_Sans_Arabic } from 'next/font/google'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-arabic',
  display: 'swap',
})

// ============================================
// Root Layout Component
// ============================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${dmSans.variable} ${notoSansArabic.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-white font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}