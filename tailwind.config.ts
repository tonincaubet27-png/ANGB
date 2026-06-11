import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0a0e1a',
        'navy-mid': '#111827',
        'navy-light': '#1e2a3d',
        accent: '#4a7fff',
        'red-fr': '#ED2939',
        'white-custom': '#f5f5f0',
        gray: '#8a9ab5',
      },
      fontFamily: {
        bebas: ['var(--font-bebas)', 'sans-serif'],
        dm: ['var(--font-dm)', 'sans-serif'],
      },
      animation: {
        spotlight: 'spotlight 2s ease .75s 1 forwards',
      },
      keyframes: {
        spotlight: {
          '0%':   { opacity: '0', transform: 'translate(-72%, -62%) scale(0.5)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -40%) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
