/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-bg': '#fdf6f8',
        'pastel-surface': '#ffffff',
        'pastel-primary': '#6b5e62',
        'pastel-secondary': '#a39193',
        'pastel-border': '#e4d9db',
        'pastel-accent': '#e8c2ca',
        'pastel-accent-hover': '#d1aeb5',
        'pastel-text-on-accent': '#4a4144',
        'pastel-error-bg': '#fff0f0',
        'pastel-error-text': '#c53030',
      }
    },
  },
  plugins: [],
}
