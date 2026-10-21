import Link from "next/link";
import { ShieldCheck, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { ModerationNav } from "@/components/moderation/moderation-nav";
import { getModerationContext } from "@/lib/moderation-context";

/** Area moderasi: khusus moderator/admin. (RLS & RPC di database tetap menjadi penegak utama.) */
export default async function ModerasiLayout({ children }: { children: React.ReactNode }) {
  const { isModerator, isAdmin, scope } = await getModerationContext();

  if (!isModerator) {
    return (
      <EmptyState
        className="mx-auto mt-8 max-w-lg"
        illustration={<ShieldX aria-hidden="true" className="size-20 text-komunitas" />}
        title="403 — Halaman khusus moderator"
        description="Halaman ini hanya untuk moderator dan admin. Kamu tetap bisa mengusulkan kosakata dan memantau statusnya."
        action={
          <Button asChild variant="komunitas">
            <Link href="/kontribusi">Kembali ke Kontribusi</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        icon={ShieldCheck}
        category="komunitas"
        pattern="parang"
        title="Moderasi"
        description={
          isAdmin
            ? "Admin · semua bahasa"
            : scope.length
              ? `Bahasa yang kamu moderasi: ${scope.map((l) => l.name).join(", ")}`
              : "Belum ada bahasa yang ditugaskan kepadamu."
        }
      />
      <ModerationNav isAdmin={isAdmin} />
      {children}
    </>
  );
}
