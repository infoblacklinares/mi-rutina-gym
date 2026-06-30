import Link from "next/link";
import { ROUTINE } from "@/lib/routines";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";

const MUSCLE_COLORS: Record<string, string> = {
  "pecho-triceps": "bg-rose-500/15 text-rose-400",
  "espalda-biceps": "bg-blue-500/15 text-blue-400",
  piernas: "bg-orange-500/15 text-orange-400",
  "hombros-trapecios": "bg-purple-500/15 text-purple-400",
  "pecho-core": "bg-pink-500/15 text-pink-400",
  "full-body": "bg-emerald-500/15 text-emerald-400",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("day_number, started_at, completed_at")
    .order("started_at", { ascending: false })
    .limit(30);

  const lastByDay = new Map<number, string>();
  const completedDays = new Set<number>();
  for (const s of sessions ?? []) {
    if (!lastByDay.has(s.day_number)) {
      lastByDay.set(s.day_number, s.started_at);
    }
    if (s.completed_at) completedDays.add(s.day_number);
  }

  const totalSessions = sessions?.filter((s) => s.completed_at).length ?? 0;

  return (
    <>
      <main className="flex-1 max-w-lg w-full mx-auto px-4 pt-6 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-neutral-500 text-sm">Bienvenido 👋</p>
            <h1 className="text-2xl font-bold">{user?.email?.split("@")[0]}</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
            {user?.email?.[0]?.toUpperCase()}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl bg-[#161616] border border-[#252525] p-4">
            <p className="text-neutral-500 text-xs mb-1">Sesiones totales</p>
            <p className="text-3xl font-bold text-emerald-400">{totalSessions}</p>
          </div>
          <div className="rounded-2xl bg-[#161616] border border-[#252525] p-4">
            <p className="text-neutral-500 text-xs mb-1">Días entrenados</p>
            <p className="text-3xl font-bold text-emerald-400">{completedDays.size}<span className="text-neutral-600 text-lg">/6</span></p>
          </div>
        </div>

        {/* Routine Days */}
        <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-3">
          Rutina semanal
        </h2>

        <div className="space-y-3">
          {ROUTINE.map((day) => {
            const last = lastByDay.get(day.day);
            const done = completedDays.has(day.day);
            const colorClass = MUSCLE_COLORS[day.muscleGroup] ?? "bg-neutral-500/15 text-neutral-400";

            return (
              <Link
                key={day.day}
                href={`/day/${day.day}`}
                className="flex items-center gap-4 rounded-2xl bg-[#161616] border border-[#252525] p-4 active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1f1f1f] flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-black text-emerald-400">{day.day}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-sm">{day.title}</p>
                    {done && <span className="text-emerald-400 text-xs">✓</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
                      {day.exercises.length} ejercicios
                    </span>
                    {last && (
                      <span className="text-xs text-neutral-600">
                        {new Date(last).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}
                      </span>
                    )}
                  </div>
                </div>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-neutral-600 flex-shrink-0">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                </svg>
              </Link>
            );
          })}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
