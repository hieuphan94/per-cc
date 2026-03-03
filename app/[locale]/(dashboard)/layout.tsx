import { BottomNav } from './bottom-nav'
import { SidebarNav } from './sidebar-nav'
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

      {/* Desktop sidebar — hidden on mobile/tablet */}
      <SidebarNav locale={params.locale} />

      {/* Main content
          Mobile:  capped at 430px, padded for bottom nav (pb-20)
          Desktop: offset right of sidebar (ml-56), uncapped, no bottom-nav padding */}
      <main className="max-w-mobile mx-auto px-4 pt-14 pb-20 lg:ml-56 lg:max-w-none lg:pb-8 lg:px-8">
        <div className="lg:max-w-4xl">
          {children}
        </div>
      </main>

      {/* Bottom nav — mobile/tablet only */}
      <BottomNav locale={params.locale} />
    </div>
  )
}
