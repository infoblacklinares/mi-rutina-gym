"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { RoutineDay } from "@/lib/routines";
import type { LastSetData } from "@/app/day/[dayNumber]/page";

const NAVY = "#0b3557";

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

  const [started, setStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());

  // Último peso conocido por ejercicio
  function lastWeightOf(exerciseName: string): number | null {
    const sets = lastSets[exerciseName];
    if (!sets) return null;
    const weights = Object.values(sets)
      .map((s) => s.weight)
      .filter((w): w is number => w != null);
    return weights.length ? Math.max(...weights) : null;
  }

  // Un peso por ejercicio, precargado con el de la última vez
  const [weights, setWeights] = useState<string[]>(() =>
    day.exercises.map((ex) => {
      const w = lastWeightOf(ex.name);
      return w != null ? String(w) : "";
    })
  );
  const savedRef = useRef<boolean[]>(day.exercises.map(() => false));

  // ─── Cronómetro de descanso (manual) ───
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

  async function startWorkout(atIndex = 0) {
    setExerciseIndex(atIndex);
    setStarted(true);
    startedAt.current = Date.now();
    if (!sessionId) {
      const { data } = await supabase
        .from("workout_sessions")
        .insert({ user_id: userId, day_number: day.day, day_title: day.title })
        .select("id")
        .single();
      if (data) setSessionId(data.id);
    }
  }

  // Guarda el peso del ejercicio actual (una vez por sesión, si hay valor)
  async function saveCurrent(index: number) {
    const w = weights[index];
    if (!w || savedRef.current[index]) return;
    savedRef.current[index] = true;
    await supabase.from("workout_logs").insert({
      user_id: userId,
      session_id: sessionId,
      day_number: day.day,
      exercise_name: day.exercises[index].name,
      set_number: 1,
      weight_kg: Number(w),
      reps_done: null,
    });
  }

  function goTo(index: number) {
    saveCurrent(exerciseIndex);
    setExerciseIndex(index);
  }

  async function finishWorkout() {
    setFinishing(true);
    await saveCurrent(exerciseIndex);
    const durationMinutes = Math.round((Date.now() - startedAt.current) / 60000);
    if (sessionId) {
      await supabase.from("workout_sessions")
        .update({ completed_at: new Date().toISOString(), duration_minutes: durationMinutes })
        .eq("id", sessionId);
    }
    setFinishing(false);
    setFinished(true);
  }

  const exercise = day.exercises[exerciseIndex];

  /* ─── LISTA DE EJERCICIOS ─── */
  if (!started) {
    return (
      <div className="flex flex-col gap-4">
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

        <div className="rounded-3xl bg-white card-shadow p-2">
          {day.exercises.map((ex, i) => {
            const w = lastWeightOf(ex.name);
            return (
              <button
                key={ex.name}
                onClick={() => startWorkout(i)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl active:bg-[#f4f8fc] transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-[#eef3f8] flex items-center justify-center text-sm font-bold text-[#0b3557] flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#0c1c2c] truncate">{ex.name}</p>
                  <p className="text-xs text-[#8ba0b5]">{ex.sets} × {ex.reps}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {w != null ? (
                    <>
                      <p className="font-bold text-[#0b3557]">{w} kg</p>
                      <p className="text-[10px] text-[#9db0c3]">última vez</p>
                    </>
                  ) : (
                    <p className="text-xs text-[#c3cfdc]">— kg</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {day.extra && (
          <div className="rounded-2xl bg-[#fff5e9] border border-[#ffe1bd] px-4 py-3 flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <p className="text-sm text-[#8a5211]">{day.extra}</p>
          </div>
        )}

        <button
          onClick={() => startWorkout(0)}
          className="w-full rounded-2xl bg-[#0b3557] text-white font-semibold py-4 text-base card-shadow active:scale-[0.98] transition-transform"
        >
          Empezar entrenamiento
        </button>
      </div>
    );
  }

  /* ─── PANTALLA FINAL ─── */
  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center gap-6 px-4">
        <div className="w-24 h-24 rounded-full bg-[#0b3557]/10 flex items-center justify-center text-5xl">🏆</div>
        <div>
          <h2 className="text-3xl font-bold text-[#0c1c2c]">¡Gran sesión!</h2>
          <p className="text-[#5f7185] mt-2">Día {day.day} — {day.title}</p>
          <p className="text-sm text-[#8ba0b5] mt-1">
            {Math.round((Date.now() - startedAt.current) / 60000)} min de entrenamiento
          </p>
        </div>
        <button onClick={() => router.push("/")} className="w-full max-w-xs rounded-2xl bg-[#0b3557] text-white font-semibold py-4 text-base card-shadow">
          Volver al inicio
        </button>
      </div>
    );
  }

  /* ─── PANTALLA EJERCICIO ─── */
  return (
    <div className="flex flex-col gap-4">

      {/* Top bar */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStarted(false)} className="w-9 h-9 rounded-xl bg-white card-shadow flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#0b3557]">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <p className="text-xs text-[#5f7185] font-semibold">DÍA {day.day} — {day.title.toUpperCase()}</p>
        <p className="text-xs font-bold text-[#0b3557]">{exerciseIndex + 1}/{day.exercises.length}</p>
      </div>

      {/* ─── Cronómetro de descanso ─── */}
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

      {/* Exercise image */}
      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-[#dbe5ef] card-shadow">
        <Image
          src={exercise.image}
          alt={exercise.name}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b3557]/85 via-[#0b3557]/10 to-transparent" />

        {/* Nav dots */}
        <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5">
          {day.exercises.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-200 ${
                i === exerciseIndex ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40"
              }`}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-2xl font-bold text-white leading-tight">{exercise.name}</h2>
          <p className="text-sm font-medium text-white/75 mt-0.5">
            {exercise.sets} series · {exercise.reps} reps
          </p>
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-2xl bg-white card-shadow px-4 py-3 flex items-start gap-3">
        <span className="text-lg mt-0.5">💡</span>
        <p className="text-sm text-[#5f7185] leading-relaxed">{exercise.tip}</p>
      </div>

      {/* ─── Peso ─── */}
      <div className="rounded-3xl bg-white card-shadow p-5 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs text-[#8ba0b5] uppercase tracking-widest font-semibold">Peso de hoy</p>
          {lastWeightOf(exercise.name) != null && (
            <p className="text-xs text-[#9db0c3] mt-0.5">Última vez: {lastWeightOf(exercise.name)} kg</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={weights[exerciseIndex]}
            onChange={(e) =>
              setWeights((prev) => {
                const next = prev.slice();
                next[exerciseIndex] = e.target.value;
                return next;
              })
            }
            className="w-24 rounded-2xl bg-[#f4f8fc] border border-[#dbe4ee] px-3 py-3 text-2xl font-bold text-center text-[#0c1c2c] outline-none focus:border-[#0b3557] transition-colors"
          />
          <span className="text-sm font-semibold text-[#5f7185]">kg</span>
        </div>
      </div>

      {/* HIIT / Cardio */}
      {day.extra && (
        <div className="rounded-2xl bg-[#fff5e9] border border-[#ffe1bd] px-4 py-3 flex items-center gap-3">
          <span className="text-xl">⚡</span>
          <div>
            <p className="text-xs text-[#b46609] font-bold uppercase tracking-wide">Al finalizar</p>
            <p className="text-sm text-[#8a5211]">{day.extra}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pb-4">
        <button
          onClick={() => goTo(Math.max(0, exerciseIndex - 1))}
          disabled={exerciseIndex === 0}
          className="flex-1 rounded-2xl bg-white card-shadow py-4 font-semibold text-sm disabled:opacity-40 text-[#0b3557]"
        >
          ← Anterior
        </button>

        {exerciseIndex < day.exercises.length - 1 ? (
          <button
            onClick={() => goTo(exerciseIndex + 1)}
            className="flex-1 rounded-2xl font-semibold py-4 text-sm text-white card-shadow"
            style={{ background: NAVY }}
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={finishWorkout}
            disabled={finishing}
            className="flex-1 rounded-2xl bg-[#0b3557] text-white font-semibold py-4 text-sm disabled:opacity-50 card-shadow"
          >
            {finishing ? "Guardando..." : "Finalizar 🏁"}
          </button>
        )}
      </div>
    </div>
  );
}
