"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewWorkoutForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Could not create workout.");
      return;
    }

    const session = await res.json();
    router.push(`/workouts/${session.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        required
        placeholder="e.g. Push Day"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 outline-none focus:border-emerald-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors px-4 py-2 font-medium whitespace-nowrap"
      >
        {loading ? "Creating..." : "Start Workout"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
