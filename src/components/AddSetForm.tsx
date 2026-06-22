"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, TrendingUp } from "lucide-react";
import { MUSCLE_GROUP_LABELS } from "@/lib/goals";
import { BTN_PRIMARY, BTN_SECONDARY, INPUT } from "@/lib/ui";

type Exercise = {
  id: string;
  name: string;
  muscleGroup: keyof typeof MUSCLE_GROUP_LABELS;
};

const TOP_REPS = 12;
const BASE_REPS = 8;
const WEIGHT_INCREMENT_KG = 2.5;

function suggestNextSet(last: { reps: number; weightKg: number }) {
  if (last.reps >= TOP_REPS) {
    return { reps: BASE_REPS, weightKg: last.weightKg + WEIGHT_INCREMENT_KG };
  }
  return { reps: last.reps + 1, weightKg: last.weightKg };
}

export function AddSetForm({
  sessionId,
  exercises,
  nextSetNumber,
  lastSetByExercise = {},
}: {
  sessionId: string;
  exercises: Exercise[];
  nextSetNumber: number;
  lastSetByExercise?: Record<string, { reps: number; weightKg: number }>;
}) {
  const router = useRouter();
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? "");
  const [reps, setReps] = useState(8);
  const [weightKg, setWeightKg] = useState(20);
  const [rpe, setRpe] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastSet = lastSetByExercise[exerciseId];
  const suggestion = lastSet ? suggestNextSet(lastSet) : null;

  function applySuggestion() {
    if (!suggestion) return;
    setReps(suggestion.reps);
    setWeightKg(suggestion.weightKg);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!exerciseId) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/workouts/${sessionId}/sets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId,
        setNumber: nextSetNumber,
        reps,
        weightKg,
        rpe: rpe ? Number(rpe) : undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Could not add set.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
      <div className="flex flex-col gap-1 col-span-2 sm:col-span-2">
        <label className="text-xs font-medium text-neutral-500">Exercise</label>
        <select
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
          className={`${INPUT} py-2`}
        >
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name} ({MUSCLE_GROUP_LABELS[ex.muscleGroup]})
            </option>
          ))}
        </select>
      </div>
      {lastSet && suggestion && (
        <div className="col-span-2 sm:col-span-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span>
            Last: {lastSet.reps} × {lastSet.weightKg} kg
          </span>
          <button
            type="button"
            onClick={applySuggestion}
            className={`${BTN_SECONDARY} py-1 px-2 text-xs`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Use {suggestion.reps} × {suggestion.weightKg} kg
          </button>
        </div>
      )}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-500">Reps</label>
        <input
          type="number"
          min={1}
          required
          value={reps}
          onChange={(e) => setReps(Number(e.target.value))}
          className={`${INPUT} py-2`}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-500">Weight (kg)</label>
        <input
          type="number"
          min={0}
          step={0.5}
          required
          value={weightKg}
          onChange={(e) => setWeightKg(Number(e.target.value))}
          className={`${INPUT} py-2`}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-500">RPE</label>
        <input
          type="number"
          min={1}
          max={10}
          step={0.5}
          value={rpe}
          onChange={(e) => setRpe(e.target.value)}
          placeholder="optional"
          className={`${INPUT} py-2`}
        />
      </div>
      <button type="submit" disabled={loading} className={`col-span-2 sm:col-span-5 ${BTN_PRIMARY}`}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {loading ? "Adding..." : `Add Set #${nextSetNumber}`}
      </button>
      {error && <p className="text-sm text-red-600 col-span-full">{error}</p>}
    </form>
  );
}
