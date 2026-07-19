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
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #daf1f7 0%, #ffffff 45%, #ffe1d6 100%)',
      },
    },
  },
  plugins: [],
}
