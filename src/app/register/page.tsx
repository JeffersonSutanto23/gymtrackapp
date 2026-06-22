import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-neutral-600 text-sm mt-1">Start tracking your gym sessions and meals.</p>
      </div>
      <AuthForm mode="register" />
      <p className="text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
