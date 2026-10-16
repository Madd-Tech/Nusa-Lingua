import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/learning/lesson/lesson-player";
import { getCurrentUser } from "@/lib/supabase/server";
import { getLessonForPlayer } from "@/lib/queries/content";
import { getMasteryFor, getProfile } from "@/lib/queries/progress";
import type { LessonQuestion } from "@/lib/questions";
import type { MasteryState } from "@/lib/srs";
import { parseId } from "@/lib/utils";

export const metadata: Metadata = { title: "Lesson" };

export default async function LessonPage({ params }: { params: { code: string; id: string } }) {
  const lessonId = parseId(params.id);
  if (!lessonId) notFound();

  const { supabase, user } = await getCurrentUser();
  const userId = user!.id;

  const data = await getLessonForPlayer(supabase, lessonId);
  const language = data?.lesson.unit?.language;
  if (!data || !language || language.code !== params.code) notFound();

  const questions: LessonQuestion[] = data.questions;
  const vocabIds = Array.from(new Set(questions.map((q) => q.vocabulary_id).filter((v): v is number => !!v)));

  const [profile, masteryRows] = await Promise.all([getProfile(supabase, userId), getMasteryFor(supabase, userId, vocabIds)]);

  const mastery: Record<number, MasteryState> = {};
  for (const m of masteryRows) {
    mastery[m.vocabulary_id] = { strength: m.strength, correct_count: m.correct_count, wrong_count: m.wrong_count };
  }

  return (
    <LessonPlayer
      userId={userId}
      lessonId={data.lesson.id}
      languageId={language.id}
      languageCode={language.code}
      lessonTitle={data.lesson.title}
      questions={questions}
      initialHearts={profile?.hearts ?? 5}
      mastery={mastery}
    />
  );
}
