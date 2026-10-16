export function AuthDivider({ label = "atau pakai email" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
      <span className="h-0.5 flex-1 rounded bg-border" />
      {label}
      <span className="h-0.5 flex-1 rounded bg-border" />
    </div>
  );
}
