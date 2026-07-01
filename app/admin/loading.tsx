// Skeleton del panel admin: 3 stat cards
function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-border ${className ?? ''}`} />
}

export default function AdminLoading() {
  return (
    <div>
      <Bone className="h-9 w-36 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 flex flex-col gap-3">
            <Bone className="h-4 w-36" />
            <Bone className="h-10 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
