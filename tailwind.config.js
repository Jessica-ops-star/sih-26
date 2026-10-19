/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aicte: {
          navy: '#142B4A',
          blue: '#244B75',
          lightBlue: '#3B6A9C',
          sky: '#E8F1FA',
          bg: '#F4F7FB',
          card: '#FFFFFF',
          text: '#172B4D',
          muted: '#6B7A90',
          success: '#16845B',
          'success-bg': '#EAF7EE',
          warning: '#D99119',
          'warning-bg': '#FFF8EB',
          danger: '#C84444',
          'danger-bg': '#FDF2F2',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
