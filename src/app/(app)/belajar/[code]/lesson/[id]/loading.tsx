import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <LoadingRegion label="Menyiapkan lesson…" className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 pt-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-10 rounded-xl" />
        <Skeleton className="h-4 flex-1 rounded-full" />
        <Skeleton className="h-6 w-10" />
      </div>
      <div className="flex-1 space-y-6 py-12">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-3/4" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      </div>
    </LoadingRegion>
  );
}
