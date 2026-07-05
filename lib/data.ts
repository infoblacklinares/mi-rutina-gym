import type { SupabaseClient } from "@supabase/supabase-js";
import { ROUTINE } from "@/lib/routines";
import type { RoutineDay } from "@/lib/routines";

export type UserRoutine = {
  id: string;
  title: string;
  shareCode: string;
  days: RoutineDay[];
};

type DayRow = { id: string; day_number: number; title: string; extra: string | null };
type ExerciseRow = {
  day_id: string;
  name: string;
  sets: number;
  reps: string;
  image: string;
  tip: string;
  order_index: number;
  exercise_id: string | null;
};
type LibraryRow = { id: string; image: string; tip: string };

function buildDays(
  dayRows: DayRow[],
  exerciseRows: ExerciseRow[],
  library: Map<string, LibraryRow>
): RoutineDay[] {
  return dayRows
    .sort((a, b) => a.day_number - b.day_number)
    .map((d) => ({
      day: d.day_number,
      title: d.title,
      muscleGroup: "",
      color: "#0b3557",
      gradient: "",
      emoji: "",
      extra: d.extra ?? undefined,
      exercises: exerciseRows
        .filter((e) => e.day_id === d.id)
        .sort((a, b) => a.order_index - b.order_index)
        .map((e) => {
          const lib = e.exercise_id ? library.get(e.exercise_id) : undefined;
          return {
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            // La librería global tiene prioridad: una imagen/tip sirve para todos
            image: lib?.image || e.image,
            tip: lib?.tip || e.tip,
          };
        }),
    }));
}

async function fetchRoutineContent(supabase: SupabaseClient, routineId: string) {
  const { data: dayRows } = await supabase
    .from("routine_days")
    .select("id, day_number, title, extra")
    .eq("routine_id", routineId);

  const dayIds = (dayRows ?? []).map((d) => d.id);
  const { data: exerciseRows } = dayIds.length
    ? await supabase
        .from("routine_exercises")
        .select("day_id, name, sets, reps, image, tip, order_index, exercise_id")
        .in("day_id", dayIds)
    : { data: [] };

  const libraryIds = Array.from(
    new Set((exerciseRows ?? []).map((e) => e.exercise_id).filter(Boolean))
  ) as string[];
  const { data: libraryRows } = libraryIds.length
    ? await supabase
        .from("exercise_library")
        .select("id, image, tip")
        .in("id", libraryIds)
    : { data: [] };
  const library = new Map((libraryRows ?? []).map((l) => [l.id, l]));

  return buildDays(dayRows ?? [], exerciseRows ?? [], library);
}

async function seedDefaultRoutine(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data: routine } = await supabase
    .from("routines")
    .insert({ owner_id: userId, title: "Mi Rutina" })
    .select("id")
    .single();

  if (!routine) return null;

  // IDs de la librería global para vincular
  const allNames = ROUTINE.flatMap((d) => d.exercises.map((e) => e.name));
  const { data: libRows } = await supabase
    .from("exercise_library")
    .select("id, name")
    .in("name", allNames);
  const libIdByName = new Map((libRows ?? []).map((l) => [l.name, l.id]));

  for (const day of ROUTINE) {
    const { data: dayRow } = await supabase
      .from("routine_days")
      .insert({
        routine_id: routine.id,
        day_number: day.day,
        title: day.title,
        extra: day.extra ?? null,
      })
      .select("id")
      .single();

    if (dayRow) {
      await supabase.from("routine_exercises").insert(
        day.exercises.map((ex, i) => ({
          day_id: dayRow.id,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          image: ex.image,
          tip: ex.tip,
          order_index: i,
          exercise_id: libIdByName.get(ex.name) ?? null,
        }))
      );
    }
  }

  return routine.id;
}

/** Rutina del usuario; si no tiene, se le crea la default automáticamente. */
export async function getUserRoutine(
  supabase: SupabaseClient,
  userId: string
): Promise<UserRoutine | null> {
  let { data: routine } = await supabase
    .from("routines")
    .select("id, title, share_code")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!routine) {
    const newId = await seedDefaultRoutine(supabase, userId);
    if (!newId) return null;
    const { data: fresh } = await supabase
      .from("routines")
      .select("id, title, share_code")
      .eq("id", newId)
      .single();
    routine = fresh;
  }

  if (!routine) return null;

  const days = await fetchRoutineContent(supabase, routine.id);
  return { id: routine.id, title: routine.title, shareCode: routine.share_code, days };
}

/** Rutina pública por código de compartir (para /r/[code]). */
export async function getRoutineByShareCode(supabase: SupabaseClient, code: string) {
  const { data: routine } = await supabase
    .from("routines")
    .select("id, title, share_code")
    .eq("share_code", code)
    .maybeSingle();

  if (!routine) return null;
  const days = await fetchRoutineContent(supabase, routine.id);
  return { id: routine.id, title: routine.title, shareCode: routine.share_code, days };
}

/** Racha: días consecutivos con al menos una sesión, contando desde hoy o ayer. */
export function computeStreak(sessionDates: string[]): number {
  const days = new Set(
    sessionDates.map((d) => new Date(d).toISOString().slice(0, 10))
  );
  const today = new Date();
  const cursor = new Date(today);

  // La racha puede empezar hoy o ayer (todavía no entrenaste hoy)
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.toISOString().slice(0, 10))) return 0;
  }

  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
