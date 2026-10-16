import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <div className="mb-6 flex items-center gap-4 rounded-3xl border-2 bg-card p-6">
      <Skeleton className="size-14 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6, className = "sm:grid-cols-2 lg:grid-cols-3" }: { count?: number; className?: string }) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-3xl border-2 bg-card p-5">
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border-2 bg-card p-4">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
  return (
    <LoadingRegion>
      <HeaderSkeleton />
      {variant === "grid" ? <CardGridSkeleton /> : <ListSkeleton />}
    </LoadingRegion>
  );
}
