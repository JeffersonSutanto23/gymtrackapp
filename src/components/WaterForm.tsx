"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassWater, Loader2 } from "lucide-react";
import { BTN_SECONDARY } from "@/lib/ui";

export function WaterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function addGlasses(glasses: number) {
    setLoading(true);

    await fetch("/api/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ glasses }),
    });

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" disabled={loading} onClick={() => addGlasses(1)} className={BTN_SECONDARY}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GlassWater className="h-4 w-4" />}
        +1 glass
      </button>
      <button type="button" disabled={loading} onClick={() => addGlasses(3)} className={BTN_SECONDARY}>
        <GlassWater className="h-4 w-4" />
        +3 glasses
      </button>
    </div>
  );
}
