import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <LoadingRegion label="Memuat artikel…" className="mx-auto max-w-3xl space-y-6">
      <Skeleton className="aspect-[16/7] w-full rounded-3xl" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      <div className="space-y-3 pt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${85 + ((i * 7) % 15)}%` }} />
        ))}
      </div>
    </LoadingRegion>
  );
}
