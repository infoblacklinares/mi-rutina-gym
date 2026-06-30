"use client";

import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

type Session = {
  id: string;
  day_number: number;
  day_title: string;
  started_at: string;
  completed_at: string | null;
  duration_minutes: number | null;
};

type Log = {
  exercise_name: string;
  weight_kg: number | null;
  reps_done: number | null;
  created_at: string;
};

export default function HistoryView({ sessions, logs }: { sessions: Session[]; logs: Log[] }) {
  const exerciseNames = useMemo(
    () => Array.from(new Set(logs.filter((l) => l.weight_kg).map((l) => l.exercise_name))).sort(),
    [logs]
  );
  const [selectedExercise, setSelectedExercise] = useState(exerciseNames[0] ?? "");

  const chartData = useMemo(() =>
    logs
      .filter((l) => l.exercise_name === selectedExercise && l.weight_kg != null)
      .map((l) => ({
        date: new Date(l.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
        peso: l.weight_kg,
      })),
    [logs, selectedExercise]
  );

  const completedSessions = sessions.filter((s) => s.completed_at);

  return (
    <div className="space-y-6">
      {/* Chart */}
      {exerciseNames.length > 0 && (
        <div className="rounded-3xl bg-[#161616] border border-[#252525] p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-widest">Progreso</p>
              <h2 className="font-bold">Evolución de peso</h2>
            </div>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="rounded-xl bg-[#1f1f1f] border border-[#333] text-xs px-3 py-2 max-w-[150px]"
            >
              {exerciseNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {chartData.length > 1 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#404040" fontSize={11} />
                  <YAxis stroke="#404040" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: "#161616", border: "1px solid #252525", borderRadius: 12 }}
                    formatter={(v) => [`${v} kg`, "Peso"]}
                  />
                  <Line type="monotone" dataKey="peso" stroke="#34d399" strokeWidth={2.5} dot={{ r: 4, fill: "#34d399" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-neutral-600 text-center py-8">
              Necesitás al menos 2 sesiones con este ejercicio para ver el progreso.
            </p>
          )}
        </div>
      )}

      {/* Sessions list */}
      <div>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">
          Historial de sesiones
        </p>

        {completedSessions.length === 0 ? (
          <div className="rounded-3xl bg-[#161616] border border-[#252525] p-8 text-center">
            <p className="text-2xl mb-2">🏋️</p>
            <p className="text-neutral-500 text-sm">Todavía no completaste ningún entrenamiento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="rounded-2xl bg-[#161616] border border-[#252525] p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#1f1f1f] flex items-center justify-center text-lg font-black text-emerald-400 flex-shrink-0">
                  {s.day_number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{s.day_title}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(s.started_at).toLocaleDateString("es-AR", {
                      weekday: "long", day: "numeric", month: "short",
                    })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {s.completed_at ? (
                    <>
                      <p className="text-xs text-emerald-400 font-semibold">Completo</p>
                      {s.duration_minutes && (
                        <p className="text-xs text-neutral-600">{s.duration_minutes} min</p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-yellow-500">Incompleto</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
