"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Search } from "lucide-react";
import { MEAL_TYPE_LABELS } from "@/lib/goals";
import { BTN_PRIMARY, INPUT } from "@/lib/ui";

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
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search foods (e.g. chicken, rice, banana)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          className={`${INPUT} w-full pl-9`}
        />
      </div>

      {!selected && results.length > 0 && (
        <ul className="flex flex-col gap-1 max-h-64 overflow-y-auto rounded-lg border border-neutral-200">
          {results.map((food) => (
            <li key={food.id}>
              <button
                type="button"
                onClick={() => setSelected(food)}
                className="w-full text-left px-3 py-2 hover:bg-neutral-50 transition-colors flex justify-between items-center"
              >
                <span>
                  {food.name}
                  {food.brand && <span className="text-neutral-500"> · {food.brand}</span>}
                </span>
                <span className="text-xs text-neutral-500 whitespace-nowrap ml-2">
                  {Math.round(food.calories)} kcal / {food.servingSize}{food.servingUnit === "g" ? "g" : ` ${food.servingUnit}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2 rounded-lg border border-neutral-200 p-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-500">Food</span>
            <span className="text-sm font-medium text-neutral-900">{selected.name}</span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-500">Servings</label>
            <input
              type="number"
              min={0.25}
              step={0.25}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              className={`w-24 ${INPUT} py-1.5`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-500">Meal</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as keyof typeof MEAL_TYPE_LABELS)}
              className={`${INPUT} py-1.5`}
            >
              {Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={loading} className={BTN_PRIMARY}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {loading ? "Adding..." : "Add to diary"}
          </button>
          <button type="button" onClick={() => setSelected(null)} className="text-sm text-neutral-500 hover:text-neutral-900">
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
