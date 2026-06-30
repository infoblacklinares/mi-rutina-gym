import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
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
      <TopBar title="Historial" />
      <main className="flex-1 max-w-2xl w-full mx-auto p-4">
        <HistoryView sessions={sessions ?? []} logs={logs ?? []} />
      </main>
    </>
  );
}
