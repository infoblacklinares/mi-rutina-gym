import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRoutineByShareCode } from "@/lib/data";
import CopyRoutineButton from "@/components/CopyRoutineButton";

export default async function SharedRoutinePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();

  const routine = await getRoutineByShareCode(supabase, code);
  if (!routine) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const totalExercises = routine.days.reduce((acc, d) => acc + d.exercises.length, 0);

  return (
    <main className="flex-1 max-w-lg md:max-w-2xl w-full mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-b-[32px] px-5 pt-12 pb-8" style={{ background: "linear-gradient(160deg, #1c1613 0%, #241a14 60%, #3a2315 100%)" }}>
        <div className="flex items-center gap-2 mb-8">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3c3 3 3 15 0 18M3 12h18" strokeLinecap="round" />
          </svg>
          <span className="text-white font-semibold text-lg">Mi Rutina</span>
        </div>
        <p className="text-white/60 text-sm">Rutina compartida</p>
        <h1 className="text-white text-3xl font-bold tracking-tight mt-1 mb-3">{routine.title}</h1>
        <div className="flex gap-4 text-white/80 text-sm">
          <span>{routine.days.length} días</span>
          <span>·</span>
          <span>{totalExercises} ejercicios</span>
        </div>
      </div>

      {/* Días */}
      <div className="px-5 pt-5 space-y-3 pb-4">
        {routine.days.map((day) => (
          <div key={day.day} className="bg-[#211b16] rounded-3xl card-shadow p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#262019] flex items-center justify-center font-bold text-[#f97316]">
                {day.day}
              </div>
              <div>
                <p className="font-semibold text-[#f2ede9]">{day.title}</p>
                {day.extra && <p className="text-xs text-[#fb923c]">⚡ {day.extra}</p>}
              </div>
            </div>
            <ul className="space-y-1.5">
              {day.exercises.map((ex) => (
                <li key={ex.name} className="flex items-center justify-between text-sm">
                  <span className="text-[#f2ede9]">{ex.name}</span>
                  <span className="text-[#8a7f76] text-xs">{ex.sets} × {ex.reps}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* CTA fija */}
      <div className="sticky bottom-0 bg-gradient-to-t from-[#262019] via-[#262019] to-transparent px-5 pt-4 pb-6">
        <CopyRoutineButton code={code} loggedIn={!!user} />
      </div>
    </main>
  );
}
