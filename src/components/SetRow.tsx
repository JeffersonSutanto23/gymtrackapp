"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/DeleteButton";
import { MUSCLE_GROUP_LABELS } from "@/lib/goals";

type Set = {
  id: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe: number | null;
  exerciseId: string;
  exercise: { name: string; muscleGroup: keyof typeof MUSCLE_GROUP_LABELS };
};

export function SetRow({ set }: { set: Set }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [reps, setReps] = useState(set.reps);
  const [weightKg, setWeightKg] = useState(set.weightKg);
  const [rpe, setRpe] = useState(set.rpe?.toString() ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const res = await fetch(`/api/workout-sets/${set.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reps, weightKg, rpe: rpe ? Number(rpe) : undefined }),
    });
    setLoading(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  if (editing) {
    return (
      <tr className="border-b border-neutral-100">
        <td className="py-2 pr-2">{set.setNumber}</td>
        <td className="py-2 pr-2">{set.exercise.name}</td>
        <td className="py-2 pr-2 text-neutral-600">{MUSCLE_GROUP_LABELS[set.exercise.muscleGroup]}</td>
        <td className="py-2 pr-2">
          <input
            type="number"
            min={1}
            value={reps}
            onChange={(e) => setReps(Number(e.target.value))}
            className="w-16 rounded-md bg-white border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-emerald-500"
          />
        </td>
        <td className="py-2 pr-2">
          <input
            type="number"
            min={0}
            step={0.5}
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-20 rounded-md bg-white border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-emerald-500"
          />
        </td>
        <td className="py-2 pr-2">
          <input
            type="number"
            min={1}
            max={10}
            step={0.5}
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            className="w-14 rounded-md bg-white border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-emerald-500"
          />
        </td>
        <td className="py-2 pr-2 whitespace-nowrap">
          <button onClick={handleSave} disabled={loading} className="text-xs text-emerald-600 hover:underline disabled:opacity-50 mr-2">
            {loading ? "..." : "Save"}
          </button>
          <button onClick={() => setEditing(false)} className="text-xs text-neutral-500 hover:underline">
            Cancel
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-neutral-100">
      <td className="py-2 pr-2">{set.setNumber}</td>
      <td className="py-2 pr-2">
        <Link href={`/progress?exerciseId=${set.exerciseId}`} className="hover:text-emerald-600">
          {set.exercise.name}
        </Link>
      </td>
      <td className="py-2 pr-2 text-neutral-600">{MUSCLE_GROUP_LABELS[set.exercise.muscleGroup]}</td>
      <td className="py-2 pr-2">{set.reps}</td>
      <td className="py-2 pr-2">{set.weightKg} kg</td>
      <td className="py-2 pr-2">{set.rpe ?? "—"}</td>
      <td className="py-2 pr-2 whitespace-nowrap">
        <button onClick={() => setEditing(true)} className="text-xs text-neutral-500 hover:text-neutral-700 mr-2">
          Edit
        </button>
        <DeleteButton endpoint={`/api/workout-sets/${set.id}`} />
      </td>
    </tr>
  );
}
