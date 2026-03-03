import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background layers
        'bg-base':      '#080C10',
        'bg-surface':   '#0F1419',
        'bg-surface-2': '#161D26',
        'bg-surface-3': '#1C2533',
        // Borders
        'border-subtle': '#1F2D3D',
        'border-muted':  '#2A3A4D',
        // Text
        'text-primary':   '#E8EDF2',
        'text-secondary': '#8B9BB0',
        'text-muted':     '#4A5A6E',
        // Semantic accents
        accent:  '#3DD6F5',
        success: '#22D47A',
        danger:  '#F5564A',
        warning: '#F5A623',
        purple:  '#A78BFA',
        // Module accents
        'mod-briefing':  '#3DD6F5',
        'mod-wordpress': '#22D47A',
        'mod-dev':       '#A78BFA',
        'mod-trading':   '#F5A623',
        'mod-content':   '#F472B6',
        'mod-learning':  '#60A5FA',
        'mod-reports':   '#5EEAD4',
      },
      fontFamily: {
        ui:   ['Space Grotesk', 'system-ui', 'sans-serif'],
        data: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      maxWidth: {
        mobile: '430px',
      },
      borderRadius: {
        '2xl': '16px',
        'xl':  '12px',
      },
    },
  },
  plugins: [],
}

export default config
