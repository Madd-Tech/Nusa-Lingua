import { Bot } from "lucide-react";
import { RemoteImage } from "@/components/ui/remote-image";
import { cn } from "@/lib/utils";

export function PersonaAvatar({ src, className }: { src?: string | null; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-asisten-solid text-white",
        className,
      )}
    >
      {src ? <RemoteImage src={src} alt="" className="h-full w-full" /> : <Bot aria-hidden="true" className="size-1/2" />}
    </span>
  );
}
