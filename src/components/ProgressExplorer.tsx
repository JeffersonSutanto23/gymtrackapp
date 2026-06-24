"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Loader2 } from "lucide-react";
import { MUSCLE_GROUP_LABELS } from "@/lib/goals";
import { INPUT } from "@/lib/ui";

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
              date: new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "Asia/Jakarta" }),
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
        className={`${INPUT} max-w-sm py-2`}
      >
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name} ({MUSCLE_GROUP_LABELS[ex.muscleGroup]})
          </option>
        ))}
      </select>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </p>
      ) : data.length === 0 ? (
        <p className="text-sm text-neutral-500">No sets logged for this exercise yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis dataKey="date" stroke="#a3a3a3" fontSize={12} />
            <YAxis stroke="#a3a3a3" fontSize={12} />
            <Tooltip
              contentStyle={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 8 }}
              labelStyle={{ color: "#404040" }}
            />
            <Legend />
            <Line type="monotone" dataKey="maxWeight" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Max Weight (kg)" />
            <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Volume (kg)" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
