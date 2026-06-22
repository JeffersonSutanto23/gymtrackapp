"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { BTN_PRIMARY, INPUT } from "@/lib/ui";

export function SleepForm() {
  const router = useRouter();
  const [hours, setHours] = useState(7.5);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/sleep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours }),
    });

    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
        Hours slept
        <input
          type="number"
          min={0}
          max={24}
          step={0.25}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          className={`w-32 ${INPUT}`}
        />
      </label>
      <button type="submit" disabled={loading} className={BTN_PRIMARY}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {loading ? "Saving..." : "Log sleep"}
      </button>
    </form>
  );
}
