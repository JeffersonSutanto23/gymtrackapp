import Link from "next/link";
import { LayoutDashboard, Utensils, Scale, Dumbbell, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { computeFoodLogTotals, round } from "@/lib/nutrition";
import { GOAL_LABELS, GOAL_PRESETS } from "@/lib/goals";
import { MacroBar } from "@/components/MacroBar";
import { WeightChart } from "@/components/WeightChart";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";

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
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle={
          <>
            Goal: <span className="font-medium text-emerald-600">{GOAL_LABELS[targets.goal]}</span>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <SectionHeader
            icon={Utensils}
            title="Today's Nutrition"
            action={
              <Link href="/nutrition" className="flex items-center gap-1 text-sm text-emerald-600 hover:underline">
                Log food <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="flex flex-col gap-3">
            <MacroBar label="Calories" current={totals.calories} target={targets.targetCalories} unit="kcal" color="#34d399" />
            <MacroBar label="Protein" current={totals.proteinG} target={targets.targetProteinG} color="#60a5fa" />
            <MacroBar label="Carbs" current={totals.carbsG} target={targets.targetCarbsG} color="#fbbf24" />
            <MacroBar label="Fat" current={totals.fatG} target={targets.targetFatG} color="#f472b6" />
          </div>
        </Card>

        <Card>
          <SectionHeader
            icon={Scale}
            title="Body Weight"
            action={
              <Link href="/profile" className="flex items-center gap-1 text-sm text-emerald-600 hover:underline">
                Log weight <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {latestWeight ? (
            <div className="mb-2 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight">{round(latestWeight.weightKg, 1)}</span>
              <span className="text-neutral-500">kg</span>
              {weightDelta !== null && (
                <span className={`text-sm ${weightDelta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {weightDelta >= 0 ? "+" : ""}
                  {round(weightDelta, 1)} kg
                </span>
              )}
            </div>
          ) : (
            <p className="mb-2 text-sm text-neutral-500">No weight logged yet.</p>
          )}
          <WeightChart data={chartData} />
        </Card>
      </div>

      <Card>
        <SectionHeader
          icon={Dumbbell}
          title="Recent Workouts"
          action={
            <Link href="/workouts" className="flex items-center gap-1 text-sm text-emerald-600 hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        {recentSessions.length === 0 ? (
          <EmptyState icon={Dumbbell} message="No workouts logged yet." />
        ) : (
          <ul className="flex flex-col gap-1">
            {recentSessions.map((session) => (
              <li key={session.id}>
                <Link
                  href={`/workouts/${session.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-neutral-50"
                >
                  <span className="font-medium">{session.title}</span>
                  <span className="text-sm text-neutral-500">
                    {new Date(session.startedAt).toLocaleDateString()} · {session.sets.length} sets
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
