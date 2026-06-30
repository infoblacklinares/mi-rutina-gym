import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";
import HistoryView from "@/components/HistoryView";

export default async function HistoryPage() {
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("id, day_number, day_title, started_at, completed_at, duration_minutes")
    .order("started_at", { ascending: false })
    .limit(30);

  const { data: logs } = await supabase
    .from("workout_logs")
    .select("exercise_name, weight_kg, reps_done, created_at")
    .order("created_at", { ascending: true });

  return (
    <>
      <main className="flex-1 max-w-lg w-full mx-auto px-4 pt-6 pb-4">
        <div className="mb-6">
          <p className="text-neutral-500 text-sm">Tu progreso</p>
          <h1 className="text-2xl font-bold">Historial</h1>
        </div>
        <HistoryView sessions={sessions ?? []} logs={logs ?? []} />
      </main>
      <BottomNav />
    </>
  );
}
