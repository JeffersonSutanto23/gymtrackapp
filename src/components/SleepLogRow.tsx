"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";
import { toDatetimeLocalValue } from "@/lib/datetime";
import { formatTime, sleepHours } from "@/lib/sleep";
import { round } from "@/lib/nutrition";
import { INPUT } from "@/lib/ui";

type SleepLog = { id: string; bedTime: string; wakeTime: string };

export function SleepLogRow({ log }: { log: SleepLog }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [bedTime, setBedTime] = useState(toDatetimeLocalValue(log.bedTime));
  const [wakeTime, setWakeTime] = useState(toDatetimeLocalValue(log.wakeTime));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/sleep/${log.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bedTime: new Date(bedTime).toISOString(),
        wakeTime: new Date(wakeTime).toISOString(),
      }),
    });
    setLoading(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    } else {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Could not save.");
    }
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs font-medium text-neutral-500">
            Bed time
            <input
              type="datetime-local"
              value={bedTime}
              onChange={(e) => setBedTime(e.target.value)}
              className={`${INPUT} py-1`}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-neutral-500">
            Wake time
            <input
              type="datetime-local"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className={`${INPUT} py-1`}
            />
          </label>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-end gap-1">
          <button
            onClick={handleSave}
            disabled={loading}
            aria-label="Save"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setEditing(false)}
            aria-label="Cancel"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-neutral-50">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium">{round(sleepHours(log.bedTime, log.wakeTime), 1)} h</span>
        <span className="text-xs text-neutral-500">
          {formatTime(log.bedTime)} – {formatTime(log.wakeTime)} · {new Date(log.wakeTime).toLocaleDateString()}
        </span>
      </div>
      <span className="flex shrink-0 items-center">
        <button
          onClick={() => setEditing(true)}
          aria-label="Edit"
          className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <DeleteButton endpoint={`/api/sleep/${log.id}`} />
      </span>
    </li>
  );
}
