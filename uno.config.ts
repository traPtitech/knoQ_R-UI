import {
  presetWebFonts,
  defineConfig,
  presetAttributify,
  presetWind3,
  presetIcons
} from 'unocss'

export default defineConfig({
  presets: [
    presetAttributify(),
    presetWind3(),
    presetIcons(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Noto Sans JP:400,500'
      }
    })
  ],
  rules: [],
  shortcuts: {
    h1: 'text-[33px] fw-500',
    h2: 'text-[28px] fw-500',
    h3: 'text-[23px] fw-500',
    h4: 'text-[19px] fw-500',
    h5: 'text-[16px] fw-500',
    'btn-m': 'text-[16px] fw-500',
    'cap-m': 'text-[13px] text-text-secondary',
    'input-base':
      'box-border px-4 py-3 b b-solid b-border-primary rd-1 w-full bg-surface-primary text-text-primary placeholder:text-text-secondary focus:outline-none focus:b-border-accent-primary transition-colors',
    card: 'rd-xl px-5 py-6 bg-surface-primary b-1 b-solid b-border-secondary',
    'btn-primary':
      'px-4 py-2 bg-surface-accent-primary rd-2 b b-solid b-border-accent-primary text-white btn-m'
  },
  theme: {
    colors: {
      surface: {
        accentPrimary: '#0E9888',
        primary: '#FFFFFF',
        secondary: '#F1F4F3'
      },
      border: {
        primary: '#C7C7C7',
        secondary: '#E2E2E2',
        accentPrimary: '#067A6F'
      },
      text: {
        primary: '#111C18',
        secondary: '#6A716E'
      },
      background: {
        background: '#F8F8F8'
      },
      status: {
        error: '#EF4444', // red-500
        success: '#16A34A' // green-600
      }
    }
  },
  preflights: [
    {
      getCSS: ({ theme }) => `
                body {
                    background-color: ${theme.colors.background.background};
                }
                * {
                    color: ${theme.colors.text.primary};
                }
            `
    }
  ]
})
