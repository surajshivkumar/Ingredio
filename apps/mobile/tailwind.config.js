// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',
        secondary: '#FFC107',
        danger: '#F44336',
        surface: '#F8F9FA',
        textBase: '#212529',
        textMuted: '#6C757D',
        textLight: '#FFFFFF',
      }
    },
  },
  plugins: [],
}
