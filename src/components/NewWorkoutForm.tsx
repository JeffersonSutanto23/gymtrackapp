"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";
import { BTN_PRIMARY, INPUT } from "@/lib/ui";

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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        required
        placeholder="e.g. Push Day"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={`flex-1 ${INPUT}`}
      />
      <button type="submit" disabled={loading} className={`${BTN_PRIMARY} w-full sm:w-auto whitespace-nowrap`}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        {loading ? "Creating..." : "Start Workout"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
