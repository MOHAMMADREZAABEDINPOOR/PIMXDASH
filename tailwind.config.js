/** @type {import('tailwindcss').Config} */
function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `color-mix(in srgb, var(${variableName}) calc(${opacityValue} * 100%), transparent)`;
    }
    return `var(${variableName})`;
  };
}

export default {
  content: [
    "./index.html",
    "./newtab.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        persian: ['Vazirmatn', 'Tahoma', 'sans-serif'],
      },
      colors: {
        bg: {
          base: 'var(--bg-base)',
          surface: withOpacity('--bg-surface'),
          glass: withOpacity('--bg-glass'),
          hover: withOpacity('--bg-hover'),
        },
        border: {
          subtle: withOpacity('--border-subtle'),
          glass: withOpacity('--border-glass'),
          glow: withOpacity('--border-glow'),
        },
        text: {
          primary: withOpacity('--text-primary'),
          secondary: withOpacity('--text-secondary'),
          muted: withOpacity('--text-muted'),
        },
        accent: {
          DEFAULT: withOpacity('--accent-color'),
          glow: 'var(--accent-glow)',
          subtle: 'var(--accent-subtle)',
          secondary: withOpacity('--accent-secondary'),
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
        'glow': '0 0 30px -5px var(--accent-glow)',
        'card': '0 10px 30px -10px rgba(0,0,0,0.5)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'aurora': 'aurora 15s ease infinite alternate',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '0.4' },
        },
        aurora: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-5%, 5%) scale(1.05)' },
          '100%': { transform: 'translate(5%, -5%) scale(0.95)' },
        }
      }
    },
  },
  plugins: [],
}
