export default function DishCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'white', boxShadow: '0 1px 6px oklch(0.20 0.02 60 / 0.06)' }}>
      <div className="w-full animate-shimmer" style={{ aspectRatio: '4 / 3' }} />
      <div className="px-3 py-2.5 space-y-2">
        <div className="h-4 rounded w-3/4 animate-shimmer" />
        <div className="h-3 rounded w-full animate-shimmer" />
      </div>
    </div>
  )
}
