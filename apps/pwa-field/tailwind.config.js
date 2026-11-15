/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          base: '#E5E9EE',
          surface: '#F5F7FA',
        },
        sidebar: {
          base: '#263442',
          surface: '#1E2B37',
          border: '#334454',
          hover: '#2F4152',
          muted: '#94A3B8',
          text: '#FFFFFF',
        },
        surface: {
          card: '#FFFFFF',
          sub: '#F5F7FA',
          inset: '#F8FAFC',
          border: '#E2E8F0',
        },
        brand: {
          primary: '#0284C7',
          sky: '#38BDF8',
          glow: 'rgba(56, 189, 248, 0.35)',
          soft: '#E0F2FE',
        },
        semantic: {
          success: '#16A36A',
          warning: '#E9A23B',
          danger: '#DC4545',
          info: '#0284C7',
        },
      },
      boxShadow: {
        'skeuo-card': '0 1px 1px rgba(0,0,0,0.03), 0 4px 12px -2px rgba(15,23,42,0.06), 0 12px 24px -4px rgba(15,23,42,0.04)',
        'skeuo-elevated': '0 10px 30px -4px rgba(15,23,42,0.12), 0 4px 8px -2px rgba(15,23,42,0.06)',
        'skeuo-inset': 'inset 0 2px 4px 0 rgba(15,23,42,0.06), inset 0 1px 2px 0 rgba(15,23,42,0.04)',
        'skeuo-button-primary': '0 1px 2px 0 rgba(2,132,199,0.35), 0 4px 12px 0 rgba(56,189,248,0.30), inset 0 1px 0 0 rgba(255,255,255,0.35), inset 0 -2px 0 0 rgba(3,105,161,0.40)',
        'skeuo-button-secondary': '0 1px 2px 0 rgba(15,23,42,0.06), 0 2px 4px 0 rgba(15,23,42,0.04), inset 0 1px 0 0 rgba(255,255,255,1.0), inset 0 -1px 0 0 rgba(203,213,225,0.6)',
        'skeuo-button-pressed': 'inset 0 2px 4px 0 rgba(15,23,42,0.20)',
        'sky-glow': '0 4px 14px 0 rgba(2, 132, 199, 0.45)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Inter', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
