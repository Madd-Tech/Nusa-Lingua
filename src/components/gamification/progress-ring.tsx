import { cn } from "@/lib/utils";

/** Cincin progres SVG. Nilai dibacakan via role="progressbar". */
export function ProgressRing({
  value,
  max,
  size = 112,
  stroke = 12,
  label,
  className,
  children,
  colorClass = "stroke-secondary",
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  label: string;
  className?: string;
  children?: React.ReactNode;
  colorClass?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className={cn("fill-none transition-[stroke-dashoffset] duration-700 ease-out", colorClass)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
