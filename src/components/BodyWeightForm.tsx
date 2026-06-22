"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BodyWeightForm() {
  const router = useRouter();
  const [weightKg, setWeightKg] = useState(75);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/bodyweight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weightKg }),
    });

    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <label className="flex flex-col gap-1 text-sm text-neutral-600">
        Weight (kg)
        <input
          type="number"
          min={0}
          step={0.1}
          value={weightKg}
          onChange={(e) => setWeightKg(Number(e.target.value))}
          className="rounded-md bg-white border border-neutral-300 px-3 py-2 text-neutral-900 outline-none focus:border-emerald-500 w-32"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors px-3 py-2 text-sm font-medium"
      >
        {loading ? "Saving..." : "Log weight"}
      </button>
    </form>
  );
}
