"use client";

import { useRouter } from "next/navigation";

export function CalendarDateJump({ date }: { date: string }) {
  const router = useRouter();

  return (
    <input
      type="date"
      value={date}
      onChange={(e) => {
        const value = e.target.value;
        if (!value) return;
        router.push(`/calendar?month=${value.slice(0, 7)}&date=${value}`);
      }}
      className="rounded-md bg-white border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500"
    />
  );
}
