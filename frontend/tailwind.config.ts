/**
 * UGROW Tailwind CSS Configuration
 * Tailwind v4 with brand colors and RTL support
 */

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ==========================================
      // Brand Colors (SRS 1.2)
      // ==========================================
      colors: {
        // Primary brand colors
        'ugrow-white': '#FFFFFF',
        'ugrow-red': '#FF305D',
        'ugrow-purple': '#2E1C5F',
        
        // Extended palette
        'ugrow-light-purple': '#f4f0ff',
        'ugrow-gray': '#f8f8f8',
        'ugrow-border': '#e0e0e0',
        'ugrow-text': '#222222',
        
        // Semantic colors
        'status-active': '#22c55e',
        'status-hold': '#f59e0b',
        'status-deactivated': '#ef4444',
      },
      
      // ==========================================
      // Typography
      // ==========================================
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-noto-arabic)', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      
      // ==========================================
      // Animation
      // ==========================================
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'count-up': 'countUp 1.2s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      
      // ==========================================
      // Spacing & Sizing
      // ==========================================
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // ==========================================
      // Border Radius
      // ==========================================
      borderRadius: {
        '4xl': '2rem',
      },
      
      // ==========================================
      // Box Shadow
      // ==========================================
      boxShadow: {
        'card': '0 2px 8px rgba(46, 28, 95, 0.08)',
        'card-hover': '0 8px 24px rgba(46, 28, 95, 0.12)',
        'purple': '0 4px 14px rgba(46, 28, 95, 0.15)',
        'red': '0 4px 14px rgba(255, 48, 93, 0.15)',
      },
    },
  },
  
  // ==========================================
  // Plugins
  // ==========================================
  plugins: [
    // RTL plugin for Arabic support
    require('tailwindcss-rtl'),
  ],
  
  // ==========================================
  // Future Flags (Tailwind v3/v4 compatibility)
  // ==========================================
  future: {
    hoverOnlyWhenSupported: true,
  },
}

export default config