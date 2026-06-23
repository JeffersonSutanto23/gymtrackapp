"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ICON_BTN, INPUT } from "@/lib/ui";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function shiftDate(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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
