// Loading skeleton for Morning Briefing page

export default function BriefingLoading() {
  return (
    <div className="space-y-5 pt-4 pb-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-1.5">
        <div className="h-3 w-28 bg-bg-surface-2 rounded" />
        <div className="h-6 w-40 bg-bg-surface-2 rounded" />
      </div>

      {/* Action buttons skeleton */}
      <div className="grid grid-cols-2 gap-2">
        <div className="h-10 bg-bg-surface-2 rounded-xl" />
        <div className="h-10 bg-bg-surface-2 rounded-xl" />
      </div>

      {/* Task card skeletons */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-3 py-3 rounded-xl bg-bg-surface border border-border-subtle">
          <div className="mt-0.5 h-5 w-5 rounded-full bg-bg-surface-2 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-bg-surface-2 rounded" />
            <div className="flex gap-2">
              <div className="h-3 w-8 bg-bg-surface-2 rounded" />
              <div className="h-3 w-6 bg-bg-surface-2 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
