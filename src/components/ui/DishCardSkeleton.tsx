export default function DishCardSkeleton() {
  return (
    <div
      className="flex gap-4 px-4 py-4"
      style={{ borderBottom: '1px solid oklch(0.95 0.002 255)' }}
    >
      <div className="flex-1 flex flex-col justify-center space-y-2.5">
        <div className="h-4 rounded w-3/4 animate-shimmer" />
        <div className="h-3 rounded w-full animate-shimmer" />
        <div className="h-3.5 rounded w-16 animate-shimmer" />
      </div>
      <div className="shrink-0 w-[72px] h-[72px] rounded-full animate-shimmer" />
      <div className="shrink-0 flex items-center">
        <div className="w-8 h-8 rounded-full animate-shimmer" />
      </div>
    </div>
  )
}
