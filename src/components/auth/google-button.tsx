"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/validation";
import { siteOrigin } from "@/components/auth/site-origin";

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
    </svg>
  );
}

/**
 * Masuk/daftar dengan Google (Supabase OAuth, alur PKCE).
 * Alur: tombol → Google → https://<ref>.supabase.co/auth/v1/callback → /auth/callback?code=…&next=…
 * `enabled=false` berarti provider Google belum diaktifkan di Supabase → tombol dinonaktifkan dengan penjelasan.
 */
export function GoogleButton({
  next,
  label = "Lanjut dengan Google",
  enabled = null,
}: {
  next: string;
  label?: string;
  enabled?: boolean | null;
}) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
        // Selalu tampilkan pemilih akun (berguna di perangkat bersama).
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      toast.error(authErrorMessage(error.message));
      setLoading(false);
    }
    // Jika sukses, browser langsung diarahkan ke Google — loading dibiarkan aktif.
  };

  if (enabled === false) {
    return (
      <div className="space-y-2">
        <Button type="button" variant="outline" block size="lg" disabled aria-describedby="google-off">
          <GoogleGlyph />
          {label}
        </Button>
        <p id="google-off" className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          Masuk dengan Google belum diaktifkan. Untuk sementara, gunakan email dan kata sandi.
        </p>
      </div>
    );
  }

  return (
    <Button type="button" variant="outline" block size="lg" onClick={onClick} disabled={loading} aria-busy={loading}>
      <GoogleGlyph />
      {loading ? "Mengalihkan ke Google…" : label}
    </Button>
  );
}
