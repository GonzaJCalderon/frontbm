/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f8f9ff',
        'surface-dim': '#ccdbf4',
        'surface-bright': '#f8f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d4e4fc',
        'on-surface': '#0d1c2e',
        'on-surface-variant': '#43474e',
        'inverse-surface': '#223144',
        'inverse-on-surface': '#eaf1ff',
        outline: '#74777f',
        'outline-variant': '#c4c6cf',
        'surface-tint': '#455f88',
        primary: '#002045',
        'on-primary': '#ffffff',
        'primary-container': '#1a365d',
        'on-primary-container': '#86a0cd',
        'inverse-primary': '#adc7f7',
        secondary: '#006d3c',
        'on-secondary': '#ffffff',
        'secondary-container': '#85f6ad',
        'on-secondary-container': '#00723f',
        tertiary: '#1c2225',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#31373b',
        'on-tertiary-container': '#9aa0a4',
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        background: '#f8f9ff',
        'on-background': '#0d1c2e',
        'surface-variant': '#d4e4fc',
        'deep-navy': '#1A365D',
        'growth-green': '#48BB78',
        'slate-gray': '#F7FAFC'
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'level-2': '0px 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'level-3': '0px 10px 15px -3px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}

