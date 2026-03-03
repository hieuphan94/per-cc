import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'

// Primary UI font — geometric, supports Vietnamese
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
})

// Monospace data font — zero-ambiguity numerals for trading/data
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-data',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'per-cc | Personal Command Center',
  description: 'Personal productivity command center — tasks, trading, content, dev.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#080C10',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="vi"
      className={`dark ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-bg-base text-text-primary font-ui antialiased">
        {children}
      </body>
    </html>
  )
}
