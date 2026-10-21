import "server-only";
import { cache } from "react";
import { getCurrentUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/progress";
import { getModerationScope } from "@/lib/queries/moderation";

/**
 * Konteks area moderasi untuk request ini: role & bahasa yang dimoderasi.
 * Di-cache per request supaya layout dan page /moderasi tidak query ulang.
 * Hanya untuk tampilan — RLS & RPC di database tetap penegak utama.
 */
export const getModerationContext = cache(async () => {
  const { supabase, user } = await getCurrentUser();
  const profile = user ? await getProfile(supabase, user.id) : null;
  const role = profile?.role ?? "user";
  const isModerator = role === "moderator" || role === "admin";
  const scope = user && isModerator ? await getModerationScope(supabase, user.id, role) : [];
  return { supabase, userId: user?.id ?? null, role, isModerator, isAdmin: role === "admin", scope };
});
