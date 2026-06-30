"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { RoutineDay } from "@/lib/routines";

type SetLog = { weight: string; reps: string; done: boolean };

export default function WorkoutRunner({
  day,
  userId,
}: {
  day: RoutineDay;
  userId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setLogs, setSetLogs] = useState<SetLog[][]>(() =>
    day.exercises.map((ex) =>
      Array.from({ length: ex.sets }, () => ({ weight: "", reps: "", done: false }))
    )
  );
  const [finishing, setFinishing] = useState(false);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("workout_sessions")
      .insert({
        user_id: userId,
        day_number: day.day,
        day_title: day.title,
      })
      .select("id")
      .single()
      .then(({ data }) => {
        if (!cancelled && data) setSessionId(data.id);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exercise = day.exercises[exerciseIndex];
  const sets = setLogs[exerciseIndex];
  const allSetsDone = sets.every((s) => s.done);
  const isLastExercise = exerciseIndex === day.exercises.length - 1;

  function updateSet(setIndex: number, field: "weight" | "reps", value: string) {
    setSetLogs((prev) => {
      const next = prev.map((arr) => arr.slice());
      next[exerciseIndex][setIndex] = { ...next[exerciseIndex][setIndex], [field]: value };
      return next;
    });
  }

  async function completeSet(setIndex: number) {
    const set = sets[setIndex];
    setSetLogs((prev) => {
      const next = prev.map((arr) => arr.slice());
      next[exerciseIndex][setIndex] = { ...next[exerciseIndex][setIndex], done: true };
      return next;
    });

    await supabase.from("workout_logs").insert({
      user_id: userId,
      session_id: sessionId,
      day_number: day.day,
      exercise_name: exercise.name,
      set_number: setIndex + 1,
      weight_kg: set.weight ? Number(set.weight) : null,
      reps_done: set.reps ? Number(set.reps) : null,
    });
  }

  async function finishWorkout() {
    setFinishing(true);
    const durationMinutes = Math.round((Date.now() - startedAt.current) / 60000);

    if (sessionId) {
      await supabase
        .from("workout_sessions")
        .update({
          completed_at: new Date().toISOString(),
          duration_minutes: durationMinutes,
        })
        .eq("id", sessionId);
    }

    setFinishing(false);
    setFinished(true);
  }

  if (finished) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-3xl">💪</p>
        <h2 className="text-xl font-bold">¡Entrenamiento completado!</h2>
        <p className="text-neutral-400">{day.title}</p>
        <button
          onClick={() => router.push("/")}
          className="rounded-lg bg-emerald-500 text-black font-semibold px-6 py-2"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between text-sm text-neutral-400 mb-1">
          <span>
            Ejercicio {exerciseIndex + 1} de {day.exercises.length}
          </span>
          {day.extra && <span className="text-orange-400">{day.extra}</span>}
        </div>
        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{
              width: `${((exerciseIndex + (allSetsDone ? 1 : 0)) / day.exercises.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
        <h2 className="text-xl font-bold">{exercise.name}</h2>
        <p className="text-sm text-neutral-400 mb-4">
          {exercise.sets} series x {exercise.reps} reps
        </p>

        <div className="space-y-2">
          {sets.map((set, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg border p-2 ${
                set.done ? "border-emerald-700 bg-emerald-950/30" : "border-neutral-800"
              }`}
            >
              <span className="w-14 text-sm text-neutral-400">Serie {i + 1}</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="kg"
                value={set.weight}
                disabled={set.done}
                onChange={(e) => updateSet(i, "weight", e.target.value)}
                className="w-20 rounded-md bg-neutral-800 border border-neutral-700 px-2 py-1 text-sm disabled:opacity-60"
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="reps"
                value={set.reps}
                disabled={set.done}
                onChange={(e) => updateSet(i, "reps", e.target.value)}
                className="w-20 rounded-md bg-neutral-800 border border-neutral-700 px-2 py-1 text-sm disabled:opacity-60"
              />
              <button
                onClick={() => completeSet(i)}
                disabled={set.done}
                className="ml-auto rounded-md bg-emerald-600 disabled:bg-neutral-700 disabled:text-neutral-500 text-black font-semibold text-sm px-3 py-1"
              >
                {set.done ? "Hecha ✓" : "Completar"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setExerciseIndex((i) => Math.max(0, i - 1))}
          disabled={exerciseIndex === 0}
          className="rounded-lg border border-neutral-700 px-4 py-2 text-sm disabled:opacity-40"
        >
          ← Anterior
        </button>

        {isLastExercise ? (
          <button
            onClick={finishWorkout}
            disabled={!allSetsDone || finishing}
            className="rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2 text-sm disabled:opacity-40"
          >
            {finishing ? "Guardando..." : "Finalizar entrenamiento"}
          </button>
        ) : (
          <button
            onClick={() => setExerciseIndex((i) => Math.min(day.exercises.length - 1, i + 1))}
            disabled={!allSetsDone}
            className="rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2 text-sm disabled:opacity-40"
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}
