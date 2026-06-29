/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm cream theme
        cream: {
          DEFAULT: '#F8F3EA',
          light: '#FAF7F2',
          dark: '#F0EBE0',
        },
        ivory: '#F5EFE6',
        // Warm brown/terracotta accent
        brown: {
          DEFAULT: '#7B4A1E',
          dark: '#5C3715',
          light: '#9A6B3E',
          pale: '#C4A574',
        },
        // Dark text colors for light backgrounds
        earth: {
          DEFAULT: '#2A1A0A',
          dark: '#1A1209',
          light: '#4A3A2A',
        },
        // Muted/gray tones
        stone: {
          DEFAULT: '#6B5B4F',
          light: '#8A7A6E',
          dark: '#4A3A2E',
        },
        // Legacy support
        gold: {
          DEFAULT: '#7B4A1E',
          dark: '#5C3715',
          light: '#9A6B3E',
          pale: '#C4A574',
        },
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'brown-gradient': 'linear-gradient(135deg, #7B4A1E, #5C3715)',
        'cream-gradient': 'linear-gradient(180deg, #F8F3EA 0%, #F0EBE0 100%)',
        'hero-gradient': 'linear-gradient(180deg, #F8F3EA 0%, #F0EBE0 50%, #E8E3D8 100%)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        brown: '0 0 30px rgba(123,74,30,0.3)',
        'brown-lg': '0 0 60px rgba(123,74,30,0.4)',
        luxury: '0 25px 60px rgba(42,26,10,0.15)',
        card: '0 4px 20px rgba(42,26,10,0.08)',
        'card-hover': '0 8px 40px rgba(123,74,30,0.15)',
      },
    },
  },
  plugins: [],
};
