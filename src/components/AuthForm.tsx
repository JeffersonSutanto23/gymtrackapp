"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INPUT, BTN_PRIMARY } from "@/lib/ui";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mode === "register" ? { name, email, password } : { email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      {mode === "register" && (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-600" htmlFor="name">
            Name
          </label>
          <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-neutral-600" htmlFor="email">
          Email
        </label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-neutral-600" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={INPUT}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className={`${BTN_PRIMARY} py-2.5`}>
        {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
      </button>
    </form>
  );
}
