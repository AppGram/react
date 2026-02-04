/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        appgram: {
          primary: 'var(--appgram-primary, #6366f1)',
          secondary: 'var(--appgram-secondary, #8b5cf6)',
          accent: 'var(--appgram-accent, #06b6d4)',
        },
      },
    },
  },
  plugins: [],
}
