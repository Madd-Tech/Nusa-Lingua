import { Bot } from "lucide-react";
import { RemoteImage } from "@/components/ui/remote-image";
import { getPersonaMascot } from "@/lib/persona-mascots";
import { cn } from "@/lib/utils";

/**
 * Avatar persona. `src` dari DB (ai_personas.avatar_url); bila kosong, fallback ke
 * aset maskot statis sesuai nama persona (Mbah Darmo / Teh Euis).
 */
export function PersonaAvatar({ name, src, className }: { name?: string | null; src?: string | null; className?: string }) {
  const resolved = src ?? getPersonaMascot(name)?.avatar ?? null;
  return (
    <span
      className={cn(
        "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-asisten-solid text-white",
        className,
      )}
    >
      {resolved ? <RemoteImage src={resolved} alt="" className="h-full w-full" /> : <Bot aria-hidden="true" className="size-1/2" />}
    </span>
  );
}
