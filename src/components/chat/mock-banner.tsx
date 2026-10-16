import { FlaskConical } from "lucide-react";
import { USE_MOCK_CHAT } from "@/lib/env";

/** Label jelas bahwa balasan berasal dari mock lokal, bukan AI sungguhan. */
export function MockBanner() {
  if (!USE_MOCK_CHAT) return null;
  return (
    <p className="flex items-start gap-2 rounded-2xl border-2 border-dashed border-secondary/60 bg-secondary/10 px-4 py-3 text-sm">
      <FlaskConical aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#7A5402] dark:text-secondary" />
      <span>
        <strong>Mode demo.</strong> Endpoint AI belum tersambung — balasan dibuat oleh mock lokal dan tidak disimpan.
      </span>
    </p>
  );
}
