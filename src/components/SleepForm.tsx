"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { BTN_PRIMARY, INPUT } from "@/lib/ui";
import { round } from "@/lib/nutrition";

function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

export function SleepForm() {
  const router = useRouter();
  const [bedTime, setBedTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const durationHours = useMemo(() => {
    const today = new Date();
    const wake = combineDateAndTime(today, wakeTime);
    let bed = combineDateAndTime(today, bedTime);
    if (bed >= wake) bed = new Date(bed.getTime() - 24 * 60 * 60 * 1000);
    return (wake.getTime() - bed.getTime()) / (1000 * 60 * 60);
  }, [bedTime, wakeTime]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const today = new Date();
    const wake = combineDateAndTime(today, wakeTime);
    let bed = combineDateAndTime(today, bedTime);
    if (bed >= wake) bed = new Date(bed.getTime() - 24 * 60 * 60 * 1000);

    const res = await fetch("/api/sleep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bedTime: bed.toISOString(), wakeTime: wake.toISOString() }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Could not log sleep.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
        Bed time
        <input
          type="time"
          value={bedTime}
          onChange={(e) => setBedTime(e.target.value)}
          className={`w-32 ${INPUT}`}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
        Wake time
        <input
          type="time"
          value={wakeTime}
          onChange={(e) => setWakeTime(e.target.value)}
          className={`w-32 ${INPUT}`}
        />
      </label>
      <p className="text-sm text-neutral-500">{round(durationHours, 1)} h</p>
      <button type="submit" disabled={loading} className={BTN_PRIMARY}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {loading ? "Saving..." : "Log sleep"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
