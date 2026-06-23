"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save } from "lucide-react";
import { MUSCLE_GROUP_LABELS } from "@/lib/goals";
import { BTN_PRIMARY, BTN_SECONDARY, INPUT } from "@/lib/ui";

const empty = {
  name: "",
  muscleGroup: "FULL_BODY" as keyof typeof MUSCLE_GROUP_LABELS,
  equipment: "",
  isCompound: false,
};

export function AddExerciseForm() {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof empty>(key: K, value: (typeof empty)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, equipment: form.equipment || undefined }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Could not save exercise.");
      return;
    }

    setForm(empty);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={BTN_SECONDARY}>
        <Plus className="h-4 w-4" /> Add new exercise
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-neutral-500">
          Name
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={`${INPUT} py-1.5`}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-neutral-500">
          Muscle group
          <select
            value={form.muscleGroup}
            onChange={(e) => update("muscleGroup", e.target.value as keyof typeof MUSCLE_GROUP_LABELS)}
            className={`${INPUT} py-1.5`}
          >
            {Object.entries(MUSCLE_GROUP_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-neutral-500">
          Equipment (optional)
          <input
            value={form.equipment}
            onChange={(e) => update("equipment", e.target.value)}
            className={`${INPUT} py-1.5`}
          />
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-neutral-500 sm:mt-5">
          <input
            type="checkbox"
            checked={form.isCompound}
            onChange={(e) => update("isCompound", e.target.checked)}
          />
          Compound movement
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className={BTN_PRIMARY}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {loading ? "Saving..." : "Save exercise"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-500 hover:text-neutral-900">
          Cancel
        </button>
      </div>
    </form>
  );
}
