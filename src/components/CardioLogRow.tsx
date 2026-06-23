"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";
import { toDatetimeLocalValue } from "@/lib/datetime";
import { CARDIO_TYPE_LABELS } from "@/lib/goals";
import { INPUT } from "@/lib/ui";

type CardioLog = {
  id: string;
  activity: keyof typeof CARDIO_TYPE_LABELS;
  durationMin: number;
  distanceKm: number | null;
  calories: number | null;
  loggedAt: string;
};

export function CardioLogRow({ log }: { log: CardioLog }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [activity, setActivity] = useState(log.activity);
  const [durationMin, setDurationMin] = useState(log.durationMin);
  const [distanceKm, setDistanceKm] = useState(log.distanceKm?.toString() ?? "");
  const [calories, setCalories] = useState(log.calories?.toString() ?? "");
  const [loggedAt, setLoggedAt] = useState(toDatetimeLocalValue(log.loggedAt));
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const res = await fetch(`/api/cardio/${log.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activity,
        durationMin,
        distanceKm: distanceKm ? Number(distanceKm) : undefined,
        calories: calories ? Number(calories) : undefined,
        loggedAt: new Date(loggedAt).toISOString(),
      }),
    });
    setLoading(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as keyof typeof CARDIO_TYPE_LABELS)}
            className={`${INPUT} py-1`}
          >
            {Object.entries(CARDIO_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value))}
            placeholder="min"
            className={`${INPUT} py-1`}
          />
          <input
            type="number"
            min={0}
            step={0.1}
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            placeholder="km"
            className={`${INPUT} py-1`}
          />
          <input
            type="number"
            min={0}
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="kcal"
            className={`${INPUT} py-1`}
          />
          <input
            type="datetime-local"
            value={loggedAt}
            onChange={(e) => setLoggedAt(e.target.value)}
            className={`${INPUT} py-1`}
          />
        </div>
        <div className="flex justify-end gap-1">
          <button
            onClick={handleSave}
            disabled={loading}
            aria-label="Save"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setEditing(false)}
            aria-label="Cancel"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-neutral-50">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium">{CARDIO_TYPE_LABELS[log.activity]}</span>
        <span className="text-xs text-neutral-500">
          {log.durationMin} min{log.distanceKm ? ` · ${log.distanceKm} km` : ""}
          {log.calories ? ` · ${log.calories} kcal` : ""} · {new Date(log.loggedAt).toLocaleDateString()}
        </span>
      </div>
      <span className="flex shrink-0 items-center">
        <button
          onClick={() => setEditing(true)}
          aria-label="Edit"
          className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <DeleteButton endpoint={`/api/cardio/${log.id}`} />
      </span>
    </li>
  );
}
