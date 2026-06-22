"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FOOD_CATEGORIES } from "@/lib/categories";
import { MEAL_TYPE_LABELS } from "@/lib/goals";

type Estimate = {
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  notes: string;
};

function resizeImageToBase64(file: File, maxDim = 1024): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.onload = () => {
      img.onerror = () => reject(new Error("Could not load image."));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported."));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve({ base64: dataUrl.split(",")[1], mediaType: "image/jpeg" });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function FoodPhotoAnalyzer({ date }: { date: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [mealType, setMealType] = useState<keyof typeof MEAL_TYPE_LABELS>("BREAKFAST");
  const [servings, setServings] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof Estimate>(key: K, value: Estimate[K]) {
    setEstimate((e) => (e ? { ...e, [key]: value } : e));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setEstimate(null);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalyzing(true);

    try {
      const { base64, mediaType } = await resizeImageToBase64(file);
      const res = await fetch("/api/foods/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not analyze photo.");
      } else {
        setEstimate(data);
      }
    } catch {
      setError("Could not analyze photo.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleLog() {
    if (!estimate) return;
    setSaving(true);
    setError(null);

    const loggedAt = new Date(date);
    loggedAt.setHours(new Date().getHours(), new Date().getMinutes());

    const foodRes = await fetch("/api/foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: estimate.name,
        category: estimate.category,
        servingSize: estimate.servingSize,
        servingUnit: estimate.servingUnit,
        calories: estimate.calories,
        proteinG: estimate.proteinG,
        carbsG: estimate.carbsG,
        fatG: estimate.fatG,
        fiberG: estimate.fiberG,
        sugarG: estimate.sugarG,
        sodiumMg: estimate.sodiumMg,
      }),
    });

    if (!foodRes.ok) {
      setSaving(false);
      setError("Could not save food.");
      return;
    }

    const food = await foodRes.json();

    const logRes = await fetch("/api/food-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        foodId: food.id,
        mealType,
        servings,
        loggedAt: loggedAt.toISOString(),
      }),
    });

    setSaving(false);

    if (!logRes.ok) {
      setError("Could not log meal.");
      return;
    }

    reset();
    router.refresh();
  }

  function reset() {
    setPreviewUrl(null);
    setEstimate(null);
    setServings(1);
    setMealType("BREAKFAST");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="text-sm" />
        {analyzing && <span className="text-sm text-neutral-600">Analyzing photo...</span>}
      </div>

      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="Selected food" className="max-h-48 rounded-md border border-neutral-300 object-cover" />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {estimate && (
        <div className="flex flex-col gap-3 rounded-md border border-neutral-300 p-4">
          <p className="text-xs text-neutral-500">{estimate.notes}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name">
              <input
                value={estimate.name}
                onChange={(e) => update("name", e.target.value)}
                className="rounded-md bg-white border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
              />
            </Field>
            <Field label="Category">
              <select
                value={estimate.category}
                onChange={(e) => update("category", e.target.value)}
                className="rounded-md bg-white border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
              >
                {FOOD_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Serving size">
              <input
                type="number"
                min={0}
                step={0.1}
                value={estimate.servingSize}
                onChange={(e) => update("servingSize", Number(e.target.value))}
                className="rounded-md bg-white border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
              />
            </Field>
            <Field label="Serving unit">
              <input
                value={estimate.servingUnit}
                onChange={(e) => update("servingUnit", e.target.value)}
                className="rounded-md bg-white border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
              />
            </Field>
            <Field label="Calories">
              <input
                type="number"
                min={0}
                value={estimate.calories}
                onChange={(e) => update("calories", Number(e.target.value))}
                className="rounded-md bg-white border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
              />
            </Field>
            <Field label="Protein (g)">
              <input
                type="number"
                min={0}
                step={0.1}
                value={estimate.proteinG}
                onChange={(e) => update("proteinG", Number(e.target.value))}
                className="rounded-md bg-white border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
              />
            </Field>
            <Field label="Carbs (g)">
              <input
                type="number"
                min={0}
                step={0.1}
                value={estimate.carbsG}
                onChange={(e) => update("carbsG", Number(e.target.value))}
                className="rounded-md bg-white border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
              />
            </Field>
            <Field label="Fat (g)">
              <input
                type="number"
                min={0}
                step={0.1}
                value={estimate.fatG}
                onChange={(e) => update("fatG", Number(e.target.value))}
                className="rounded-md bg-white border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-600">Servings</label>
              <input
                type="number"
                min={0.25}
                step={0.25}
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-24 rounded-md bg-white border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-600">Meal</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as keyof typeof MEAL_TYPE_LABELS)}
                className="rounded-md bg-white border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
              >
                {Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleLog}
              disabled={saving}
              className="rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors px-3 py-1.5 text-sm font-medium"
            >
              {saving ? "Logging..." : "Log this meal"}
            </button>
            <button type="button" onClick={reset} className="text-sm text-neutral-600 hover:text-neutral-900">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-neutral-600">
      {label}
      {children}
    </label>
  );
}
