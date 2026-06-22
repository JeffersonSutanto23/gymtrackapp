"use client";

import { useEffect, useState } from "react";
import { FOOD_CATEGORIES } from "@/lib/categories";

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
  isCustom: boolean;
};

export function FoodsBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (category) params.set("category", category);
      fetch(`/api/foods?${params.toString()}`)
        .then((res) => res.json())
        .then(setFoods)
        .finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(handle);
  }, [query, category]);

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Search the food database..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="rounded-md bg-white border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-500"
      />

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategory(null)}
          className={`px-3 py-1 rounded-full text-xs transition-colors ${
            category === null ? "bg-emerald-600 text-white" : "bg-white border border-neutral-300 text-neutral-600"
          }`}
        >
          All
        </button>
        {FOOD_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              category === cat ? "bg-emerald-600 text-white" : "bg-white border border-neutral-300 text-neutral-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading...</p>
      ) : foods.length === 0 ? (
        <p className="text-sm text-neutral-500">No foods found.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-neutral-300">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-600 bg-neutral-50">
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Serving</th>
                <th className="py-2 px-3">Cal</th>
                <th className="py-2 px-3">Protein</th>
                <th className="py-2 px-3">Carbs</th>
                <th className="py-2 px-3">Fat</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food) => (
                <tr key={food.id} className="border-t border-neutral-100">
                  <td className="py-2 px-3">
                    {food.name}
                    {food.isCustom && <span className="ml-2 text-xs text-emerald-600">custom</span>}
                  </td>
                  <td className="py-2 px-3 text-neutral-600">
                    {food.servingSize}{food.servingUnit === "g" ? "g" : ` ${food.servingUnit}`}
                  </td>
                  <td className="py-2 px-3">{Math.round(food.calories)}</td>
                  <td className="py-2 px-3">{Math.round(food.proteinG)}g</td>
                  <td className="py-2 px-3">{Math.round(food.carbsG)}g</td>
                  <td className="py-2 px-3">{Math.round(food.fatG)}g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
