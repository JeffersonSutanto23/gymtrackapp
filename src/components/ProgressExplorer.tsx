"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { MUSCLE_GROUP_LABELS } from "@/lib/goals";

type Exercise = {
  id: string;
  name: string;
  muscleGroup: keyof typeof MUSCLE_GROUP_LABELS;
};

type ProgressPoint = {
  date: string;
  maxWeight: number;
  volume: number;
};

export function ProgressExplorer({ exercises, initialExerciseId }: { exercises: Exercise[]; initialExerciseId?: string }) {
  const [exerciseId, setExerciseId] = useState(initialExerciseId ?? exercises[0]?.id ?? "");
  const [data, setData] = useState<ProgressPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!exerciseId) return;
    const handle = setTimeout(() => {
      setLoading(true);
      fetch(`/api/progress/${exerciseId}`)
        .then((res) => res.json())
        .then((rows: { date: string; maxWeight: number; volume: number }[]) => {
          setData(
            rows.map((row) => ({
              date: new Date(row.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
              maxWeight: row.maxWeight,
              volume: Math.round(row.volume),
            }))
          );
        })
        .finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(handle);
  }, [exerciseId]);

  return (
    <div className="flex flex-col gap-4">
      <select
        value={exerciseId}
        onChange={(e) => setExerciseId(e.target.value)}
        className="rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 outline-none focus:border-emerald-500 max-w-sm"
      >
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name} ({MUSCLE_GROUP_LABELS[ex.muscleGroup]})
          </option>
        ))}
      </select>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-neutral-500">No sets logged for this exercise yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" stroke="#737373" fontSize={12} />
            <YAxis stroke="#737373" fontSize={12} />
            <Tooltip
              contentStyle={{ background: "#171717", border: "1px solid #404040", borderRadius: 8 }}
              labelStyle={{ color: "#d4d4d4" }}
            />
            <Legend />
            <Line type="monotone" dataKey="maxWeight" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} name="Max Weight (kg)" />
            <Line type="monotone" dataKey="volume" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} name="Volume (kg)" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
