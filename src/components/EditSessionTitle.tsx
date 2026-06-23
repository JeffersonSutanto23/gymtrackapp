"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { INPUT } from "@/lib/ui";

export function EditSessionTitle({ sessionId, title }: { sessionId: string; title: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!value.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/workouts/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: value.trim() }),
    });
    setLoading(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        <button
          onClick={() => setEditing(true)}
          aria-label="Edit title"
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`text-xl font-semibold ${INPUT} py-1`}
      />
      <button
        onClick={handleSave}
        disabled={loading}
        aria-label="Save"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </button>
      <button
        onClick={() => {
          setEditing(false);
          setValue(title);
        }}
        aria-label="Cancel"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
