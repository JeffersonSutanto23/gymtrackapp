"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
        <h1 className="text-2xl font-bold">{title}</h1>
        <button onClick={() => setEditing(true)} className="text-xs text-neutral-500 hover:text-neutral-700">
          Edit
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
        className="text-2xl font-bold rounded-md bg-white border border-neutral-300 px-2 py-1 outline-none focus:border-emerald-500"
      />
      <button onClick={handleSave} disabled={loading} className="text-sm text-emerald-600 hover:underline disabled:opacity-50">
        {loading ? "Saving..." : "Save"}
      </button>
      <button
        onClick={() => {
          setEditing(false);
          setValue(title);
        }}
        className="text-sm text-neutral-500 hover:underline"
      >
        Cancel
      </button>
    </div>
  );
}
