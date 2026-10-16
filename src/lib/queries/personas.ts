import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { must } from "./_shared";

/**
 * ai_personas tidak punya policy select untuk client, jadi dibaca dengan service role
 * di server. HANYA kolom publik yang diambil — system_prompt tidak pernah di-select,
 * sehingga mustahil terkirim ke browser.
 */
const PUBLIC_PERSONA_FIELDS = "id, language_id, name, description, avatar_url" as const;

export const getPublicPersonas = cache(async () => {
  const admin = createAdminClient();
  return must(
    "Gagal memuat persona asisten",
    await admin.from("ai_personas").select(PUBLIC_PERSONA_FIELDS).order("name"),
  );
});

export type PublicPersona = Awaited<ReturnType<typeof getPublicPersonas>>[number];

export const getPublicPersona = cache(async (id: number) => {
  const admin = createAdminClient();
  return must(
    "Gagal memuat persona",
    await admin.from("ai_personas").select(PUBLIC_PERSONA_FIELDS).eq("id", id).maybeSingle(),
  );
});
