/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#F0F4F9',
          100: '#D9E2EE',
          200: '#B3C5DD',
          300: '#8DA8CC',
          400: '#678ABB',
          500: '#416DAA',
          600: '#1E3A5F',
          700: '#172E4B',
          800: '#112338',
          900: '#0B1724',
        },
        accent: {
          gold: '#D4AF37',
          goldLight: '#E8D49A',
          goldDark: '#B8942E',
          coral: '#FF6B35',
          coralLight: '#FFB399',
          coralDark: '#E55A2B',
        },
        neutral: {
          ivory: '#FAFAF5',
          cream: '#F5F5EB',
          dark: '#2C2C2C',
          medium: '#6B6B6B',
          light: '#A0A0A0',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(30, 58, 95, 0.08)',
        'card-hover': '0 8px 30px rgba(30, 58, 95, 0.15)',
        'floating': '0 12px 40px rgba(30, 58, 95, 0.12)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
