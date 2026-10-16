import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IlloOops } from "@/components/illustrations";

export default function NotFound() {
  return (
    <main className="container flex min-h-dvh items-center justify-center py-16">
      <EmptyState
        className="w-full max-w-lg"
        illustration={<IlloOops />}
        title="Halaman tidak ditemukan"
        description="Sepertinya kamu tersesat di antara pulau-pulau. Yuk kembali ke jalur."
        action={
          <Button asChild>
            <Link href="/">Kembali ke beranda</Link>
          </Button>
        }
      />
    </main>
  );
}
