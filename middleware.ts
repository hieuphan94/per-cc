import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { locales, defaultLocale } from './i18n'

// next-intl locale routing middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

// Routes that require authentication
const PROTECTED_PREFIXES = ['/vi/', '/en/']
const AUTH_ROUTES = ['/vi/login', '/en/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Run intl routing first to get locale-aware response
  const intlResponse = intlMiddleware(request)

  // Only enforce auth on locale-prefixed routes (not API, _next, etc.)
  const isLocaleRoute = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r))

  if (!isLocaleRoute) return intlResponse

  // Build a response to pass cookies through
  const response = intlResponse ?? NextResponse.next()

  // Create Supabase server client — use getUser() for verified JWT check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // getUser() validates JWT with Supabase auth server (more secure than getSession)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Dev bypass — skip auth entirely in development when env flag is set
  if (process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true') return response

  // Redirect unauthenticated users to login
  if (!user && !isAuthRoute) {
    const locale = pathname.split('/')[1] || defaultLocale
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from login
  if (user && isAuthRoute) {
    const locale = pathname.split('/')[1] || defaultLocale
    return NextResponse.redirect(new URL(`/${locale}`, request.url))
  }

  return response
}

export const config = {
  // Match all paths except Next.js internals and static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
