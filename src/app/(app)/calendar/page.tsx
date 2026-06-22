import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Scale,
  Utensils,
  Activity,
  Moon,
  GlassWater,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { computeFoodLogTotals, round } from "@/lib/nutrition";
import { GOAL_PRESETS, CARDIO_TYPE_LABELS } from "@/lib/goals";
import { sleepHours, formatTime } from "@/lib/sleep";
import { MacroBar } from "@/components/MacroBar";
import { CalendarDateJump } from "@/components/CalendarDateJump";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ICON_BTN } from "@/lib/ui";

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

  const [
    profile,
    monthFoodLogs,
    monthSessions,
    monthWeightLogs,
    monthCardioLogs,
    monthSleepLogs,
    monthWaterLogs,
    dayFoodLogs,
    daySessions,
    dayWeightLog,
    dayCardioLogs,
    daySleepLogs,
    dayWaterLogs,
  ] = await Promise.all([
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
    prisma.cardioLog.findMany({
      where: { userId: user!.id, loggedAt: { gte: monthStart, lt: monthEnd } },
    }),
    prisma.sleepLog.findMany({
      where: { userId: user!.id, loggedAt: { gte: monthStart, lt: monthEnd } },
    }),
    prisma.waterLog.findMany({
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
    prisma.cardioLog.findMany({
      where: { userId: user!.id, loggedAt: { gte: dayStart, lt: dayEnd } },
      orderBy: { loggedAt: "asc" },
    }),
    prisma.sleepLog.findMany({
      where: { userId: user!.id, loggedAt: { gte: dayStart, lt: dayEnd } },
      orderBy: { loggedAt: "asc" },
    }),
    prisma.waterLog.findMany({
      where: { userId: user!.id, loggedAt: { gte: dayStart, lt: dayEnd } },
    }),
  ]);

  const dayIndex = new Map<
    string,
    { calories: number; workoutCount: number; hasWeight: boolean; hasActivity: boolean }
  >();

  for (const log of monthFoodLogs) {
    const key = dateKey(new Date(log.loggedAt));
    const entry = dayIndex.get(key) ?? { calories: 0, workoutCount: 0, hasWeight: false, hasActivity: false };
    entry.calories += log.food.calories * log.servings;
    dayIndex.set(key, entry);
  }
  for (const session of monthSessions) {
    const key = dateKey(new Date(session.startedAt));
    const entry = dayIndex.get(key) ?? { calories: 0, workoutCount: 0, hasWeight: false, hasActivity: false };
    entry.workoutCount += 1;
    dayIndex.set(key, entry);
  }
  for (const log of monthWeightLogs) {
    const key = dateKey(new Date(log.loggedAt));
    const entry = dayIndex.get(key) ?? { calories: 0, workoutCount: 0, hasWeight: false, hasActivity: false };
    entry.hasWeight = true;
    dayIndex.set(key, entry);
  }
  for (const log of [...monthCardioLogs, ...monthSleepLogs, ...monthWaterLogs]) {
    const key = dateKey(new Date(log.loggedAt));
    const entry = dayIndex.get(key) ?? { calories: 0, workoutCount: 0, hasWeight: false, hasActivity: false };
    entry.hasActivity = true;
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
      <PageHeader
        icon={CalendarDays}
        title="Calendar"
        subtitle="Browse your daily activity history."
        action={<CalendarDateJump date={selectedDate} />}
      />

      <Card>
        <div className="flex items-center justify-between mb-4">
          <Link href={`/calendar?month=${prevMonth}&date=${selectedDate}`} className={ICON_BTN} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-neutral-900">{monthLabel}</h2>
            <Link href={`/calendar?month=${today.slice(0, 7)}&date=${today}`} className="text-sm text-emerald-600 hover:underline">
              Today
            </Link>
          </div>
          <Link href={`/calendar?month=${nextMonth}&date=${selectedDate}`} className={ICON_BTN} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-neutral-400 mb-2">
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
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : isToday
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <span className={isToday && !isSelected ? "font-semibold text-emerald-600" : ""}>{dayNumber}</span>
                <span className="flex gap-0.5 h-2 items-center">
                  {entry?.workoutCount ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> : null}
                  {entry?.calories ? <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> : null}
                  {entry?.hasWeight ? <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> : null}
                  {entry?.hasActivity ? <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> : null}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex gap-4 mt-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Workout
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Nutrition
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Weight
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Activity
          </span>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-neutral-900">{selectedLabel}</h2>
          <Link href={`/nutrition?date=${selectedDate}`} className="flex items-center gap-1 text-sm text-emerald-600 hover:underline">
            Log food <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 mb-3">
              <Utensils className="h-3.5 w-3.5" /> Nutrition
            </h3>
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
            <h3 className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 mb-3">
              <Dumbbell className="h-3.5 w-3.5" /> Workouts
            </h3>
            {daySessions.length === 0 ? (
              <EmptyState icon={Dumbbell} message="No workouts logged this day." />
            ) : (
              <ul className="flex flex-col gap-2">
                {daySessions.map((session) => {
                  const totalVolume = session.sets.reduce((sum, s) => sum + s.reps * s.weightKg, 0);
                  return (
                    <li key={session.id}>
                      <Link
                        href={`/workouts/${session.id}`}
                        className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
                      >
                        <span className="font-medium text-neutral-900">{session.title}</span>
                        <span className="text-sm text-neutral-500">
                          {session.sets.length} sets · {Math.round(totalVolume)} kg
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            <h3 className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 mt-5 mb-2">
              <Scale className="h-3.5 w-3.5" /> Body Weight
            </h3>
            {dayWeightLog ? (
              <p className="text-sm">
                <span className="text-2xl font-semibold tracking-tight">{round(dayWeightLog.weightKg, 1)}</span>{" "}
                <span className="text-neutral-500">kg</span>
              </p>
            ) : (
              <p className="text-sm text-neutral-500">No weight logged this day.</p>
            )}
          </div>
        </div>

        <h3 className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 mt-6 mb-3">
          <Activity className="h-3.5 w-3.5" /> Activity
        </h3>
        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 mb-2">
              <Activity className="h-3 w-3" /> Cardio
            </h4>
            {dayCardioLogs.length === 0 ? (
              <p className="text-sm text-neutral-500">No cardio logged this day.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {dayCardioLogs.map((log) => (
                  <li key={log.id} className="text-sm">
                    <span className="font-medium">{CARDIO_TYPE_LABELS[log.activity]}</span>{" "}
                    <span className="text-neutral-500">
                      {log.durationMin} min{log.distanceKm ? ` · ${log.distanceKm} km` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 mb-2">
              <Moon className="h-3 w-3" /> Sleep
            </h4>
            {daySleepLogs.length === 0 ? (
              <p className="text-sm text-neutral-500">No sleep logged this day.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {daySleepLogs.map((log) => (
                  <li key={log.id} className="text-sm">
                    <span className="font-medium">{round(sleepHours(log.bedTime, log.wakeTime), 1)} h</span>{" "}
                    <span className="text-neutral-500">
                      {formatTime(log.bedTime)} – {formatTime(log.wakeTime)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 mb-2">
              <GlassWater className="h-3 w-3" /> Water
            </h4>
            {dayWaterLogs.length === 0 ? (
              <p className="text-sm text-neutral-500">No water logged this day.</p>
            ) : (
              <p className="text-sm">
                <span className="font-medium">{dayWaterLogs.reduce((sum, log) => sum + log.glasses, 0)}</span>{" "}
                <span className="text-neutral-500">glasses</span>
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
