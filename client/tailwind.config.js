/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif-display': ['serif'],
      },
      keyframes: {
        carouselFade: {
          '0%': { opacity: '0', transform: 'scale(0.988) translateY(4px)', filter: 'blur(2px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)', filter: 'blur(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        kenBurns: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.04)' },
        }
      },
      animation: {
        'carousel-fade': 'carouselFade 700ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fadeIn': 'fadeIn 500ms ease-out forwards',
        'ken-burns': 'kenBurns 10s ease-out forwards',
      }
    },
  },
  plugins: [],
}

