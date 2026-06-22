"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MEAL_TYPE_LABELS } from "@/lib/goals";

type Food = {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export function FoodSearchPicker({ date }: { date: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [selected, setSelected] = useState<Food | null>(null);
  const [mealType, setMealType] = useState<keyof typeof MEAL_TYPE_LABELS>("BREAKFAST");
  const [servings, setServings] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      fetch(`/api/foods?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then(setResults);
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);

    const loggedAt = new Date(date);
    loggedAt.setHours(new Date().getHours(), new Date().getMinutes());

    await fetch("/api/food-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        foodId: selected.id,
        mealType,
        servings,
        loggedAt: loggedAt.toISOString(),
      }),
    });

    setLoading(false);
    setSelected(null);
    setQuery("");
    setResults([]);
    setServings(1);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Search foods (e.g. chicken, rice, banana)..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(null);
        }}
        className="rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 outline-none focus:border-emerald-500"
      />

      {!selected && results.length > 0 && (
        <ul className="flex flex-col gap-1 max-h-64 overflow-y-auto rounded-md border border-neutral-800">
          {results.map((food) => (
            <li key={food.id}>
              <button
                type="button"
                onClick={() => setSelected(food)}
                className="w-full text-left px-3 py-2 hover:bg-neutral-800 transition-colors flex justify-between items-center"
              >
                <span>
                  {food.name}
                  {food.brand && <span className="text-neutral-500"> · {food.brand}</span>}
                </span>
                <span className="text-xs text-neutral-400 whitespace-nowrap ml-2">
                  {Math.round(food.calories)} kcal / {food.servingSize}{food.servingUnit === "g" ? "g" : ` ${food.servingUnit}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2 rounded-md border border-neutral-800 p-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">Food</span>
            <span className="text-sm">{selected.name}</span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-400">Servings</label>
            <input
              type="number"
              min={0.25}
              step={0.25}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              className="w-24 rounded-md bg-neutral-900 border border-neutral-800 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-400">Meal</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as keyof typeof MEAL_TYPE_LABELS)}
              className="rounded-md bg-neutral-900 border border-neutral-800 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
            >
              {Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors px-3 py-1.5 text-sm font-medium"
          >
            {loading ? "Adding..." : "Add to diary"}
          </button>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-sm text-neutral-400 hover:text-neutral-200"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
