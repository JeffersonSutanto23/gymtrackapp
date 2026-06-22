"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function WeightChart({ data }: { data: { date: string; weightKg: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-neutral-500">No bodyweight logs yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
        <XAxis dataKey="date" stroke="#a3a3a3" fontSize={12} />
        <YAxis stroke="#a3a3a3" fontSize={12} domain={["auto", "auto"]} />
        <Tooltip
          contentStyle={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 8 }}
          labelStyle={{ color: "#404040" }}
        />
        <Line type="monotone" dataKey="weightKg" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Weight (kg)" />
      </LineChart>
    </ResponsiveContainer>
  );
}
