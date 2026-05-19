export default function DishCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'oklch(0.16 0.005 85)',
        border: '1px solid oklch(0.25 0.008 85)',
      }}
    >
      <div className="aspect-[4/3] animate-shimmer" />
      <div className="p-3 sm:p-4 space-y-2.5">
        <div className="h-4 rounded-lg w-3/4 animate-shimmer" />
        <div className="h-3 rounded-lg w-1/2 animate-shimmer" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 rounded-lg w-14 animate-shimmer" />
          <div className="w-10 h-10 rounded-xl animate-shimmer" />
        </div>
      </div>
    </div>
  )
}
