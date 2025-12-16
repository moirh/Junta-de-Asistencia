/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Tipografía del proyecto original
      },
      colors: {
        // Paleta exacta extraída de Siace
        colorPrimarioJAPEM: '#036050',    // Verde principal
        colorSecundarioJAPEM: '#1a3a2d',  // Verde oscuro/negro
        colorTerciarioJAPEM: '#BC955B',   // Dorado
        colorAuxiliarJAPEM: '#6b7280',    // Gris
        
        // Mapeo a nombres genéricos para compatibilidad
        primary: '#036050',
        secondary: '#BC955B',
        dark: '#1a3a2d',
      },
      boxShadow: {
        // Sombras suaves del diseño original
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.01)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'pulse-slow': 'pulse 3s infinite',
        'shake': 'shake 0.6s ease-in-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        }
      }
    },
  },
  plugins: [],
}