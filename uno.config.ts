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
        sans: 'Noto Sans JP:400,500,700'
      }
    })
  ],
  rules: [],
  shortcuts: {
    h1: 'text-3xl sm:text-4xl fw-700 leading-snug tracking-wide',
    h2: 'text-2xl fw-700 leading-normal',
    h3: 'text-xl fw-700 leading-normal',
    h4: 'text-lg fw-700',
    h5: 'text-base fw-700',
    'btn-m': 'text-base fw-700 leading-normal',
    'cap-m': 'text-[13px] text-text-secondary',
    'page-shell': 'mx-auto w-full max-w-6xl px-5 sm:px-8',
    'field-label': 'text-base font-bold leading-relaxed',
    'field-hint': 'text-sm text-text-secondary leading-relaxed',
    'field-required': 'text-sm font-normal text-status-error',
    'field-error': 'text-sm text-status-error leading-relaxed',
    'form-section':
      'scroll-mt-8 border-t border-border-secondary py-8 sm:py-10',
    'nav-link':
      'inline-flex min-h-12 items-center border-b-4 border-transparent px-1 text-sm font-bold text-text-secondary hover:text-text-link hover:border-border-primary',
    'checkbox-base':
      'h-6 w-6 shrink-0 cursor-pointer accent-surface-accent-primary disabled:cursor-not-allowed',
    'input-base':
      'box-border min-h-12 min-w-0 px-4 py-3 b b-solid b-border-primary rd-2 w-full bg-surface-primary text-base text-text-primary leading-normal placeholder:text-text-secondary hover:b-text-primary disabled:bg-surface-secondary disabled:cursor-not-allowed',
    card: 'rd-2 px-5 py-6 bg-surface-primary b-1 b-solid b-border-secondary',
    'btn-base':
      'inline-flex min-h-12 items-center justify-center gap-2 px-5 py-3 rd-2 b b-solid btn-m cursor-pointer disabled:bg-surface-secondary disabled:b-border-secondary disabled:text-text-secondary disabled:cursor-not-allowed',
    'btn-primary':
      'btn-base bg-surface-accent-primary b-border-accent-primary text-white hover:bg-surface-accent-strong hover:underline active:bg-surface-accent-strong',
    'btn-secondary':
      'btn-base bg-surface-primary b-border-accent-primary text-text-link hover:bg-surface-accent-soft hover:underline active:bg-surface-secondary',
    link: 'text-text-link underline underline-offset-4 hover:decoration-2'
  },
  theme: {
    colors: {
      surface: {
        accentPrimary: '#0E9888',
        accentStrong: '#0A7D70',
        accentSoft: '#E7F4F2',
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
        secondary: '#6A716E',
        tertiary: '#9AA1A7',
        link: '#009688'
      },
      background: {
        background: '#F8F8F8'
      },
      status: {
        error: '#EF4444', // red-500
        success: '#16A34A', // green-600
        accepting: '#0E9888',
        answered: '#6f6fa0',
        closed: '#8892a0',
        confirmed: '#3b82f6'
      },
      tag: {
        invited: '#5a8a6a',
        invitedBg: '#ecf3ee',
        public: '#2a8a9e',
        publicBg: '#e6f3f6'
      },
      weekday: {
        sun: '#D2544F',
        sat: '#3F74C2'
      },
      room: {
        openBg: '#D2EAE5',
        openBorder: '#C2E4DE',
        exclusiveBg: '#F8EAD2',
        exclusiveBorder: '#ECD6A4',
        exclusiveFg: '#8A5E16',
        exclusiveTime: '#A07D3E'
      }
    }
  },
  preflights: [
    {
      getCSS: ({ theme }) => `
        body {
          background-color: ${theme.colors.background.background};
          color: ${theme.colors.text.primary};
          font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.7;
          overflow-wrap: anywhere;
        }
        button, input, textarea, select { font: inherit; }
        button, a, input, textarea, select, [tabindex] { -webkit-tap-highlight-color: transparent; }
        :focus-visible {
          outline: 3px solid ${theme.colors.border.accentPrimary};
          outline-offset: 2px;
          box-shadow: 0 0 0 5px ${theme.colors.surface.primary};
        }
        input[aria-invalid='true'], textarea[aria-invalid='true'], button[aria-invalid='true'] {
          border-color: ${theme.colors.status.error};
          border-width: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
        }
            `
    }
  ]
})
