"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CopyRoutineButton({
  code,
  loggedIn,
}: {
  code: string;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function copyRoutine() {
    if (!loggedIn) {
      router.push("/signup");
      return;
    }

    setCopying(true);
    setError(null);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Rutina original
    const { data: source } = await supabase
      .from("routines")
      .select("id, title")
      .eq("share_code", code)
      .maybeSingle();

    if (!source) { setError("Rutina no encontrada."); setCopying(false); return; }

    const { data: sourceDays } = await supabase
      .from("routine_days")
      .select("id, day_number, title, extra")
      .eq("routine_id", source.id);

    const dayIds = (sourceDays ?? []).map((d) => d.id);
    const { data: sourceExercises } = dayIds.length
      ? await supabase
          .from("routine_exercises")
          .select("day_id, name, sets, reps, image, tip, order_index, exercise_id")
          .in("day_id", dayIds)
      : { data: [] };

    // Clonar a mi cuenta
    const { data: newRoutine, error: insertError } = await supabase
      .from("routines")
      .insert({ owner_id: user.id, title: source.title })
      .select("id")
      .single();

    if (insertError || !newRoutine) {
      setError("No se pudo copiar la rutina.");
      setCopying(false);
      return;
    }

    for (const day of sourceDays ?? []) {
      const { data: newDay } = await supabase
        .from("routine_days")
        .insert({
          routine_id: newRoutine.id,
          day_number: day.day_number,
          title: day.title,
          extra: day.extra,
        })
        .select("id")
        .single();

      if (newDay) {
        const exercises = (sourceExercises ?? []).filter((e) => e.day_id === day.id);
        if (exercises.length) {
          await supabase.from("routine_exercises").insert(
            exercises.map((e) => ({
              day_id: newDay.id,
              name: e.name,
              sets: e.sets,
              reps: e.reps,
              image: e.image,
              tip: e.tip,
              order_index: e.order_index,
              exercise_id: e.exercise_id,
            }))
          );
        }
      }
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div>
      {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
      <button
        onClick={copyRoutine}
        disabled={copying}
        className="w-full rounded-2xl bg-[#2dd4bf] text-[#04211c] font-semibold py-4 text-base card-shadow active:scale-[0.98] transition-transform disabled:opacity-50"
      >
        {copying ? "Copiando..." : loggedIn ? "Copiar a mi cuenta 💪" : "Crear cuenta y usar esta rutina"}
      </button>
    </div>
  );
}
