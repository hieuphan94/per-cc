// Page-level loading skeleton for dashboard routes
export default function DashboardLoading() {
  return (
    <div className="space-y-6 pt-4 animate-pulse">
      {/* Welcome card skeleton */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-2">
        <div className="h-3 w-24 skeleton rounded-full" />
        <div className="h-5 w-40 skeleton rounded-full" />
      </div>

      {/* Section label skeleton */}
      <div className="h-2.5 w-20 skeleton rounded-full" />

      {/* 2-column quick-access grid skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-3"
          >
            <div className="h-8 w-8 skeleton rounded-xl" />
            <div className="space-y-1.5">
              <div className="h-2.5 w-20 skeleton rounded-full" />
              <div className="h-2 w-14 skeleton rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
