"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SetRow } from "@/components/SetRow";
import { MUSCLE_GROUP_LABELS } from "@/lib/goals";

type Set = {
  id: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe: number | null;
};

export function ExerciseGroup({
  exerciseId,
  exerciseName,
  muscleGroup,
  sets,
}: {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: keyof typeof MUSCLE_GROUP_LABELS;
  sets: Set[];
}) {
  const [open, setOpen] = useState(true);
  const totalVolume = sets.reduce((sum, s) => sum + s.reps * s.weightKg, 0);

  return (
    <div className="rounded-lg border border-neutral-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 truncate">
          <Link
            href={`/progress?exerciseId=${exerciseId}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-neutral-900 hover:text-emerald-600"
          >
            {exerciseName}
          </Link>
          <span className="text-xs text-neutral-400">{MUSCLE_GROUP_LABELS[muscleGroup]}</span>
        </span>
        <span className="flex items-center gap-3 whitespace-nowrap text-sm text-neutral-500">
          {sets.length} sets · {Math.round(totalVolume)} kg
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <div className="overflow-x-auto border-t border-neutral-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-2 pl-3 pr-2">#</th>
                <th className="py-2 pr-2">Reps</th>
                <th className="py-2 pr-2">Weight</th>
                <th className="py-2 pr-2">RPE</th>
                <th className="py-2 pr-2"></th>
              </tr>
            </thead>
            <tbody>
              {sets.map((set) => (
                <SetRow key={set.id} set={set} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
