/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#04070F',
          900: '#060A18',
          850: '#080E1F',
          800: '#0B1228',
          700: '#121B38',
          600: '#1B2749',
        },
        pulse: {
          cyan: '#22D3EE',
          sky: '#38BDF8',
          blue: '#4F7BFF',
          violet: '#8B5CF6',
          mint: '#5EEAD4',
        },
        ink: {
          100: '#EAF2FF',
          200: '#C7D6F0',
          300: '#9FB2D4',
          400: '#7C90B5',
          500: '#5B6E92',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56,189,248,0.18), 0 18px 60px -24px rgba(34,211,238,0.45)',
        panel: '0 24px 80px -40px rgba(2,6,23,0.9)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(circle at 50% 0%, rgba(56,189,248,0.12), transparent 60%)',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        pulseRing: 'pulseRing 2.6s ease-out infinite',
        riseIn: 'riseIn 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
