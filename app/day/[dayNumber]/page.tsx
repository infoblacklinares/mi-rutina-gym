import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRoutine } from "@/lib/data";
import WorkoutRunner from "@/components/WorkoutRunner";

export type LastSetData = { weight: number | null; reps: number | null };

export default async function DayPage({
  params,
}: {
  params: Promise<{ dayNumber: string }>;
}) {
  const { dayNumber } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const routine = await getUserRoutine(supabase, user.id);
  const day = routine?.days.find((d) => d.day === Number(dayNumber));
  if (!day) notFound();

  // Últimos registros de este día para precargar pesos
  const { data: logs } = await supabase
    .from("workout_logs")
    .select("exercise_name, set_number, weight_kg, reps_done, created_at")
    .eq("day_number", day.day)
    .order("created_at", { ascending: false })
    .limit(200);

  const lastSets: Record<string, Record<number, LastSetData>> = {};
  for (const log of logs ?? []) {
    const byExercise = (lastSets[log.exercise_name] ??= {});
    if (!(log.set_number in byExercise)) {
      byExercise[log.set_number] = { weight: log.weight_kg, reps: log.reps_done };
    }
  }

  return (
    <main className="flex-1 max-w-lg md:max-w-xl w-full mx-auto px-4 pt-4 pb-6">
      <WorkoutRunner day={day} userId={user.id} lastSets={lastSets} />
    </main>
  );
}
