"use client";

import { useRouter } from "next/navigation";

function shiftDate(date: string, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function DateNav({ date }: { date: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => router.push(`/nutrition?date=${shiftDate(date, -1)}`)}
        className="rounded-md border border-neutral-800 px-2 py-1.5 hover:bg-neutral-800 transition-colors"
        aria-label="Previous day"
      >
        ←
      </button>
      <input
        type="date"
        value={date}
        onChange={(e) => router.push(`/nutrition?date=${e.target.value}`)}
        className="rounded-md bg-neutral-900 border border-neutral-800 px-3 py-1.5 outline-none focus:border-emerald-500"
      />
      <button
        onClick={() => router.push(`/nutrition?date=${shiftDate(date, 1)}`)}
        className="rounded-md border border-neutral-800 px-2 py-1.5 hover:bg-neutral-800 transition-colors"
        aria-label="Next day"
      >
        →
      </button>
    </div>
  );
}
