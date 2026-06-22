"use client";

import { useRouter } from "next/navigation";
import { INPUT } from "@/lib/ui";

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
      className={`${INPUT} py-1.5`}
    />
  );
}
