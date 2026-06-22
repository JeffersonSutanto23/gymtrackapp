"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GOAL_LABELS, GOAL_PRESETS } from "@/lib/goals";

type Goal = keyof typeof GOAL_LABELS;

export function ProfileForm({
  initial,
}: {
  initial: {
    goal: Goal;
    heightCm: number | null;
    targetCalories: number;
    targetProteinG: number;
    targetCarbsG: number;
    targetFatG: number;
  };
}) {
  const router = useRouter();
  const [goal, setGoal] = useState<Goal>(initial.goal);
  const [heightCm, setHeightCm] = useState(initial.heightCm ?? 175);
  const [targetCalories, setTargetCalories] = useState(initial.targetCalories);
  const [targetProteinG, setTargetProteinG] = useState(initial.targetProteinG);
  const [targetCarbsG, setTargetCarbsG] = useState(initial.targetCarbsG);
  const [targetFatG, setTargetFatG] = useState(initial.targetFatG);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function applyPreset(nextGoal: Goal) {
    setGoal(nextGoal);
    const preset = GOAL_PRESETS[nextGoal];
    setTargetCalories(preset.targetCalories);
    setTargetProteinG(preset.targetProteinG);
    setTargetCarbsG(preset.targetCarbsG);
    setTargetFatG(preset.targetFatG);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, heightCm, targetCalories, targetProteinG, targetCarbsG, targetFatG }),
    });

    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm text-neutral-400">Goal</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(GOAL_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => applyPreset(value as Goal)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                goal === value ? "bg-emerald-600 text-white" : "bg-neutral-900 border border-neutral-800 text-neutral-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-neutral-500">Picking a goal fills in suggested targets — feel free to fine-tune below.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <NumberField label="Height (cm)" value={heightCm} onChange={setHeightCm} />
        <NumberField label="Target calories (kcal)" value={targetCalories} onChange={setTargetCalories} />
        <NumberField label="Target protein (g)" value={targetProteinG} onChange={setTargetProteinG} />
        <NumberField label="Target carbs (g)" value={targetCarbsG} onChange={setTargetCarbsG} />
        <NumberField label="Target fat (g)" value={targetFatG} onChange={setTargetFatG} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors px-4 py-2 font-medium"
        >
          {loading ? "Saving..." : "Save profile"}
        </button>
        {saved && <span className="text-sm text-emerald-400">Saved!</span>}
      </div>
    </form>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-neutral-400">
      {label}
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-emerald-500"
      />
    </label>
  );
}
