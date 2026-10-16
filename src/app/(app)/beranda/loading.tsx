import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <LoadingRegion label="Memuat beranda…" className="space-y-8">
      <Skeleton className="h-32 rounded-3xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    </LoadingRegion>
  );
}
