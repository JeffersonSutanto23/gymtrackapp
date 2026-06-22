"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { FOOD_CATEGORIES } from "@/lib/categories";
import { INPUT, pillClass } from "@/lib/ui";

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
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search the food database..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${INPUT} w-full pl-9`}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setCategory(null)} className={pillClass(category === null)}>
          All
        </button>
        {FOOD_CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)} className={pillClass(category === cat)}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </p>
      ) : foods.length === 0 ? (
        <p className="text-sm text-neutral-500">No foods found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500 bg-neutral-50">
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
                  <td className="py-2 px-3 font-medium text-neutral-900">
                    {food.name}
                    {food.isCustom && <span className="ml-2 text-xs font-normal text-emerald-600">custom</span>}
                  </td>
                  <td className="py-2 px-3 text-neutral-500">
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
