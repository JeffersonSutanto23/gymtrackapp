import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { computeFoodLogTotals, round } from "@/lib/nutrition";
import { GOAL_PRESETS } from "@/lib/goals";
import { MacroBar } from "@/components/MacroBar";
import { CalendarDateJump } from "@/components/CalendarDateJump";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function todayStr() {
  return dateKey(new Date());
}

function parseMonth(monthStr: string) {
  const [year, month] = monthStr.split("-").map(Number);
  return { year, monthIndex: month - 1 };
}

function monthStr(year: number, monthIndex: number) {
  const d = new Date(year, monthIndex, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; date?: string }>;
}) {
  const { month: monthParam, date: dateParam } = await searchParams;
  const today = todayStr();
  const month = monthParam ?? today.slice(0, 7);
  const selectedDate = dateParam ?? today;

  const { year, monthIndex } = parseMonth(month);
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 1);
  const prevMonth = monthStr(year, monthIndex - 1);
  const nextMonth = monthStr(year, monthIndex + 1);

  const user = await getCurrentUser();

  const dayStart = new Date(selectedDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [profile, monthFoodLogs, monthSessions, monthWeightLogs, dayFoodLogs, daySessions, dayWeightLog] =
    await Promise.all([
      prisma.profile.findUnique({ where: { userId: user!.id } }),
      prisma.foodLog.findMany({
        where: { userId: user!.id, loggedAt: { gte: monthStart, lt: monthEnd } },
        include: { food: true },
      }),
      prisma.workoutSession.findMany({
        where: { userId: user!.id, startedAt: { gte: monthStart, lt: monthEnd } },
        include: { sets: true },
      }),
      prisma.bodyWeightLog.findMany({
        where: { userId: user!.id, loggedAt: { gte: monthStart, lt: monthEnd } },
      }),
      prisma.foodLog.findMany({
        where: { userId: user!.id, loggedAt: { gte: dayStart, lt: dayEnd } },
        include: { food: true },
        orderBy: { loggedAt: "asc" },
      }),
      prisma.workoutSession.findMany({
        where: { userId: user!.id, startedAt: { gte: dayStart, lt: dayEnd } },
        include: { sets: true },
        orderBy: { startedAt: "asc" },
      }),
      prisma.bodyWeightLog.findFirst({
        where: { userId: user!.id, loggedAt: { gte: dayStart, lt: dayEnd } },
        orderBy: { loggedAt: "desc" },
      }),
    ]);

  const dayIndex = new Map<
    string,
    { calories: number; workoutCount: number; hasWeight: boolean }
  >();

  for (const log of monthFoodLogs) {
    const key = dateKey(new Date(log.loggedAt));
    const entry = dayIndex.get(key) ?? { calories: 0, workoutCount: 0, hasWeight: false };
    entry.calories += log.food.calories * log.servings;
    dayIndex.set(key, entry);
  }
  for (const session of monthSessions) {
    const key = dateKey(new Date(session.startedAt));
    const entry = dayIndex.get(key) ?? { calories: 0, workoutCount: 0, hasWeight: false };
    entry.workoutCount += 1;
    dayIndex.set(key, entry);
  }
  for (const log of monthWeightLogs) {
    const key = dateKey(new Date(log.loggedAt));
    const entry = dayIndex.get(key) ?? { calories: 0, workoutCount: 0, hasWeight: false };
    entry.hasWeight = true;
    dayIndex.set(key, entry);
  }

  const leadingBlanks = monthStart.getDay();
  const daysInMonth = monthEnd.getDate() === 1 ? new Date(year, monthIndex + 1, 0).getDate() : monthEnd.getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${year}-${pad(monthIndex + 1)}-${pad(i + 1)}`),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const targets = profile ?? { ...GOAL_PRESETS.MAINTAIN };
  const dayTotals = computeFoodLogTotals(dayFoodLogs);
  const monthLabel = monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const selectedLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-neutral-600 text-sm mt-1">Browse your daily activity history.</p>
        </div>
        <CalendarDateJump date={selectedDate} />
      </div>

      <section className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/calendar?month=${prevMonth}&date=${selectedDate}`}
            className="rounded-md border border-neutral-300 px-2 py-1.5 hover:bg-neutral-100 transition-colors"
            aria-label="Previous month"
          >
            ←
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="font-semibold">{monthLabel}</h2>
            <Link href={`/calendar?month=${today.slice(0, 7)}&date=${today}`} className="text-sm text-emerald-600 hover:underline">
              Today
            </Link>
          </div>
          <Link
            href={`/calendar?month=${nextMonth}&date=${selectedDate}`}
            className="rounded-md border border-neutral-300 px-2 py-1.5 hover:bg-neutral-100 transition-colors"
            aria-label="Next month"
          >
            →
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-neutral-500 mb-2">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((cellDate, i) => {
            if (!cellDate) return <div key={i} />;
            const entry = dayIndex.get(cellDate);
            const isSelected = cellDate === selectedDate;
            const isToday = cellDate === today;
            const dayNumber = Number(cellDate.slice(-2));
            return (
              <Link
                key={cellDate}
                href={`/calendar?month=${month}&date=${cellDate}`}
                className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-xs transition-colors ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-600/20"
                    : isToday
                      ? "border-neutral-400 bg-neutral-100"
                      : "border-neutral-300 hover:bg-neutral-100"
                }`}
              >
                <span className={isToday ? "font-semibold text-emerald-600" : ""}>{dayNumber}</span>
                <span className="flex gap-0.5 h-2 items-center">
                  {entry?.workoutCount ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> : null}
                  {entry?.calories ? <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> : null}
                  {entry?.hasWeight ? <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> : null}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex gap-4 mt-4 text-xs text-neutral-600">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Workout
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Nutrition
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Weight
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">{selectedLabel}</h2>
          <Link href={`/nutrition?date=${selectedDate}`} className="text-sm text-emerald-600 hover:underline">
            Log food →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-neutral-600 mb-3">Nutrition</h3>
            {dayFoodLogs.length === 0 ? (
              <p className="text-sm text-neutral-500">Nothing logged this day.</p>
            ) : (
              <div className="flex flex-col gap-3">
                <MacroBar label="Calories" current={dayTotals.calories} target={targets.targetCalories} unit="kcal" color="#34d399" />
                <MacroBar label="Protein" current={dayTotals.proteinG} target={targets.targetProteinG} color="#60a5fa" />
                <MacroBar label="Carbs" current={dayTotals.carbsG} target={targets.targetCarbsG} color="#fbbf24" />
                <MacroBar label="Fat" current={dayTotals.fatG} target={targets.targetFatG} color="#f472b6" />
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-neutral-600 mb-3">Workouts</h3>
            {daySessions.length === 0 ? (
              <p className="text-sm text-neutral-500">No workouts logged this day.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {daySessions.map((session) => {
                  const totalVolume = session.sets.reduce((sum, s) => sum + s.reps * s.weightKg, 0);
                  return (
                    <li key={session.id}>
                      <Link
                        href={`/workouts/${session.id}`}
                        className="flex items-center justify-between rounded-lg border border-neutral-300 px-3 py-2 hover:border-emerald-600/50 transition-colors"
                      >
                        <span>{session.title}</span>
                        <span className="text-sm text-neutral-600">
                          {session.sets.length} sets · {Math.round(totalVolume)} kg
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            <h3 className="text-sm font-medium text-neutral-600 mt-5 mb-2">Body Weight</h3>
            {dayWeightLog ? (
              <p className="text-sm">
                <span className="text-2xl font-bold">{round(dayWeightLog.weightKg, 1)}</span>{" "}
                <span className="text-neutral-600">kg</span>
              </p>
            ) : (
              <p className="text-sm text-neutral-500">No weight logged this day.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
