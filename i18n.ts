import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

// Supported locales — vi is primary
export const locales = ['vi', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'vi'

export default getRequestConfig(async ({ requestLocale }) => {
  // Resolve and validate locale from the request
  let locale = await requestLocale
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
