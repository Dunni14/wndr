/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'neu-sw': '8px 8px 16px rgba(0,0,0,0.08), -8px -8px 16px rgba(255,255,255,0.4)',
        'neu-in': 'inset 6px 6px 12px rgba(0,0,0,0.08), inset -6px -6px 12px rgba(255,255,255,0.4)',
        'neu-btn': '4px 4px 8px rgba(0,0,0,0.04), -4px -4px 8px rgba(255,255,255,0.25)',
        'neu-soft': '2px 2px 4px rgba(0,0,0,0.03), -2px -2px 4px rgba(255,255,255,0.3)',
        'neu-elevated': '6px 6px 12px rgba(0,0,0,0.06), -6px -6px 12px rgba(255,255,255,0.35)',
      },
      colors: {
        mint: '#D5F3E5',
        coral: '#FFD2C2',
        lavender: '#E3D4FF',
        cream: '#FFF9E6',
        warmgray: '#B0B0B0',
        charcoal: '#333333',
      },
      fontFamily: {
        sans: ['Racing Sans One', 'sans-serif'],
        logo: ['Racing Sans One', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}