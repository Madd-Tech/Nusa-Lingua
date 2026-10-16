import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  iconClassName,
  tileClassName,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  iconClassName?: string;
  tileClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border-2 bg-card p-4 shadow-soft", className)}>
      <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-2xl", tileClassName)}>
        <Icon aria-hidden="true" className={cn("size-6", iconClassName)} />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-extrabold leading-tight">{value}</p>
        <p className="truncate text-xs font-semibold text-muted-foreground">{label}</p>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}
