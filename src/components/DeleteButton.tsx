"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({
  endpoint,
  redirectTo,
  label = "Delete",
}: {
  endpoint: string;
  redirectTo?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm("Are you sure?")) return;
    setLoading(true);
    const res = await fetch(endpoint, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {loading ? "..." : label}
    </button>
  );
}
