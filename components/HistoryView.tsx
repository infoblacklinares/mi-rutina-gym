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
        <div className="rounded-3xl bg-white card-shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-[#8ba0b5] uppercase tracking-widest font-semibold">Progreso</p>
              <h2 className="font-bold text-[#0c1c2c]">Evolución de peso</h2>
            </div>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="rounded-xl bg-[#eef3f8] border border-[#dbe4ee] text-xs px-3 py-2 max-w-[150px] text-[#0c1c2c]"
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
                  <CartesianGrid stroke="#e9eff6" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#9db0c3" fontSize={11} />
                  <YAxis stroke="#9db0c3" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: "#ffffff", border: "1px solid #e2e9f1", borderRadius: 12, color: "#0c1c2c" }}
                    formatter={(v) => [`${v} kg`, "Peso"]}
                  />
                  <Line type="monotone" dataKey="peso" stroke="#0b3557" strokeWidth={2.5} dot={{ r: 4, fill: "#0b3557" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-[#8ba0b5] text-center py-8">
              Necesitás al menos 2 sesiones con este ejercicio para ver el progreso.
            </p>
          )}
        </div>
      )}

      {/* Sessions list */}
      <div>
        <p className="text-xs text-[#8ba0b5] uppercase tracking-widest font-semibold mb-3">
          Historial de sesiones
        </p>

        {completedSessions.length === 0 ? (
          <div className="rounded-3xl bg-white card-shadow p-8 text-center">
            <p className="text-2xl mb-2">🏋️</p>
            <p className="text-[#5f7185] text-sm">Todavía no completaste ningún entrenamiento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="rounded-2xl bg-white card-shadow p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#eef3f8] flex items-center justify-center text-lg font-bold text-[#0b3557] flex-shrink-0">
                  {s.day_number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-[#0c1c2c]">{s.day_title}</p>
                  <p className="text-xs text-[#8ba0b5]">
                    {new Date(s.started_at).toLocaleDateString("es-AR", {
                      weekday: "long", day: "numeric", month: "short",
                    })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {s.completed_at ? (
                    <>
                      <p className="text-xs text-emerald-600 font-semibold">Completo</p>
                      {s.duration_minutes ? (
                        <p className="text-xs text-[#9db0c3]">{s.duration_minutes} min</p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-xs text-amber-500">Incompleto</p>
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
