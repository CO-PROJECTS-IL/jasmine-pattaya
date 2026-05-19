export default function DishCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'oklch(0.18 0.005 85)',
        border: '1px solid oklch(0.28 0.005 85)',
      }}
    >
      <div
        className="aspect-[4/3] animate-pulse"
        style={{ backgroundColor: 'oklch(0.22 0.005 85)' }}
      />
      <div className="p-4 space-y-3">
        <div
          className="h-4 rounded-lg w-3/4 animate-pulse"
          style={{ backgroundColor: 'oklch(0.22 0.005 85)' }}
        />
        <div
          className="h-3 rounded-lg w-1/2 animate-pulse"
          style={{ backgroundColor: 'oklch(0.20 0.005 85)' }}
        />
        <div className="flex items-center justify-between pt-1">
          <div
            className="h-5 rounded-lg w-12 animate-pulse"
            style={{ backgroundColor: 'oklch(0.22 0.005 85)' }}
          />
          <div
            className="w-11 h-11 rounded-xl animate-pulse"
            style={{ backgroundColor: 'oklch(0.22 0.005 85)' }}
          />
        </div>
      </div>
    </div>
  )
}
