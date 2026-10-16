import { Award, Lock } from "lucide-react";
import { RemoteImage } from "@/components/ui/remote-image";
import { cn, formatDate } from "@/lib/utils";

export function AchievementBadge({
  name,
  description,
  iconUrl,
  earnedAt,
}: {
  name: string;
  description: string | null;
  iconUrl: string | null;
  earnedAt: string | null;
}) {
  const earned = !!earnedAt;
  return (
    <div className={cn("flex h-full flex-col items-center gap-2 rounded-2xl border-2 bg-card p-4 text-center", !earned && "border-dashed")}>
      <span
        className={cn(
          "relative flex size-16 items-center justify-center overflow-hidden rounded-2xl border-b-4",
          earned ? "border-secondary-700 bg-secondary-600" : "border-border bg-muted grayscale",
        )}
      >
        {iconUrl ? (
          <RemoteImage src={iconUrl} alt="" className={cn("size-full", !earned && "opacity-40")} />
        ) : (
          <Award aria-hidden="true" className={cn("size-8", earned ? "text-ink" : "text-muted-foreground")} />
        )}
        {!earned ? (
          <span className="absolute bottom-1 right-1 rounded-md bg-card p-0.5">
            <Lock aria-hidden="true" className="size-3 text-muted-foreground" />
          </span>
        ) : null}
      </span>
      <p className="text-sm font-extrabold leading-tight">{name}</p>
      {description ? (
        <p className="text-xs text-muted-foreground">
          {earned ? null : <span className="font-bold">Syarat: </span>}
          {description}
        </p>
      ) : null}
      <p className={cn("mt-auto text-xs font-bold", earned ? "text-success-700 dark:text-success" : "text-muted-foreground")}>
        {earned ? `Diraih ${formatDate(earnedAt!)}` : "Belum diraih"}
      </p>
    </div>
  );
}
