import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getUserRoutine, computeStreak } from "@/lib/data";
import BottomNav from "@/components/BottomNav";
import ShareButton from "@/components/ShareButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const routine = user ? await getUserRoutine(supabase, user.id) : null;

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("day_number, started_at, completed_at, duration_minutes")
    .order("started_at", { ascending: false })
    .limit(60);

  const lastByDay = new Map<number, string>();
  const completedDays = new Set<number>();
  let totalMinutes = 0;
  for (const s of sessions ?? []) {
    if (!lastByDay.has(s.day_number)) lastByDay.set(s.day_number, s.started_at);
    if (s.completed_at) completedDays.add(s.day_number);
    totalMinutes += s.duration_minutes ?? 0;
  }

  const totalSessions = sessions?.filter((s) => s.completed_at).length ?? 0;
  const username = user?.email?.split("@")[0] ?? "Atleta";
  const streak = computeStreak(
    (sessions ?? []).filter((s) => s.completed_at).map((s) => s.started_at)
  );

  const days = routine?.days ?? [];
  const nextDay = days.find((d) => !completedDays.has(d.day)) ?? days[0];

  return (
    <>
      <main className="flex-1 max-w-lg w-full mx-auto">
        {/* ─── Hero navy ─── */}
        <div className="relative overflow-hidden rounded-b-[32px]" style={{ background: "linear-gradient(160deg, #0b3557 0%, #14487a 60%, #2a6db3 100%)" }}>
          <Image
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"
            alt=""
            fill
            className="object-cover opacity-25 mix-blend-luminosity"
            unoptimized
          />
          <div className="relative px-5 pt-12 pb-6">
            {/* Top row */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3c3 3 3 15 0 18M3 12h18" strokeLinecap="round" />
                </svg>
                <span className="text-white font-semibold text-lg">Mi Rutina</span>
              </div>
              <div className="flex items-center gap-2">
                {streak > 0 && (
                  <div className="flex items-center gap-1 rounded-full bg-white/15 border border-white/25 px-3 py-1.5">
                    <span className="text-sm">🔥</span>
                    <span className="text-white text-xs font-bold">{streak}</span>
                  </div>
                )}
                <div className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white font-semibold text-sm capitalize">
                  {username[0]}
                </div>
              </div>
            </div>

            {/* Greeting */}
            <p className="text-white/60 text-sm capitalize">Hola, {username}</p>
            <h1 className="text-white text-3xl font-bold tracking-tight mt-1 mb-4">
              {nextDay ? `Hoy: ${nextDay.title}` : "Tu rutina"}
            </h1>

            {routine && <div className="mb-6"><ShareButton shareCode={routine.shareCode} /></div>}

            {/* Stats row */}
            <div className="flex items-end justify-between text-white">
              <div>
                <p className="text-2xl font-bold">{totalSessions}</p>
                <p className="text-[11px] text-white/60">Sesiones</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{streak}<span className="text-white/50 text-base"> 🔥</span></p>
                <p className="text-[11px] text-white/60">Racha</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMinutes}</p>
                <p className="text-[11px] text-white/60">Minutos</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{days.length ? Math.round((completedDays.size / days.length) * 100) : 0}%</p>
                <p className="text-[11px] text-white/60">Semana</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Tarjeta de hoy ─── */}
        {nextDay && (
          <div className="px-5 pt-5">
            <div className="bg-white rounded-3xl card-shadow p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold text-[#0c1c2c]">Entrenamiento de hoy</h2>
                <span className="text-xs text-[#5f7185]">{nextDay.exercises.length} ejercicios</span>
              </div>
              <p className="text-sm text-[#5f7185] mb-4">
                Día {nextDay.day}{nextDay.extra ? ` · ${nextDay.extra}` : ""}
              </p>

              <div className="h-1.5 bg-[#e9eff6] rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full bg-[#14487a] transition-all"
                  style={{ width: `${days.length ? (completedDays.size / days.length) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-[#5f7185] mb-4">{completedDays.size} de {days.length} días completados</p>

              <Link
                href={`/day/${nextDay.day}`}
                className="block w-full text-center rounded-2xl bg-[#0b3557] text-white font-semibold py-3.5 active:scale-[0.98] transition-transform"
              >
                Empezar entrenamiento
              </Link>
            </div>
          </div>
        )}

        {/* ─── Lista de días ─── */}
        <div className="px-5 mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[#0c1c2c]">Plan semanal</h2>
            <Link href="/history" className="text-xs font-semibold text-[#2f6fed]">Ver progreso</Link>
          </div>

          <div className="space-y-3 pb-6">
            {days.map((day) => {
              const last = lastByDay.get(day.day);
              const done = completedDays.has(day.day);
              return (
                <Link
                  key={day.day}
                  href={`/day/${day.day}`}
                  className="flex items-center gap-4 bg-white rounded-3xl card-shadow p-4 active:scale-[0.98] transition-transform"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                    done ? "bg-[#0b3557] text-white" : "bg-[#eef3f8] text-[#0b3557]"
                  }`}>
                    {done ? "✓" : day.day}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px] text-[#0c1c2c]">{day.title}</p>
                    <p className="text-xs text-[#5f7185] mt-0.5">
                      {day.exercises.length} ejercicios
                      {last && ` · ${new Date(last).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}`}
                    </p>
                  </div>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#c3cfdc] flex-shrink-0">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                  </svg>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
