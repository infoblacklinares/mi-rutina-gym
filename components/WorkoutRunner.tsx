"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { RoutineDay } from "@/lib/routines";

type SetLog = { weight: string; reps: string; done: boolean };

const REST_SECONDS = 60;

export default function WorkoutRunner({ day, userId }: { day: RoutineDay; userId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setLogs, setSetLogs] = useState<SetLog[][]>(() =>
    day.exercises.map((ex) =>
      Array.from({ length: ex.sets }, () => ({ weight: "", reps: "", done: false }))
    )
  );
  const [resting, setResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(REST_SECONDS);
  const [finishing, setFinishing] = useState(false);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("workout_sessions")
      .insert({ user_id: userId, day_number: day.day, day_title: day.title })
      .select("id")
      .single()
      .then(({ data }) => { if (!cancelled && data) setSessionId(data.id); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopRest = useCallback(() => {
    if (restRef.current) clearInterval(restRef.current);
    setResting(false);
    setRestSeconds(REST_SECONDS);
  }, []);

  function startRest() {
    setResting(true);
    setRestSeconds(REST_SECONDS);
    restRef.current = setInterval(() => {
      setRestSeconds((s) => {
        if (s <= 1) { stopRest(); return REST_SECONDS; }
        return s - 1;
      });
    }, 1000);
  }

  useEffect(() => () => { if (restRef.current) clearInterval(restRef.current); }, []);

  const exercise = day.exercises[exerciseIndex];
  const sets = setLogs[exerciseIndex];
  const activeSetIndex = sets.findIndex((s) => !s.done);
  const allSetsDone = activeSetIndex === -1;
  const isLastExercise = exerciseIndex === day.exercises.length - 1;
  const totalDone = setLogs.reduce((acc, ex) => acc + ex.filter((s) => s.done).length, 0);
  const totalSets = setLogs.reduce((acc, ex) => acc + ex.length, 0);

  function updateSet(setIndex: number, field: "weight" | "reps", value: string) {
    setSetLogs((prev) => {
      const next = prev.map((arr) => arr.slice());
      next[exerciseIndex][setIndex] = { ...next[exerciseIndex][setIndex], [field]: value };
      return next;
    });
  }

  async function completeSet(setIndex: number) {
    setSetLogs((prev) => {
      const next = prev.map((arr) => arr.slice());
      next[exerciseIndex][setIndex] = { ...next[exerciseIndex][setIndex], done: true };
      return next;
    });

    const set = sets[setIndex];
    await supabase.from("workout_logs").insert({
      user_id: userId,
      session_id: sessionId,
      day_number: day.day,
      exercise_name: exercise.name,
      set_number: setIndex + 1,
      weight_kg: set.weight ? Number(set.weight) : null,
      reps_done: set.reps ? Number(set.reps) : null,
    });

    const isLastSet = setIndex === sets.length - 1;
    if (!isLastSet) startRest();
  }

  async function finishWorkout() {
    setFinishing(true);
    const durationMinutes = Math.round((Date.now() - startedAt.current) / 60000);
    if (sessionId) {
      await supabase.from("workout_sessions")
        .update({ completed_at: new Date().toISOString(), duration_minutes: durationMinutes })
        .eq("id", sessionId);
    }
    setFinishing(false);
    setFinished(true);
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-5 px-4">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-4xl">💪</div>
        <div>
          <h2 className="text-2xl font-bold">¡Excelente trabajo!</h2>
          <p className="text-neutral-500 mt-1">Día {day.day} — {day.title} completado</p>
        </div>
        <p className="text-sm text-neutral-400">
          Tiempo: {Math.round((Date.now() - startedAt.current) / 60000)} min
        </p>
        <button onClick={() => router.push("/")} className="w-full max-w-xs rounded-2xl bg-emerald-500 text-black font-bold py-4 text-lg">
          Volver al inicio
        </button>
      </div>
    );
  }

  if (resting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 px-4">
        <p className="text-neutral-500 text-sm uppercase tracking-widest">Descanso</p>
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" stroke="#252525" strokeWidth="8" fill="none"/>
            <circle
              cx="50" cy="50" r="44"
              stroke="#34d399" strokeWidth="8" fill="none"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (restSeconds / REST_SECONDS)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black">{restSeconds}</span>
            <span className="text-xs text-neutral-500">seg</span>
          </div>
        </div>
        <p className="text-neutral-400">Próxima serie: <span className="text-white font-semibold">{exercise.name}</span></p>
        <button onClick={stopRest} className="rounded-2xl border border-[#252525] px-8 py-3 text-sm font-semibold">
          Saltear descanso
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={() => router.push("/")} className="text-neutral-500">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <div className="text-center">
          <p className="text-xs text-neutral-500">DÍA {day.day}</p>
          <p className="font-bold text-sm">{day.title}</p>
        </div>
        <p className="text-xs text-neutral-500">{totalDone}/{totalSets}</p>
      </div>

      {/* Global progress */}
      <div className="h-1 bg-[#252525] rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${(totalDone / totalSets) * 100}%` }}
        />
      </div>

      {/* Exercise navigation dots */}
      <div className="flex items-center justify-center gap-2 py-1">
        {day.exercises.map((_, i) => {
          const exDone = setLogs[i].every((s) => s.done);
          return (
            <button
              key={i}
              onClick={() => setExerciseIndex(i)}
              className={`rounded-full transition-all ${
                i === exerciseIndex
                  ? "w-6 h-2 bg-emerald-400"
                  : exDone
                  ? "w-2 h-2 bg-emerald-700"
                  : "w-2 h-2 bg-[#252525]"
              }`}
            />
          );
        })}
      </div>

      {/* Exercise card */}
      <div className="rounded-3xl bg-[#161616] border border-[#252525] p-5">
        <div className="flex items-start justify-between mb-1">
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest">
            Ejercicio {exerciseIndex + 1} de {day.exercises.length}
          </p>
          {allSetsDone && (
            <span className="text-xs text-emerald-400 font-semibold">✓ Completado</span>
          )}
        </div>
        <h2 className="text-2xl font-black mb-1">{exercise.name}</h2>
        <p className="text-neutral-500 text-sm mb-5">
          {exercise.sets} series · {exercise.reps} repeticiones
        </p>

        {/* Sets */}
        <div className="space-y-3">
          {sets.map((set, i) => {
            const isActive = i === activeSetIndex;
            return (
              <div
                key={i}
                className={`rounded-2xl border p-3 transition-all ${
                  set.done
                    ? "border-emerald-800 bg-emerald-950/20"
                    : isActive
                    ? "border-emerald-500 bg-emerald-500/5"
                    : "border-[#252525] opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    set.done ? "bg-emerald-500 text-black" : isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-[#252525] text-neutral-600"
                  }`}>
                    {set.done ? "✓" : i + 1}
                  </div>

                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex-1">
                      <p className="text-xs text-neutral-500 mb-1">Peso (kg)</p>
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="0"
                        value={set.weight}
                        disabled={set.done || !isActive}
                        onChange={(e) => updateSet(i, "weight", e.target.value)}
                        className="w-full rounded-xl bg-[#1f1f1f] border border-[#333] px-3 py-2 text-base font-semibold text-center disabled:opacity-50 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-neutral-500 mb-1">Reps</p>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={set.reps}
                        disabled={set.done || !isActive}
                        onChange={(e) => updateSet(i, "reps", e.target.value)}
                        className="w-full rounded-xl bg-[#1f1f1f] border border-[#333] px-3 py-2 text-base font-semibold text-center disabled:opacity-50 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {isActive && (
                    <button
                      onClick={() => completeSet(i)}
                      className="w-10 h-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center flex-shrink-0"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extra (HIIT / Cardio) */}
      {day.extra && (
        <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 px-4 py-3 flex items-center gap-3">
          <span className="text-orange-400 text-xl">⚡</span>
          <div>
            <p className="text-xs text-orange-400 font-semibold">Al finalizar</p>
            <p className="text-sm text-orange-300">{day.extra}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pb-2">
        <button
          onClick={() => setExerciseIndex((i) => Math.max(0, i - 1))}
          disabled={exerciseIndex === 0}
          className="flex-1 rounded-2xl border border-[#252525] py-4 font-semibold text-sm disabled:opacity-30"
        >
          ← Anterior
        </button>

        {isLastExercise ? (
          <button
            onClick={finishWorkout}
            disabled={!allSetsDone || finishing}
            className="flex-1 rounded-2xl bg-emerald-500 text-black font-bold py-4 text-sm disabled:opacity-40"
          >
            {finishing ? "Guardando..." : "Finalizar 🏁"}
          </button>
        ) : (
          <button
            onClick={() => setExerciseIndex((i) => i + 1)}
            disabled={!allSetsDone}
            className="flex-1 rounded-2xl bg-emerald-500 text-black font-bold py-4 text-sm disabled:opacity-40"
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}
