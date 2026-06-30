import Link from "next/link";
import { ROUTINE } from "@/lib/routines";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";
import Image from "next/image";

function getWeekDays() {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { date: d.getDate(), label: ["L", "M", "X", "J", "V", "S", "D"][i], isToday: d.toDateString() === today.toDateString() };
  });
}

const DAY_IMAGES = [
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=600&q=80",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80",
  "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&q=80",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
];

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
  const weekDays = getWeekDays();
  const goal = 3;

  return (
    <>
      <main className="flex-1 max-w-lg w-full mx-auto">
        {/* Header */}
        <div className="px-5 pt-10 pb-4 flex items-center justify-between">
          <div>
            <p className="text-[#888] text-sm">Buenos días,</p>
            <h1 className="text-2xl font-black capitalize text-white">{username} 💪</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#D4FF00] flex items-center justify-center text-black font-black text-lg">
              {username[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-5 mb-5">
          <div className="flex items-center gap-3 bg-[#141414] border border-[#222] rounded-2xl px-4 py-3">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#555]">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <span className="text-[#555] text-sm">Buscar ejercicio...</span>
          </div>
        </div>

        {/* Weekly goal + calendar */}
        <div className="mx-5 mb-5 rounded-3xl bg-[#141414] border border-[#222] p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-[#888] uppercase tracking-widest font-semibold">Meta semanal</p>
              <p className="font-black text-white text-lg mt-0.5">
                {Math.min(totalSessions, goal)}<span className="text-[#555]">/{goal} días</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-[#D4FF00] flex items-center justify-center">
              <span className="text-xs font-black text-[#D4FF00]">
                {Math.round((Math.min(totalSessions, goal) / goal) * 100)}%
              </span>
            </div>
          </div>

          {/* Calendar strip */}
          <div className="flex justify-between">
            {weekDays.map((d) => (
              <div key={d.date} className="flex flex-col items-center gap-1.5">
                <p className="text-[10px] font-semibold text-[#555]">{d.label}</p>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  d.isToday
                    ? "bg-[#D4FF00] text-black"
                    : "text-[#888]"
                }`}>
                  {d.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Rutina de hoy */}
        <div className="px-5 mb-3">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-base text-white">Rutina semanal</h2>
            <span className="text-xs text-[#D4FF00] font-semibold">{completedDays.size}/{ROUTINE.length} completados</span>
          </div>
        </div>

        {/* Horizontal scroll cards */}
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide" style={{ scrollSnapType: "x mandatory" }}>
          {ROUTINE.map((day, idx) => {
            const done = completedDays.has(day.day);
            const last = lastByDay.get(day.day);
            return (
              <Link
                key={day.day}
                href={`/day/${day.day}`}
                className="relative flex-shrink-0 w-44 rounded-3xl overflow-hidden"
                style={{ scrollSnapAlign: "start" }}
              >
                {/* Background image */}
                <div className="relative h-56">
                  <Image
                    src={DAY_IMAGES[idx]}
                    alt={day.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Done badge */}
                  {done && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#D4FF00] flex items-center justify-center">
                      <span className="text-black font-black text-xs">✓</span>
                    </div>
                  )}

                  {/* Day number */}
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                    <span className="text-[10px] font-black text-[#D4FF00]">DÍA {day.day}</span>
                  </div>

                  {/* Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="font-black text-white text-sm leading-tight">{day.title}</p>
                    <p className="text-[11px] text-white/60 mt-1">{day.exercises.length} ejercicios</p>
                    {last && (
                      <p className="text-[10px] text-[#D4FF00] mt-1">
                        {new Date(last).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Start button */}
                <div className="bg-[#141414] px-3 py-3 flex items-center justify-between border-t border-[#222]">
                  <span className="text-xs font-bold text-white">{done ? "Repetir" : "Empezar"}</span>
                  <div className="w-7 h-7 rounded-full bg-[#D4FF00] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-black ml-0.5">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Continue training */}
        <div className="px-5 mt-6 mb-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-base text-white">Continuar entrenando</h2>
            <Link href="/history" className="text-xs text-[#D4FF00] font-semibold">Ver todo</Link>
          </div>

          <div className="space-y-3">
            {ROUTINE.slice(0, 3).map((day, idx) => {
              const done = completedDays.has(day.day);
              const pct = done ? 100 : 0;
              return (
                <Link
                  key={day.day}
                  href={`/day/${day.day}`}
                  className="flex items-center gap-3 rounded-2xl bg-[#141414] border border-[#222] p-3"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={DAY_IMAGES[idx]} alt={day.title} fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white">{day.title}</p>
                    <div className="mt-2 h-1.5 bg-[#222] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: "#D4FF00" }}
                      />
                    </div>
                    <p className="text-[10px] text-[#888] mt-1">{pct}% completado</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#D4FF00] flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-black ml-0.5">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="h-6" />
      </main>
      <BottomNav />
    </>
  );
}
