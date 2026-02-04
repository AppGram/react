/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        appgram: {
          primary: 'var(--appgram-primary, #6366f1)',
          secondary: 'var(--appgram-secondary, #8b5cf6)',
          accent: 'var(--appgram-accent, #06b6d4)',
          background: 'var(--appgram-background, #ffffff)',
          foreground: 'var(--appgram-foreground, #09090b)',
          muted: 'var(--appgram-muted, #f4f4f5)',
          'muted-foreground': 'var(--appgram-muted-foreground, #71717a)',
          card: 'var(--appgram-card, #ffffff)',
          'card-foreground': 'var(--appgram-card-foreground, #09090b)',
          border: 'var(--appgram-border, #e4e4e7)',
        },
      },
      borderRadius: {
        appgram: 'var(--appgram-radius, 0.5rem)',
      },
      fontFamily: {
        appgram: 'var(--appgram-font-family, inherit)',
      },
      animation: {
        'appgram-fade-in': 'appgram-fade-in 0.3s ease-out',
        'appgram-slide-up': 'appgram-slide-up 0.3s ease-out',
        'appgram-vote-pop': 'appgram-vote-pop 0.4s ease-out',
      },
      keyframes: {
        'appgram-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'appgram-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'appgram-vote-pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
