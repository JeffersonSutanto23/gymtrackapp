import Link from "next/link";
import { redirect } from "next/navigation";
import { Flame } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-900 shadow-lg shadow-amber-500/20">
          <Flame className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Create your account</h1>
          <p className="mt-1 text-sm text-neutral-400">Start tracking your gym sessions and meals.</p>
        </div>
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <AuthForm mode="register" />
      </div>
      <p className="text-sm text-neutral-400">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
