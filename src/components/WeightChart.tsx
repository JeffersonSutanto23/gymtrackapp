"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function WeightChart({ data }: { data: { date: string; weightKg: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-neutral-500">No bodyweight logs yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="date" stroke="#737373" fontSize={12} />
        <YAxis stroke="#737373" fontSize={12} domain={["auto", "auto"]} />
        <Tooltip
          contentStyle={{ background: "#171717", border: "1px solid #404040", borderRadius: 8 }}
          labelStyle={{ color: "#d4d4d4" }}
        />
        <Line type="monotone" dataKey="weightKg" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} name="Weight (kg)" />
      </LineChart>
    </ResponsiveContainer>
  );
}
