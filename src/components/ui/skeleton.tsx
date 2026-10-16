import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-2xl bg-muted", className)} {...props} />;
}

/** Wrapper untuk area yang sedang dimuat — dibacakan pembaca layar sebagai "Memuat…". */
function LoadingRegion({ label = "Memuat…", className, children }: { label?: string; className?: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export { Skeleton, LoadingRegion };
