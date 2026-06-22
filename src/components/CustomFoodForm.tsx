"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save } from "lucide-react";
import { FOOD_CATEGORIES } from "@/lib/categories";
import { BTN_PRIMARY, BTN_SECONDARY, INPUT } from "@/lib/ui";

const empty = {
  name: "",
  brand: "",
  category: FOOD_CATEGORIES[0] as string,
  servingSize: 100,
  servingUnit: "g",
  calories: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
};

export function CustomFoodForm() {
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

    const res = await fetch("/api/foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, brand: form.brand || undefined }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Could not save food.");
      return;
    }

    setForm(empty);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={BTN_SECONDARY}>
        <Plus className="h-4 w-4" /> Add custom food
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Name">
          <input required value={form.name} onChange={(e) => update("name", e.target.value)} className={`${INPUT} py-1.5`} />
        </Field>
        <Field label="Brand (optional)">
          <input value={form.brand} onChange={(e) => update("brand", e.target.value)} className={`${INPUT} py-1.5`} />
        </Field>
        <Field label="Category">
          <select value={form.category} onChange={(e) => update("category", e.target.value)} className={`${INPUT} py-1.5`}>
            {FOOD_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Serving unit">
          <input
            required
            value={form.servingUnit}
            onChange={(e) => update("servingUnit", e.target.value)}
            placeholder="g, cup, piece..."
            className={`${INPUT} py-1.5`}
          />
        </Field>
        <Field label="Serving size">
          <input
            type="number"
            min={0}
            step={0.1}
            required
            value={form.servingSize}
            onChange={(e) => update("servingSize", Number(e.target.value))}
            className={`${INPUT} py-1.5`}
          />
        </Field>
        <Field label="Calories">
          <input
            type="number"
            min={0}
            required
            value={form.calories}
            onChange={(e) => update("calories", Number(e.target.value))}
            className={`${INPUT} py-1.5`}
          />
        </Field>
        <Field label="Protein (g)">
          <input
            type="number"
            min={0}
            step={0.1}
            required
            value={form.proteinG}
            onChange={(e) => update("proteinG", Number(e.target.value))}
            className={`${INPUT} py-1.5`}
          />
        </Field>
        <Field label="Carbs (g)">
          <input
            type="number"
            min={0}
            step={0.1}
            required
            value={form.carbsG}
            onChange={(e) => update("carbsG", Number(e.target.value))}
            className={`${INPUT} py-1.5`}
          />
        </Field>
        <Field label="Fat (g)">
          <input
            type="number"
            min={0}
            step={0.1}
            required
            value={form.fatG}
            onChange={(e) => update("fatG", Number(e.target.value))}
            className={`${INPUT} py-1.5`}
          />
        </Field>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className={BTN_PRIMARY}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {loading ? "Saving..." : "Save food"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-500 hover:text-neutral-900">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-neutral-500">
      {label}
      {children}
    </label>
  );
}
