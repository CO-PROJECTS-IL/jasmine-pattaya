export default function DishCardSkeleton() {
  return (
    <div
      className="flex gap-4 p-4 rounded-2xl mb-6"
      style={{ backgroundColor: 'oklch(0.11 0.008 60)' }}
    >
      <div className="shrink-0 w-[96px] h-[96px] rounded-xl animate-shimmer" />
      <div className="flex-1 flex flex-col justify-center space-y-2.5">
        <div className="h-4 rounded w-3/4 animate-shimmer" />
        <div className="h-3 rounded w-full animate-shimmer" />
        <div className="h-3.5 rounded w-16 animate-shimmer" />
      </div>
      <div className="shrink-0 flex items-center">
        <div className="w-9 h-9 rounded-lg animate-shimmer" />
      </div>
    </div>
  )
}
