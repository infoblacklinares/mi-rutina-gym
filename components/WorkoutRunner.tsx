"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
      .select("id").single()
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
  const totalDone = setLogs.reduce((acc, ex) => acc + ex.filter((s) => s.done).length, 0);
  const totalSets = setLogs.reduce((acc, ex) => acc + ex.length, 0);
  const exerciseDone = sets.every((s) => s.done);

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

  /* ─── PANTALLA FINAL ─── */
  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center gap-6 px-4">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-5xl">💪</div>
        <div>
          <h2 className="text-3xl font-black">¡Gran sesión!</h2>
          <p className="text-neutral-500 mt-2">Día {day.day} — {day.title}</p>
          <p className="text-sm text-neutral-600 mt-1">
            {Math.round((Date.now() - startedAt.current) / 60000)} min · {totalDone} series completadas
          </p>
        </div>
        <button onClick={() => router.push("/")} className="w-full max-w-xs rounded-2xl bg-emerald-500 text-black font-bold py-4 text-lg">
          Volver al inicio
        </button>
      </div>
    );
  }

  /* ─── PANTALLA DESCANSO ─── */
  if (resting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center gap-6 px-4">
        <p className="text-neutral-500 text-xs uppercase tracking-widest font-semibold">Tiempo de descanso</p>
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" stroke="#222" strokeWidth="7" fill="none"/>
            <circle
              cx="50" cy="50" r="44" stroke="#34d399" strokeWidth="7" fill="none"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - restSeconds / REST_SECONDS)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black tabular-nums">{restSeconds}</span>
            <span className="text-xs text-neutral-500">seg</span>
          </div>
        </div>
        <div>
          <p className="text-neutral-500 text-sm">Próxima serie</p>
          <p className="font-bold text-lg mt-1">{exercise.name}</p>
        </div>
        <button onClick={stopRest} className="rounded-2xl border border-[#333] px-10 py-3 text-sm font-semibold text-neutral-300">
          Saltear descanso →
        </button>
      </div>
    );
  }

  /* ─── PANTALLA EJERCICIO ─── */
  return (
    <div className="flex flex-col gap-4">

      {/* Top bar */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={() => router.push("/")} className="w-9 h-9 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-neutral-400">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <div className="text-center">
          <p className="text-xs text-neutral-500 font-semibold">DÍA {day.day} — {day.title.toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-emerald-400">{totalDone}/{totalSets}</p>
          <p className="text-[10px] text-neutral-600">series</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#222] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(totalDone / totalSets) * 100}%`, background: day.color }}
        />
      </div>

      {/* Exercise image */}
      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-[#161616]">
        <Image
          src={exercise.image}
          alt={exercise.name}
          fill
          className="object-cover"
          unoptimized
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Exercise nav dots */}
        <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5">
          {day.exercises.map((_, i) => {
            const exDone = setLogs[i].every((s) => s.done);
            return (
              <button
                key={i}
                onClick={() => { stopRest(); setExerciseIndex(i); }}
                className={`rounded-full transition-all duration-200 ${
                  i === exerciseIndex ? "w-5 h-2 bg-white" : exDone ? "w-2 h-2 bg-emerald-400" : "w-2 h-2 bg-white/30"
                }`}
              />
            );
          })}
        </div>

        {/* Exercise info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-black" style={{ background: day.color }}>
              {exerciseIndex + 1} / {day.exercises.length}
            </span>
            {exerciseDone && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-black">
                ✓ Completado
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-white leading-tight">{exercise.name}</h2>
          <p className="text-sm font-semibold text-white/70 mt-0.5">
            {exercise.sets} series · {exercise.reps} reps
          </p>
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-2xl bg-[#161616] border border-[#222] px-4 py-3 flex items-start gap-3">
        <span className="text-lg mt-0.5">💡</span>
        <p className="text-sm text-neutral-400 leading-relaxed">{exercise.tip}</p>
      </div>

      {/* Sets */}
      <div className="rounded-3xl bg-[#161616] border border-[#222] p-4">
        <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold mb-3">Registro de series</p>
        <div className="space-y-2">
          {sets.map((set, i) => {
            const isActive = i === activeSetIndex;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-2xl p-3 transition-all border ${
                  set.done
                    ? "border-emerald-800/50 bg-emerald-950/30"
                    : isActive
                    ? "border-[#333] bg-[#1c1c1c]"
                    : "border-transparent opacity-40"
                }`}
              >
                {/* Set badge */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  set.done ? "bg-emerald-500 text-black" : isActive ? "bg-[#2a2a2a] text-white" : "bg-[#1a1a1a] text-neutral-600"
                }`}>
                  {set.done ? "✓" : i + 1}
                </div>

                {/* Inputs */}
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex-1">
                    <p className="text-[10px] text-neutral-600 mb-1">KG</p>
                    <input
                      type="number" inputMode="decimal" placeholder="—"
                      value={set.weight}
                      disabled={set.done || (!isActive && activeSetIndex !== -1)}
                      onChange={(e) => updateSet(i, "weight", e.target.value)}
                      className="w-full rounded-xl bg-[#222] border border-[#2e2e2e] px-3 py-2 text-sm font-bold text-center disabled:opacity-40 outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-neutral-600 mb-1">REPS</p>
                    <input
                      type="number" inputMode="numeric" placeholder="—"
                      value={set.reps}
                      disabled={set.done || (!isActive && activeSetIndex !== -1)}
                      onChange={(e) => updateSet(i, "reps", e.target.value)}
                      className="w-full rounded-xl bg-[#222] border border-[#2e2e2e] px-3 py-2 text-sm font-bold text-center disabled:opacity-40 outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {isActive && (
                  <button
                    onClick={() => completeSet(i)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-black font-bold"
                    style={{ background: day.color }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* HIIT / Cardio extra */}
      {day.extra && (
        <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 px-4 py-3 flex items-center gap-3">
          <span className="text-orange-400 text-xl">⚡</span>
          <div>
            <p className="text-xs text-orange-400 font-bold uppercase tracking-wide">Al finalizar</p>
            <p className="text-sm text-orange-300">{day.extra}</p>
          </div>
        </div>
      )}

      {/* Navigation — LIBRE, sin bloqueo */}
      <div className="flex gap-3 pb-4">
        <button
          onClick={() => { stopRest(); setExerciseIndex((i) => Math.max(0, i - 1)); }}
          disabled={exerciseIndex === 0}
          className="flex-1 rounded-2xl border border-[#2a2a2a] py-4 font-semibold text-sm disabled:opacity-30 text-neutral-300"
        >
          ← Anterior
        </button>

        {exerciseIndex < day.exercises.length - 1 ? (
          <button
            onClick={() => { stopRest(); setExerciseIndex((i) => i + 1); }}
            className="flex-1 rounded-2xl font-bold py-4 text-sm text-black"
            style={{ background: day.color }}
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={finishWorkout}
            disabled={finishing}
            className="flex-1 rounded-2xl bg-emerald-500 text-black font-bold py-4 text-sm disabled:opacity-50"
          >
            {finishing ? "Guardando..." : "Finalizar 🏁"}
          </button>
        )}
      </div>
    </div>
  );
}
