import type { LucideIcon } from "lucide-react";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { cn } from "@/lib/utils";
import { CATEGORY_STYLES, type FeatureCategory } from "@/components/layout/nav-items";

export function PageHeader({
  title,
  description,
  icon: Icon,
  category = "belajar",
  pattern = "kawung",
  actions,
  className,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  icon?: LucideIcon;
  category?: FeatureCategory;
  pattern?: "kawung" | "parang";
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  const style = CATEGORY_STYLES[category];
  return (
    <section className={cn("relative mb-6 overflow-hidden rounded-3xl border-2 bg-card p-5 sm:p-6", style.border, className)}>
      <BatikPattern variant={pattern} className={cn("opacity-[0.07] dark:opacity-[0.1]", style.text)} />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        {Icon ? (
          <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl", style.bg)}>
            <Icon aria-hidden="true" className={cn("size-7", style.text)} strokeWidth={2.25} />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight sm:text-3xl">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground sm:text-base">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="relative mt-4">{children}</div> : null}
    </section>
  );
}
