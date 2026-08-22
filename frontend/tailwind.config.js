/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0f9fc',
          100: '#daf1f7',
          200: '#b8e4ef',
          300: '#86d0e2',
          400: '#4bb3cd',
          500: '#2896b3',
          600: '#1f7896',
          700: '#1e6179',
          800: '#1f5065',
          900: '#1d4356',
          950: '#0f2b39',
        },
        coral: {
          50: '#fff2ee',
          100: '#ffe1d6',
          200: '#ffc4ae',
          300: '#ff9c76',
          400: '#ff7a4d',
          500: '#f8552a',
          600: '#e53a15',
          700: '#bf2a11',
          800: '#992415',
          900: '#7c2114',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #daf1f7 0%, #ffffff 45%, #ffe1d6 100%)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'scale-in': {
          from: { opacity: 0, transform: 'scale(0.95)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        'wave-shine': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'slide-in': {
          from: { opacity: 0, transform: 'translateX(12px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'wave-shine': 'wave-shine 2.5s linear infinite',
        float: 'float 3s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
