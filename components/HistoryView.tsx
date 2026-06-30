"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
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

export default function HistoryView({
  sessions,
  logs,
}: {
  sessions: Session[];
  logs: Log[];
}) {
  const exerciseNames = useMemo(
    () => Array.from(new Set(logs.map((l) => l.exercise_name))).sort(),
    [logs]
  );
  const [selectedExercise, setSelectedExercise] = useState(exerciseNames[0] ?? "");

  const chartData = useMemo(() => {
    return logs
      .filter((l) => l.exercise_name === selectedExercise && l.weight_kg != null)
      .map((l) => ({
        date: new Date(l.created_at).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
        }),
        peso: l.weight_kg,
      }));
  }, [logs, selectedExercise]);

  return (
    <div className="space-y-6">
      {exerciseNames.length > 0 && (
        <section className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Progreso de peso</h2>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="rounded-md bg-neutral-800 border border-neutral-700 text-sm px-2 py-1"
            >
              {exerciseNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {chartData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#737373" fontSize={12} />
                  <YAxis stroke="#737373" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "#171717",
                      border: "1px solid #404040",
                      borderRadius: 8,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke="#34d399"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Sin datos de peso aún.</p>
          )}
        </section>
      )}

      <section className="space-y-2">
        <h2 className="font-semibold text-neutral-300">Sesiones</h2>
        {sessions.length === 0 && (
          <p className="text-sm text-neutral-500">Todavía no completaste ningún entrenamiento.</p>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            className="rounded-xl bg-neutral-900 border border-neutral-800 p-3 flex items-center justify-between"
          >
            <div>
              <p className="font-medium">
                Día {s.day_number} — {s.day_title}
              </p>
              <p className="text-xs text-neutral-500">
                {new Date(s.started_at).toLocaleString("es-AR")}
              </p>
            </div>
            <div className="text-right">
              {s.completed_at ? (
                <span className="text-xs text-emerald-400">
                  Completo{s.duration_minutes ? ` · ${s.duration_minutes} min` : ""}
                </span>
              ) : (
                <span className="text-xs text-yellow-500">Sin terminar</span>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
