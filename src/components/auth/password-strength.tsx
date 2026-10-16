import { passwordStrength } from "@/lib/validation";
import { cn } from "@/lib/utils";

const LEVELS = [
  { label: "Terlalu lemah", color: "bg-danger" },
  { label: "Lemah", color: "bg-danger" },
  { label: "Cukup", color: "bg-secondary" },
  { label: "Kuat", color: "bg-success" },
  { label: "Sangat kuat", color: "bg-success" },
];

/** Indikator kekuatan kata sandi: bar + teks (tidak hanya warna). */
export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = passwordStrength(password);
  const level = LEVELS[score];
  return (
    <div className="space-y-1" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn("h-1.5 flex-1 rounded-full", i < Math.max(1, score) ? level.color : "bg-muted")} />
        ))}
      </div>
      <p className="text-xs font-semibold text-muted-foreground">
        Kekuatan kata sandi: <span className="text-foreground">{level.label}</span>
      </p>
    </div>
  );
}
