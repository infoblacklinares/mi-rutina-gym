import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getUserRoutine, computeStreak } from "@/lib/data";
import { ensureProfile } from "@/lib/social";
import BottomNav from "@/components/BottomNav";
import ShareButton from "@/components/ShareButton";

const TZ_OFFSET_HOURS = -4; // GMT-4

function localNow(): Date {
  return new Date(Date.now() + TZ_OFFSET_HOURS * 3600 * 1000);
}

function greeting(): string {
  const h = localNow().getUTCHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function weekDays(trainedDates: Set<string>) {
  const now = localNow();
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7));
  const labels = ["L", "M", "X", "J", "V", "S", "D"];
  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    return {
      label,
      date: d.getUTCDate(),
      trained: trainedDates.has(key),
      isToday: key === now.toISOString().slice(0, 10),
    };
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const routine = user ? await getUserRoutine(supabase, user.id) : null;
  if (user) await ensureProfile(supabase, user.id, user.email ?? "atleta");

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("day_number, started_at, completed_at, duration_minutes")
    .eq("user_id", user?.id ?? "")
    .order("started_at", { ascending: false })
    .limit(60);

  const lastByDay = new Map<number, string>();
  const completedDays = new Set<number>();
  const trainedDates = new Set<string>();
  let totalMinutes = 0;
  for (const s of sessions ?? []) {
    if (!lastByDay.has(s.day_number)) lastByDay.set(s.day_number, s.started_at);
    if (s.completed_at) {
      completedDays.add(s.day_number);
      trainedDates.add(new Date(s.started_at).toISOString().slice(0, 10));
    }
    totalMinutes += s.duration_minutes ?? 0;
  }

  const totalSessions = sessions?.filter((s) => s.completed_at).length ?? 0;
  const username = user?.email?.split("@")[0] ?? "Atleta";
  const streak = computeStreak(
    (sessions ?? []).filter((s) => s.completed_at).map((s) => s.started_at)
  );

  const days = routine?.days ?? [];
  const nextDay = days.find((d) => !completedDays.has(d.day)) ?? days[0];
  const week = weekDays(trainedDates);
  const trainedThisWeek = week.filter((d) => d.trained).length;

  return (
    <>
      <main className="flex-1 max-w-lg md:max-w-4xl w-full mx-auto">
        {/* ─── Hero ─── */}
        <div className="relative overflow-hidden rounded-b-[32px] glass md:rounded-3xl md:mt-6 md:mx-5 anim-rise" style={{ background: "linear-gradient(160deg, rgba(45,212,191,0.16) 0%, rgba(10,15,20,0.5) 55%, rgba(94,234,212,0.08) 100%)" }}>
          <Image
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80"
            alt=""
            fill
            className="object-cover opacity-20 mix-blend-luminosity"
            unoptimized
          />
          <div className="relative px-5 md:px-8 pt-12 md:pt-8 pb-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#2dd4bf]" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3c3 3 3 15 0 18M3 12h18" strokeLinecap="round" />
                </svg>
                <span className="text-white font-semibold text-lg">Mi Rutina</span>
              </div>
              <div className="flex items-center gap-2">
                {streak > 0 && (
                  <div className="flex items-center gap-1 rounded-full bg-[#2dd4bf]/20 border border-[#2dd4bf]/40 px-3 py-1.5 anim-pop">
                    <span className="text-sm anim-flame">🔥</span>
                    <span className="text-[#5eead4] text-xs font-bold">{streak}</span>
                  </div>
                )}
                <Link href="/profile" className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-semibold text-sm capitalize hover:bg-white/20">
                  {username[0]}
                </Link>
              </div>
            </div>

            <div className="md:flex md:items-end md:justify-between md:gap-8">
              <div className="flex-1">
                <p className="text-white/50 text-sm capitalize">{greeting()}, {username}</p>
                <h1 className="text-white text-3xl md:text-4xl font-bold tracking-tight mt-1 mb-4">
                  {nextDay ? <>Hoy: <span className="text-[#2dd4bf]">{nextDay.title}</span></> : "Tu rutina"}
                </h1>
                {routine && <div className="mb-6"><ShareButton shareCode={routine.shareCode} /></div>}
              </div>

              {/* Calendario semanal */}
              <div className="rounded-2xl bg-black/25 border border-white/10 p-3 md:min-w-[300px] mb-5 md:mb-0">
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">Esta semana</p>
                  <p className="text-[10px] text-[#5eead4] font-bold">{trainedThisWeek}/7 días</p>
                </div>
                <div className="flex justify-between">
                  {week.map((d) => (
                    <div key={d.label + d.date} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-white/40 font-semibold">{d.label}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        d.trained
                          ? "bg-[#2dd4bf] text-[#04211c]"
                          : d.isToday
                          ? "border border-[#2dd4bf] text-[#5eead4]"
                          : "bg-white/5 text-white/40"
                      }`}>
                        {d.trained ? "✓" : d.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-end justify-between md:justify-start md:gap-14 text-white mt-2">
              <div>
                <p className="text-2xl font-bold">{totalSessions}</p>
                <p className="text-[11px] text-white/50">Sesiones</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{streak}<span className="text-white/40 text-base"> 🔥</span></p>
                <p className="text-[11px] text-white/50">Racha</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMinutes}</p>
                <p className="text-[11px] text-white/50">Minutos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#5eead4]">{days.length ? Math.round((completedDays.size / days.length) * 100) : 0}%</p>
                <p className="text-[11px] text-white/50">Rutina</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Layout 2 columnas en desktop ─── */}
        <div className="md:grid md:grid-cols-[1fr_1.4fr] md:gap-6 md:px-5 md:pt-6">

          {/* Tarjeta de hoy */}
          {nextDay && (
            <div className="px-5 md:px-0 pt-5 md:pt-0 anim-rise" style={{ animationDelay: "0.08s" }}>
              <div className="glass rounded-3xl card-shadow card-hover p-5 md:sticky md:top-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-bold text-[#f8fafc]">Entrenamiento de hoy</h2>
                  <span className="text-xs text-[#9aa7b2]">{nextDay.exercises.length} ejercicios</span>
                </div>
                <p className="text-sm text-[#9aa7b2] mb-4">
                  Día {nextDay.day}{nextDay.extra ? ` · ${nextDay.extra}` : ""}
                </p>

                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full bg-[#2dd4bf] transition-all duration-700"
                    style={{ width: `${days.length ? (completedDays.size / days.length) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-[#9aa7b2] mb-4">{completedDays.size} de {days.length} días completados</p>

                <Link
                  href={`/day/${nextDay.day}`}
                  className="block w-full text-center rounded-full bg-[#2dd4bf] text-[#04211c] font-bold py-3.5 active:scale-[0.98] hover:bg-[#5eead4]"
                >
                  Empezar entrenamiento →
                </Link>
              </div>
            </div>
          )}

          {/* Plan semanal */}
          <div className="px-5 md:px-0 mt-7 md:mt-0">
            <div className="flex items-center justify-between mb-3 anim-rise" style={{ animationDelay: "0.12s" }}>
              <h2 className="font-bold text-[#f8fafc]">Plan semanal</h2>
              <Link href="/history" className="text-xs font-semibold text-[#5eead4] hover:underline">Ver progreso</Link>
            </div>

            <div className="space-y-3 pb-6">
              {days.map((day, idx) => {
                const last = lastByDay.get(day.day);
                const done = completedDays.has(day.day);
                return (
                  <Link
                    key={day.day}
                    href={`/day/${day.day}`}
                    className="flex items-center gap-4 glass rounded-3xl card-shadow card-hover p-4 active:scale-[0.98] anim-rise"
                    style={{ animationDelay: `${0.15 + idx * 0.05}s` }}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                      done ? "bg-[#2dd4bf] text-[#04211c]" : "bg-white/5 text-[#2dd4bf]"
                    }`}>
                      {done ? "✓" : day.day}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] text-[#f8fafc]">{day.title}</p>
                      <p className="text-xs text-[#9aa7b2] mt-0.5">
                        {day.exercises.length} ejercicios
                        {last && ` · ${new Date(last).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}`}
                      </p>
                    </div>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#3a4652] flex-shrink-0">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                    </svg>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
