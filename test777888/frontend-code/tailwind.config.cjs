/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Saudia Corporate Identity Colors
        primary: {
          DEFAULT: '#004C45', // Deep Green
          light: '#006B61',
          dark: '#00332E',
        },
        secondary: {
          DEFAULT: '#B4975A', // Gold/Sand
          light: '#C5AF7B',
          dark: '#967D45',
        },
        accent: {
          DEFAULT: '#007A33', // Success Green
          error: '#D32F2F',
          warning: '#F57C00',
          info: '#0288D1',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      },
      fontFamily: {
        // Supporting both English (Sans) and Arabic (Kufi/Naskh style)
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
        arabic: ['IBM Plex Sans Arabic', 'Noto Sans Arabic', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [
    // Required for RTL support in Tailwind (logical properties)
    // Note: Tailwind v3.0+ includes native 'start' and 'end' support
    // which maps to 'left'/'right' based on the 'dir' attribute.
  ],
  // Ensure RTL support for utilities
  important: true,
  // Enable logical properties for layout (start/end instead of left/right)
  corePlugins: {
    float: false,
    clear: false,
  }
}