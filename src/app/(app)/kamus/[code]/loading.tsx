import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { HeaderSkeleton } from "@/components/layout/page-skeletons";

export default function Loading() {
  return (
    <LoadingRegion label="Memuat kamus…">
      <HeaderSkeleton />
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    </LoadingRegion>
  );
}
