import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PersonaAvatar } from "@/components/chat/persona-avatar";
import { ChatWindow } from "@/components/chat/chat-window";
import { MockBanner } from "@/components/chat/mock-banner";
import { SessionList } from "@/components/chat/session-list";
import { HistorySheet } from "@/components/chat/history-sheet";
import { getCurrentUser } from "@/lib/supabase/server";
import { getChatMessages, getChatSession, getChatSessions } from "@/lib/queries/chat";
import { getPublicPersonas } from "@/lib/queries/personas";
import { getActiveLanguages } from "@/lib/queries/content";
import { getProfile } from "@/lib/queries/progress";

export const metadata: Metadata = { title: "Obrolan" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ChatSessionPage({
  params,
  searchParams,
}: {
  params: { sessionId: string };
  searchParams: { prompt?: string };
}) {
  if (!UUID_RE.test(params.sessionId)) notFound();
  const { supabase, user } = await getCurrentUser();
  const userId = user!.id;

  // RLS memastikan hanya sesi milik user yang terbaca.
  const session = await getChatSession(supabase, params.sessionId);
  if (!session || session.user_id !== userId) notFound();

  const [messages, personas, languages, profile, sessions] = await Promise.all([
    getChatMessages(supabase, session.id),
    getPublicPersonas(),
    getActiveLanguages(supabase),
    getProfile(supabase, userId),
    getChatSessions(supabase, userId),
  ]);
  const persona = personas.find((p) => p.id === session.persona_id) ?? null;
  const personaById = new Map(personas.map((p) => [p.id, p]));
  const languageName = persona?.language_id ? languages.find((l) => l.id === persona.language_id)?.name ?? null : null;
  const personaName = persona?.name ?? "Asisten";
  const sessionItems = sessions.map((s) => {
    const p = personaById.get(s.persona_id);
    return { ...s, persona: p ? { name: p.name, avatar_url: p.avatar_url } : null };
  });
  const initialPrompt = messages.length === 0 ? searchParams.prompt?.slice(0, 500) : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside aria-label="Riwayat obrolan" className="hidden space-y-3 lg:block">
        <Button asChild variant="asisten" size="sm" block>
          <Link href="/asisten">
            <Plus aria-hidden="true" /> Obrolan baru
          </Link>
        </Button>
        <div className="max-h-[calc(100dvh-12rem)] overflow-y-auto pr-1">
          <SessionList sessions={sessionItems} activeId={session.id} />
        </div>
      </aside>

      <div className="min-w-0 space-y-3">
        <div className="flex items-center gap-3">
          <Link
            href="/asisten"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl hover:bg-muted lg:hidden"
            aria-label="Kembali ke daftar asisten"
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
          </Link>
          <PersonaAvatar src={persona?.avatar_url} className="size-11" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl">{personaName}</h1>
            {languageName ? <Badge variant="asisten">{languageName}</Badge> : <p className="text-xs text-muted-foreground">Asisten AI</p>}
          </div>
          <div className="lg:hidden">
            <HistorySheet sessions={sessionItems} activeId={session.id} />
          </div>
        </div>
        <MockBanner />
        <ChatWindow
          sessionId={session.id}
          persona={{ name: personaName, avatar_url: persona?.avatar_url ?? null, languageName }}
          initialMessages={messages.map((m) => ({ id: String(m.id), role: m.role, content: m.content, createdAt: m.created_at }))}
          initialPrompt={initialPrompt}
          me={{ name: profile?.full_name ?? profile?.username ?? null, avatar_url: profile?.avatar_url ?? null }}
        />
      </div>
    </div>
  );
}
