import type { UnitWithLessons } from "@/lib/queries/content";

export type LessonState = "completed" | "current" | "locked";
export type PathLesson = UnitWithLessons["lessons"][number] & { state: LessonState; stars: number; bestScore: number };
export type PathUnit = Omit<UnitWithLessons, "lessons"> & { lessons: PathLesson[] };

/**
 * Status lesson (urut unit → lesson): completed → selesai; lesson pertama yang belum selesai
 * → current; sisanya locked (terkunci jika lesson sebelumnya belum completed).
 */
export function computePath(
  units: UnitWithLessons[],
  progress: Map<number, { status: string; stars: number; best_score: number }>,
): PathUnit[] {
  let previousDone = true;
  return units.map((unit) => ({
    ...unit,
    lessons: unit.lessons.map((lesson) => {
      const p = progress.get(lesson.id);
      const done = p?.status === "completed";
      const state: LessonState = done ? "completed" : previousDone ? "current" : "locked";
      previousDone = done;
      return { ...lesson, state, stars: p?.stars ?? 0, bestScore: p?.best_score ?? 0 };
    }),
  }));
}
