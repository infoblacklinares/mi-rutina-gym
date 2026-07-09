"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { RoutineDay } from "@/lib/routines";
import type { LastSetData } from "@/app/day/[dayNumber]/page";
import SharePRButton, { type PR } from "@/components/SharePRButton";

export default function WorkoutRunner({
  day,
  userId,
  lastSets,
}: {
  day: RoutineDay;
  userId: string;
  lastSets: Record<string, Record<number, LastSetData>>;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [prs, setPrs] = useState<PR[]>([]);
  const startedAt = useRef(Date.now());

  function lastWeightOf(exerciseName: string): number | null {
    const sets = lastSets[exerciseName];
    if (!sets) return null;
    const weights = Object.values(sets)
      .map((s) => s.weight)
      .filter((w): w is number => w != null);
    return weights.length ? Math.max(...weights) : null;
  }

  const [weights, setWeights] = useState<string[]>(() =>
    day.exercises.map((ex) => {
      const w = lastWeightOf(ex.name);
      return w != null ? String(w) : "";
    })
  );

  // ─── Cronómetro de descanso ───
  const [chronoRunning, setChronoRunning] = useState(false);
  const [chronoSeconds, setChronoSeconds] = useState(0);
  const chronoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function toggleChrono() {
    if (chronoRunning) {
      if (chronoRef.current) clearInterval(chronoRef.current);
      setChronoRunning(false);
      setChronoSeconds(0);
    } else {
      setChronoSeconds(0);
      setChronoRunning(true);
      chronoRef.current = setInterval(() => setChronoSeconds((s) => s + 1), 1000);
    }
  }

  useEffect(() => () => { if (chronoRef.current) clearInterval(chronoRef.current); }, []);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  async function saveWorkout() {
    setSaving(true);
    const durationMinutes = Math.round((Date.now() - startedAt.current) / 60000);

    const { data: session } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: userId,
        day_number: day.day,
        day_title: day.title,
        completed_at: new Date().toISOString(),
        duration_minutes: durationMinutes,
      })
      .select("id")
      .single();

    const rows = day.exercises
      .map((ex, i) => ({ ex, w: weights[i] }))
      .filter(({ w }) => w !== "")
      .map(({ ex, w }) => ({
        user_id: userId,
        session_id: session?.id ?? null,
        day_number: day.day,
        exercise_name: ex.name,
        set_number: 1,
        weight_kg: Number(w),
        reps_done: null,
      }));

    if (rows.length) await supabase.from("workout_logs").insert(rows);

    // Detectar récords personales (peso de hoy > máximo histórico del ejercicio)
    const newPrs: PR[] = [];
    day.exercises.forEach((ex, i) => {
      const w = weights[i];
      if (!w) return;
      const prev = lastWeightOf(ex.name);
      if (prev == null || Number(w) > prev) {
        if (prev != null) newPrs.push({ name: ex.name, weight: Number(w), prev });
      }
    });
    newPrs.sort((a, b) => (b.weight - (b.prev ?? 0)) - (a.weight - (a.prev ?? 0)));
    setPrs(newPrs);

    setSaving(false);
    setSaved(true);
  }

  /* ─── GUARDADO ─── */
  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center gap-6 px-4">
        <div className="w-24 h-24 rounded-full bg-[#0b3557]/10 flex items-center justify-center text-5xl">
          {prs.length > 0 ? "🏆" : "💪"}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-[#0c1c2c]">
            {prs.length > 0 ? "¡Nuevo récord!" : "¡Gran sesión!"}
          </h2>
          <p className="text-[#5f7185] mt-2">Día {day.day} — {day.title}</p>
        </div>

        {prs.length > 0 && (
          <div className="w-full max-w-xs space-y-2">
            {prs.map((pr) => (
              <div key={pr.name} className="rounded-2xl bg-white card-shadow px-4 py-3 flex items-center justify-between">
                <div className="text-left">
                  <p className="font-semibold text-sm text-[#0c1c2c]">{pr.name}</p>
                  <p className="text-xs text-[#8ba0b5]">antes {pr.prev} kg</p>
                </div>
                <p className="font-bold text-lg text-[#0b3557]">{pr.weight} kg 🎉</p>
              </div>
            ))}
          </div>
        )}

        {prs.length > 0 && <SharePRButton prs={prs} />}

        <button onClick={() => router.push("/")} className="w-full max-w-xs rounded-2xl bg-[#0b3557] text-white font-semibold py-4 text-base card-shadow">
          Volver al inicio
        </button>
      </div>
    );
  }

  /* ─── LISTA ÚNICA ─── */
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => router.push("/")} className="w-9 h-9 rounded-xl bg-white card-shadow flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#0b3557]">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <div>
          <p className="text-xs text-[#8ba0b5] font-semibold">DÍA {day.day}</p>
          <h1 className="font-bold text-lg text-[#0c1c2c] leading-tight">{day.title}</h1>
        </div>
      </div>

      {/* Cronómetro de descanso */}
      <button
        onClick={toggleChrono}
        className={`w-full rounded-2xl card-shadow py-3 px-4 flex items-center justify-between transition-colors ${
          chronoRunning ? "bg-[#0b3557]" : "bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${chronoRunning ? "text-white" : "text-[#0b3557]"}`}>
            <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0 0 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
          <span className={`text-sm font-semibold ${chronoRunning ? "text-white/80" : "text-[#5f7185]"}`}>
            {chronoRunning ? "Descansando..." : "Cronómetro de descanso"}
          </span>
        </div>
        <span className={`text-2xl font-bold tabular-nums ${chronoRunning ? "text-white" : "text-[#0b3557]"}`}>
          {chronoRunning ? fmt(chronoSeconds) : "▶"}
        </span>
      </button>

      {/* Lista de ejercicios con peso editable */}
      <div className="rounded-3xl bg-white card-shadow p-2">
        {day.exercises.map((ex, i) => (
          <div key={ex.name}>
          <div className="flex items-center gap-3 p-3">
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="flex items-center gap-3 flex-1 min-w-0 text-left active:opacity-60 transition-opacity"
            >
              <div className="w-9 h-9 rounded-xl bg-[#eef3f8] flex items-center justify-center text-sm font-bold text-[#0b3557] flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#0c1c2c] flex items-center gap-1.5">
                  {ex.name}
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`w-3.5 h-3.5 text-[#9db0c3] flex-shrink-0 transition-transform ${expanded === i ? "rotate-180" : ""}`}
                  >
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                  </svg>
                </p>
                <p className="text-xs text-[#8ba0b5]">{ex.sets} × {ex.reps}</p>
              </div>
            </button>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <input
                type="number"
                inputMode="decimal"
                placeholder="—"
                value={weights[i]}
                onChange={(e) =>
                  setWeights((prev) => {
                    const next = prev.slice();
                    next[i] = e.target.value;
                    return next;
                  })
                }
                className="w-16 rounded-xl bg-[#f4f8fc] border border-[#dbe4ee] px-2 py-2 text-base font-bold text-center text-[#0c1c2c] outline-none focus:border-[#0b3557] transition-colors"
              />
              <span className="text-xs font-semibold text-[#8ba0b5]">kg</span>
            </div>
          </div>

          {/* Imagen expandida a todo el ancho */}
          {expanded === i && (
            <div className="px-2 pb-3">
              {ex.image ? (
                <Image
                  src={ex.image}
                  alt={ex.name}
                  width={1200}
                  height={675}
                  className="w-full h-auto rounded-2xl"
                  unoptimized
                />
              ) : (
                <div className="w-full aspect-video rounded-2xl bg-[#f4f8fc] flex flex-col items-center justify-center gap-1 text-[#9db0c3]">
                  <span className="text-4xl">🏋️</span>
                  <span className="text-xs font-medium">Imagen próximamente</span>
                </div>
              )}
            </div>
          )}
          </div>
        ))}
      </div>

      {/* Extra */}
      {day.extra && (
        <div className="rounded-2xl bg-[#fff5e9] border border-[#ffe1bd] px-4 py-3 flex items-center gap-3">
          <span className="text-xl">⚡</span>
          <p className="text-sm text-[#8a5211]">{day.extra}</p>
        </div>
      )}

      {/* Guardar */}
      <button
        onClick={saveWorkout}
        disabled={saving}
        className="w-full rounded-2xl bg-[#0b3557] text-white font-semibold py-4 text-base card-shadow active:scale-[0.98] transition-transform disabled:opacity-50 mb-4"
      >
        {saving ? "Guardando..." : "Guardar entrenamiento"}
      </button>

    </div>
  );
}
