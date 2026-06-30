import Link from "next/link";
import { ROUTINE } from "@/lib/routines";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("day_number, started_at")
    .order("started_at", { ascending: false })
    .limit(20);

  const lastByDay = new Map<number, string>();
  for (const s of sessions ?? []) {
    if (!lastByDay.has(s.day_number)) {
      lastByDay.set(s.day_number, s.started_at);
    }
  }

  return (
    <>
      <TopBar title="Mi Rutina" />
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 space-y-3">
        <h1 className="text-lg font-semibold text-neutral-300 mb-2">
          Elegí el día a entrenar
        </h1>

        {ROUTINE.map((day) => {
          const last = lastByDay.get(day.day);
          return (
            <Link
              key={day.day}
              href={`/day/${day.day}`}
              className="block rounded-2xl bg-neutral-900 border border-neutral-800 p-4 hover:border-emerald-500 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-400 text-sm font-bold">
                    DÍA {day.day}
                  </p>
                  <p className="font-semibold">{day.title}</p>
                </div>
                <span className="text-neutral-500 text-sm">
                  {day.exercises.length} ejercicios
                </span>
              </div>
              {last && (
                <p className="text-xs text-neutral-500 mt-2">
                  Última vez: {new Date(last).toLocaleDateString("es-AR")}
                </p>
              )}
            </Link>
          );
        })}
      </main>
    </>
  );
}
