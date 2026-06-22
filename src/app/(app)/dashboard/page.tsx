import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { computeFoodLogTotals, round } from "@/lib/nutrition";
import { GOAL_LABELS, GOAL_PRESETS } from "@/lib/goals";
import { MacroBar } from "@/components/MacroBar";
import { WeightChart } from "@/components/WeightChart";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [profile, todayLogs, weightLogs, recentSessions] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user!.id } }),
    prisma.foodLog.findMany({
      where: {
        userId: user!.id,
        loggedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      include: { food: true },
    }),
    prisma.bodyWeightLog.findMany({
      where: { userId: user!.id },
      orderBy: { loggedAt: "asc" },
      take: 30,
    }),
    prisma.workoutSession.findMany({
      where: { userId: user!.id },
      orderBy: { startedAt: "desc" },
      take: 5,
      include: { sets: true },
    }),
  ]);

  const targets = profile ?? { goal: "MAINTAIN" as const, ...GOAL_PRESETS.MAINTAIN };
  const totals = computeFoodLogTotals(todayLogs);
  const latestWeight = weightLogs.at(-1);
  const firstWeight = weightLogs[0];
  const weightDelta = latestWeight && firstWeight ? latestWeight.weightKg - firstWeight.weightKg : null;

  const chartData = weightLogs.map((log) => ({
    date: new Date(log.loggedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    weightKg: round(log.weightKg, 1),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-neutral-400 text-sm mt-1">
          Goal: <span className="text-emerald-400">{GOAL_LABELS[targets.goal]}</span>
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Today&apos;s Nutrition</h2>
            <Link href="/nutrition" className="text-sm text-emerald-400 hover:underline">
              Log food →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <MacroBar label="Calories" current={totals.calories} target={targets.targetCalories} unit="kcal" color="#34d399" />
            <MacroBar label="Protein" current={totals.proteinG} target={targets.targetProteinG} color="#60a5fa" />
            <MacroBar label="Carbs" current={totals.carbsG} target={targets.targetCarbsG} color="#fbbf24" />
            <MacroBar label="Fat" current={totals.fatG} target={targets.targetFatG} color="#f472b6" />
          </div>
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Body Weight</h2>
            <Link href="/profile" className="text-sm text-emerald-400 hover:underline">
              Log weight →
            </Link>
          </div>
          {latestWeight ? (
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold">{round(latestWeight.weightKg, 1)}</span>
              <span className="text-neutral-400">kg</span>
              {weightDelta !== null && (
                <span className={`text-sm ${weightDelta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {weightDelta >= 0 ? "+" : ""}
                  {round(weightDelta, 1)} kg
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 mb-2">No weight logged yet.</p>
          )}
          <WeightChart data={chartData} />
        </section>
      </div>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Workouts</h2>
          <Link href="/workouts" className="text-sm text-emerald-400 hover:underline">
            View all →
          </Link>
        </div>
        {recentSessions.length === 0 ? (
          <p className="text-sm text-neutral-500">No workouts logged yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentSessions.map((session) => (
              <li key={session.id}>
                <Link
                  href={`/workouts/${session.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-neutral-800 transition-colors"
                >
                  <span>{session.title}</span>
                  <span className="text-sm text-neutral-400">
                    {new Date(session.startedAt).toLocaleDateString()} · {session.sets.length} sets
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
