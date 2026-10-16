import * as React from "react";
import { cn } from "@/lib/utils";
import { IlloEmptyBox } from "@/components/illustrations";

/** State kosong: ilustrasi + judul + ajakan aksi. */
export function EmptyState({
  title,
  description,
  illustration,
  action,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  illustration?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed bg-card/60 px-6 py-10 text-center",
        className,
      )}
    >
      {illustration ?? <IlloEmptyBox />}
      <h3 className="text-lg font-extrabold">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}
