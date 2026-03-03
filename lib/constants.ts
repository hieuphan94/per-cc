// App-wide configuration constants

export const APP_NAME = 'per-cc'
export const APP_DESCRIPTION = 'Personal Command Center'

// Supported locales
export const LOCALES = ['vi', 'en'] as const
export const DEFAULT_LOCALE = 'vi'

// Admin email — only this user can log in (single-user app)
export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ''

// App URL
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// Module route map (locale-relative paths)
export const MODULE_ROUTES = {
  home:      '/',
  wordpress: '/wordpress',
  trading:   '/trading',
  content:   '/content',
  dev:       '/dev',
  learning:  '/learning',
  reports:   '/reports',
} as const

// Module accent colors (matches design-guidelines.md § 7)
export const MODULE_COLORS = {
  home:      '#3DD6F5',
  wordpress: '#22D47A',
  dev:       '#A78BFA',
  trading:   '#F5A623',
  content:   '#F472B6',
  learning:  '#60A5FA',
  reports:   '#5EEAD4',
} as const

// Bottom tab bar items (5 visible tabs)
export const BOTTOM_TABS = [
  { key: 'home',      labelKey: 'nav.home',      href: '/'          },
  { key: 'wordpress', labelKey: 'nav.wordpress',  href: '/wordpress' },
  { key: 'trading',   labelKey: 'nav.trading',    href: '/trading'   },
  { key: 'content',   labelKey: 'nav.content',    href: '/content'   },
  { key: 'more',      labelKey: 'nav.more',       href: null         },
] as const
