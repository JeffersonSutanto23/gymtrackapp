import Link from "next/link";
import { redirect } from "next/navigation";
import { Flame, Dumbbell, Utensils, Scale, Activity, CalendarDays, TrendingUp, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

const FEATURES = [
  {
    icon: Dumbbell,
    title: "Workout Logging",
    desc: "Log sets across 70+ seeded exercises and track max weight & volume per exercise over time.",
  },
  {
    icon: Utensils,
    title: "Nutrition Diary",
    desc: "Search a 170+ food database, log meals by breakfast/lunch/dinner/snack, and hit your macro targets.",
  },
  {
    icon: Scale,
    title: "Body Weight Trends",
    desc: "Log your weight over time and watch the trend line update automatically.",
  },
  {
    icon: Activity,
    title: "Daily Activity",
    desc: "Track cardio minutes, sleep hours, and water intake right alongside your training.",
  },
  {
    icon: CalendarDays,
    title: "Calendar History",
    desc: "Jump to any day and see exactly what you ate, lifted, and logged — all in one view.",
  },
  {
    icon: TrendingUp,
    title: "Goal-Based Targets",
    desc: "Pick Clean Bulk, Bulk, Cut, or Maintain and get calorie & macro targets for a sustainable weekly rate.",
  },
];

const STATS: [string, string][] = [
  ["70+", "Exercises"],
  ["170+", "Foods"],
  ["6", "Habits tracked"],
];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-white/10 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-900 shadow-lg shadow-amber-500/20">
              <Flame className="h-4 w-4" />
            </span>
            <span className="font-semibold tracking-tight text-white">TrackPump</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-300 transition-colors hover:text-white">
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-white px-4 py-1.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 pt-20 pb-16 text-center sm:pt-28">
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Train smarter. Eat smarter. <span className="text-emerald-400">See it all in one place.</span>
        </h1>
        <p className="max-w-2xl text-base text-neutral-400 sm:text-lg">
          TrackPump is an all-in-one gym & nutrition tracker — log workouts, meals, body weight, sleep, water, and
          cardio, then watch your progress add up on a calendar and dashboard built for daily use.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-400"
          >
            Get started free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4">
        <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 text-center">
          {STATS.map(([value, label]) => (
            <div key={label} className="px-4 py-5">
              <p className="text-2xl font-semibold text-white">{value}</p>
              <p className="text-xs text-neutral-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Everything you need to stay consistent
          </h2>
          <p className="mt-2 text-neutral-400">One dashboard for training, food, and recovery — no spreadsheets required.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/[0.08]">
              <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="font-medium text-white">{title}</h3>
              <p className="mt-1 text-sm text-neutral-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 pb-24 text-center">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-white/5 to-amber-500/10 px-6 py-10">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Ready to track your next session?</h2>
          <p className="mt-2 text-neutral-400">Create a free account — no credit card, no ads.</p>
          <Link
            href="/register"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-400"
          >
            Create your account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-6 text-center text-xs text-neutral-500">
        Built with Next.js, TypeScript, Tailwind CSS & Prisma.
      </footer>
    </div>
  );
}
