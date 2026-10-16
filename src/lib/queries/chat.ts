import type { DB } from "./_shared";
import { must } from "./_shared";

export async function getChatSessions(db: DB, userId: string) {
  return must(
    "Gagal memuat riwayat obrolan",
    await db
      .from("chat_sessions")
      .select("id, persona_id, title, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
  );
}

export type ChatSessionRow = Awaited<ReturnType<typeof getChatSessions>>[number];

export async function getChatSession(db: DB, sessionId: string) {
  return must(
    "Gagal memuat sesi obrolan",
    await db.from("chat_sessions").select("id, user_id, persona_id, title, created_at").eq("id", sessionId).maybeSingle(),
  );
}

export async function getChatMessages(db: DB, sessionId: string) {
  return must(
    "Gagal memuat pesan",
    await db
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("session_id", sessionId)
      .order("created_at")
      .order("id"),
  );
}

export type ChatMessageRow = Awaited<ReturnType<typeof getChatMessages>>[number];
