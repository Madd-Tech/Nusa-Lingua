import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Dipanggil dari Server Component: cookie tidak bisa ditulis di sini.
          // Aman diabaikan karena middleware yang me-refresh session.
        }
      },
    },
  });
}

export type ServerSupabase = ReturnType<typeof createClient>;

/**
 * User terautentikasi untuk request ini (diverifikasi ke Supabase Auth).
 * Di-cache per request supaya layout & page tidak memanggil getUser berulang.
 */
export const getCurrentUser = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
});

/** Pintasan server: user saat ini atau null (tamu). */
export async function getUser() {
  const { user } = await getCurrentUser();
  return user;
}
