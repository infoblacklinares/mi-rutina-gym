import Link from "next/link";
import { ROUTINE } from "@/lib/routines";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";

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
    if (!lastByDay.has(s.day_number)) lastByDay.set(s.day_number, s.started_at);
    if (s.completed_at) completedDays.add(s.day_number);
  }

  const totalSessions = sessions?.filter((s) => s.completed_at).length ?? 0;
  const username = user?.email?.split("@")[0] ?? "Atleta";

  return (
    <>
      <main className="flex-1 max-w-lg w-full mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-neutral-500 text-sm mb-1">Bienvenido de nuevo</p>
            <h1 className="text-3xl font-black capitalize">{username} 👋</h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-black font-black text-xl">
            {username[0].toUpperCase()}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-2xl bg-[#161616] border border-[#222] p-3 text-center">
            <p className="text-2xl font-black text-emerald-400">{totalSessions}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Sesiones</p>
          </div>
          <div className="rounded-2xl bg-[#161616] border border-[#222] p-3 text-center">
            <p className="text-2xl font-black text-emerald-400">{completedDays.size}<span className="text-neutral-600 text-sm">/6</span></p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Días</p>
          </div>
          <div className="rounded-2xl bg-[#161616] border border-[#222] p-3 text-center">
            <p className="text-2xl font-black text-emerald-400">
              {Math.round((completedDays.size / 6) * 100)}<span className="text-neutral-600 text-sm">%</span>
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Progreso</p>
          </div>
        </div>

        {/* Section title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Tu rutina semanal</h2>
          <span className="text-xs text-neutral-500">{ROUTINE.length} días</span>
        </div>

        {/* Day cards */}
        <div className="space-y-3 pb-6">
          {ROUTINE.map((day) => {
            const last = lastByDay.get(day.day);
            const done = completedDays.has(day.day);

            return (
              <Link
                key={day.day}
                href={`/day/${day.day}`}
                className="group relative flex items-center overflow-hidden rounded-3xl bg-[#161616] border border-[#222] p-4 active:scale-[0.97] transition-all duration-150"
              >
                {/* Color accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl"
                  style={{ background: day.color }}
                />

                {/* Day number bubble */}
                <div
                  className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ml-2 mr-4"
                  style={{ background: `${day.color}20` }}
                >
                  <span className="text-2xl">{day.emoji}</span>
                  <span className="text-[10px] font-bold mt-0.5" style={{ color: day.color }}>
                    DÍA {day.day}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base">{day.title}</h3>
                    {done && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">{day.muscleGroup}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-neutral-600">
                      {day.exercises.length} ejercicios
                    </span>
                    {day.extra && (
                      <>
                        <span className="text-neutral-700">·</span>
                        <span className="text-[11px] text-orange-500">{day.extra}</span>
                      </>
                    )}
                  </div>
                  {last && (
                    <p className="text-[11px] text-neutral-600 mt-1">
                      Última vez: {new Date(last).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-neutral-700 group-hover:text-neutral-400 transition-colors flex-shrink-0">
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
