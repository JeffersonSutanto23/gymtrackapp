import { Camera, Search, Utensils } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { computeFoodLogTotals, round } from "@/lib/nutrition";
import { GOAL_PRESETS, MEAL_TYPE_LABELS } from "@/lib/goals";
import { getClientOffsetMinutes, clientDateStr, clientDateStrToRange } from "@/lib/timezone";
import { MacroBar } from "@/components/MacroBar";
import { FoodSearchPicker } from "@/components/FoodSearchPicker";
import { FoodPhotoAnalyzer } from "@/components/FoodPhotoAnalyzer";
import { DateNav } from "@/components/DateNav";
import { DeleteButton } from "@/components/DeleteButton";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function NutritionPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const offsetMinutes = await getClientOffsetMinutes();
  const date = dateParam ?? clientDateStr(offsetMinutes);
  const user = await getCurrentUser();

  const { start, end } = clientDateStrToRange(date, offsetMinutes);

  const [profile, logs] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user!.id } }),
    prisma.foodLog.findMany({
      where: { userId: user!.id, loggedAt: { gte: start, lt: end } },
      include: { food: true },
      orderBy: { loggedAt: "asc" },
    }),
  ]);

  const targets = profile ?? { ...GOAL_PRESETS.MAINTAIN };
  const totals = computeFoodLogTotals(logs);

  const mealOrder: (keyof typeof MEAL_TYPE_LABELS)[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
  const byMeal = mealOrder.map((mealType) => ({
    mealType,
    logs: logs.filter((l) => l.mealType === mealType),
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={Utensils} title="Nutrition" subtitle="Log meals and track macros for the day." action={<DateNav date={date} />} />

      <Card>
        <SectionHeader title="Daily Totals" />
        <div className="flex flex-col gap-3">
          <MacroBar label="Calories" current={totals.calories} target={targets.targetCalories} unit="kcal" color="#34d399" />
          <MacroBar label="Protein" current={totals.proteinG} target={targets.targetProteinG} color="#60a5fa" />
          <MacroBar label="Carbs" current={totals.carbsG} target={targets.targetCarbsG} color="#fbbf24" />
          <MacroBar label="Fat" current={totals.fatG} target={targets.targetFatG} color="#f472b6" />
        </div>
      </Card>

      <Card>
        <SectionHeader icon={Search} title="Add Food" />
        <FoodSearchPicker date={date} />
      </Card>

      <Card>
        <SectionHeader icon={Camera} title="Scan a Meal (AI)" className="mb-1" />
        <p className="text-sm text-neutral-500 mb-3">Take or upload a photo and get an AI nutrition estimate you can edit before logging.</p>
        <FoodPhotoAnalyzer date={date} />
      </Card>

      {byMeal.map(({ mealType, logs: mealLogs }) => {
        const mealTotals = computeFoodLogTotals(mealLogs);
        return (
          <Card key={mealType}>
            <SectionHeader
              title={MEAL_TYPE_LABELS[mealType]}
              action={<span className="text-sm text-neutral-500">{round(mealTotals.calories)} kcal</span>}
            />
            {mealLogs.length === 0 ? (
              <EmptyState icon={Utensils} message="Nothing logged." />
            ) : (
              <ul className="flex flex-col gap-2">
                {mealLogs.map((log) => (
                  <li key={log.id} className="flex items-center justify-between text-sm">
                    <span>
                      {log.food.name}{" "}
                      <span className="text-neutral-500">
                        × {log.servings} ({round(log.food.servingSize * log.servings)}
                        {log.food.servingUnit === "g" ? "g" : ` ${log.food.servingUnit}`})
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-neutral-500">{round(log.food.calories * log.servings)} kcal</span>
                      <DeleteButton endpoint={`/api/food-logs/${log.id}`} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      })}
    </div>
  );
}
