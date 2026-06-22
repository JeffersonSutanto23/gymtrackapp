"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ICON_BTN, INPUT } from "@/lib/ui";

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
        className={ICON_BTN}
        aria-label="Previous day"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <input
        type="date"
        value={date}
        onChange={(e) => router.push(`/nutrition?date=${e.target.value}`)}
        className={`${INPUT} py-1.5`}
      />
      <button
        onClick={() => router.push(`/nutrition?date=${shiftDate(date, 1)}`)}
        className={ICON_BTN}
        aria-label="Next day"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
