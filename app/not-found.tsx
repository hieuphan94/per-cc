import Link from 'next/link'

// Global 404 page
export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-4 space-y-4">
      <p className="font-data text-2xl font-semibold text-text-muted">404</p>

      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-text-primary font-ui">Page not found</p>
        <p className="text-xs text-text-secondary font-ui">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>

      <Link
        href="/vi"
        className="bg-accent text-bg-base font-semibold text-sm rounded-xl py-2.5 px-6
                   font-ui active:scale-[0.98] transition-transform duration-100"
      >
        Go home
      </Link>
    </div>
  )
}
