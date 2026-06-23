"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";
import { toDatetimeLocalValue } from "@/lib/datetime";
import { INPUT } from "@/lib/ui";

type WaterLog = { id: string; glasses: number; loggedAt: string };

export function WaterLogRow({ log }: { log: WaterLog }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [glasses, setGlasses] = useState(log.glasses);
  const [loggedAt, setLoggedAt] = useState(toDatetimeLocalValue(log.loggedAt));
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const res = await fetch(`/api/water/${log.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ glasses, loggedAt: new Date(loggedAt).toISOString() }),
    });
    setLoading(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={1}
            max={50}
            value={glasses}
            onChange={(e) => setGlasses(Number(e.target.value))}
            className={`${INPUT} py-1`}
          />
          <input
            type="datetime-local"
            value={loggedAt}
            onChange={(e) => setLoggedAt(e.target.value)}
            className={`${INPUT} py-1`}
          />
        </div>
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
        <span className="font-medium">
          +{log.glasses} glass{log.glasses > 1 ? "es" : ""}
        </span>
        <span className="text-xs text-neutral-500">{new Date(log.loggedAt).toLocaleTimeString()}</span>
      </div>
      <span className="flex shrink-0 items-center">
        <button
          onClick={() => setEditing(true)}
          aria-label="Edit"
          className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <DeleteButton endpoint={`/api/water/${log.id}`} />
      </span>
    </li>
  );
}
