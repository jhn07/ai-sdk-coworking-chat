export function CoworkingSkeleton() {
  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 overflow-hidden animate-pulse">
      <div className="h-40 w-full bg-gray-300/50" />
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="h-4 bg-gray-300/50 rounded w-3/4" />
          <div className="h-3 bg-gray-300/50 rounded w-full" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-300/50 rounded w-20" />
          <div className="h-4 bg-gray-300/50 rounded w-12" />
        </div>
        <div className="h-3 bg-gray-300/50 rounded w-2/3" />
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <div className="h-8 bg-gray-300/50 rounded-lg" />
            <div className="h-8 bg-gray-300/50 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-8 bg-gray-300/50 rounded-lg" />
            <div className="h-8 bg-gray-300/50 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function CoworkingListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CoworkingSkeleton key={i} />
      ))}
    </div>
  )
}
