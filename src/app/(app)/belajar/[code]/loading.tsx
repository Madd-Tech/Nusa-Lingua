import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

const OFFSETS = [0, 44, 72, 44, 0];

export default function Loading() {
  return (
    <LoadingRegion label="Memuat jalur belajar…" className="mx-auto max-w-2xl space-y-8">
      <Skeleton className="h-36 rounded-3xl" />
      <Skeleton className="h-28 rounded-3xl" />
      <div className="flex flex-col items-center gap-8">
        {OFFSETS.map((x, i) => (
          <Skeleton key={i} className="size-[72px] rounded-full" style={{ transform: `translateX(${x}px)` }} />
        ))}
      </div>
    </LoadingRegion>
  );
}
