/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.vue', './index.html'],
  darkMode: 'class',
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      colors: {
        vox: {
          dark: '#080b11',
          card: '#111723',
          cardLight: '#182030',
          elevated: '#1e293b',
          border: '#243047',
          neon: '#00f2fe',
          purple: '#7928ca',
          accent: '#6366f1',
          live: '#10b981',
          danger: '#f43f5e',
          gold: '#f59e0b'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'Inter', 'sans-serif']
      }
    }
  },
  plugins: [],
}
