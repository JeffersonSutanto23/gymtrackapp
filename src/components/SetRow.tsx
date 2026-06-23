"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";
import { INPUT } from "@/lib/ui";

type Set = {
  id: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe: number | null;
};

export function SetRow({ set }: { set: Set }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [reps, setReps] = useState(set.reps.toString());
  const [weightKg, setWeightKg] = useState(set.weightKg.toString());
  const [rpe, setRpe] = useState(set.rpe?.toString() ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!reps || !weightKg) return;
    setLoading(true);
    const res = await fetch(`/api/workout-sets/${set.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reps: Number(reps), weightKg: Number(weightKg), rpe: rpe ? Number(rpe) : undefined }),
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
        <td className="py-2 pl-3 pr-2 text-neutral-500">{set.setNumber}</td>
        <td className="py-2 pr-2">
          <input
            type="number"
            min={1}
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className={`w-16 ${INPUT} py-1`}
          />
        </td>
        <td className="py-2 pr-2">
          <input
            type="number"
            min={0}
            step={0.5}
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className={`w-20 ${INPUT} py-1`}
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
            className={`w-14 ${INPUT} py-1`}
          />
        </td>
        <td className="py-2 pr-2 whitespace-nowrap">
          <button
            onClick={handleSave}
            disabled={loading}
            aria-label="Save"
            className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-50"
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
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-neutral-100">
      <td className="py-2 pl-3 pr-2 text-neutral-500">{set.setNumber}</td>
      <td className="py-2 pr-2">{set.reps}</td>
      <td className="py-2 pr-2">{set.weightKg} kg</td>
      <td className="py-2 pr-2">{set.rpe ?? "—"}</td>
      <td className="py-2 pr-2 whitespace-nowrap">
        <button
          onClick={() => setEditing(true)}
          aria-label="Edit"
          className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <DeleteButton endpoint={`/api/workout-sets/${set.id}`} />
      </td>
    </tr>
  );
}
