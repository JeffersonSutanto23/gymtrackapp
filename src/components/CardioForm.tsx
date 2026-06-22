"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { CARDIO_TYPE_LABELS } from "@/lib/goals";
import { BTN_PRIMARY, INPUT } from "@/lib/ui";

export function CardioForm() {
  const router = useRouter();
  const [activity, setActivity] = useState<keyof typeof CARDIO_TYPE_LABELS>("RUN");
  const [durationMin, setDurationMin] = useState(30);
  const [distanceKm, setDistanceKm] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/cardio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activity,
        durationMin,
        distanceKm: distanceKm ? Number(distanceKm) : undefined,
        calories: calories ? Number(calories) : undefined,
      }),
    });

    setLoading(false);
    setDistanceKm("");
    setCalories("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-500">Activity</label>
        <select
          value={activity}
          onChange={(e) => setActivity(e.target.value as keyof typeof CARDIO_TYPE_LABELS)}
          className={`${INPUT} py-2`}
        >
          {Object.entries(CARDIO_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-500">Duration (min)</label>
        <input
          type="number"
          min={1}
          required
          value={durationMin}
          onChange={(e) => setDurationMin(Number(e.target.value))}
          className={`${INPUT} py-2`}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-500">Distance (km)</label>
        <input
          type="number"
          min={0}
          step={0.1}
          value={distanceKm}
          onChange={(e) => setDistanceKm(e.target.value)}
          placeholder="optional"
          className={`${INPUT} py-2`}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-500">Calories</label>
        <input
          type="number"
          min={0}
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="optional"
          className={`${INPUT} py-2`}
        />
      </div>
      <button type="submit" disabled={loading} className={`col-span-2 sm:col-span-4 ${BTN_PRIMARY}`}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {loading ? "Saving..." : "Log cardio"}
      </button>
    </form>
  );
}
