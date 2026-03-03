import { BottomNav } from './bottom-nav'
import { TopBar } from './top-bar'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-base">
      <TopBar locale={params.locale} />

      {/* Main content — padded for top bar (h-14) and bottom nav (h-16 + safe) */}
      <main className="max-w-mobile mx-auto px-4 pt-14 pb-20">
        {children}
      </main>

      <BottomNav locale={params.locale} />
    </div>
  )
}
