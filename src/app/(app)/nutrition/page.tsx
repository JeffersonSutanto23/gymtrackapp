import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { computeFoodLogTotals, round } from "@/lib/nutrition";
import { GOAL_PRESETS, MEAL_TYPE_LABELS } from "@/lib/goals";
import { MacroBar } from "@/components/MacroBar";
import { FoodSearchPicker } from "@/components/FoodSearchPicker";
import { FoodPhotoAnalyzer } from "@/components/FoodPhotoAnalyzer";
import { DateNav } from "@/components/DateNav";
import { DeleteButton } from "@/components/DeleteButton";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default async function NutritionPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? todayStr();
  const user = await getCurrentUser();

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Nutrition</h1>
          <p className="text-neutral-600 text-sm mt-1">Log meals and track macros for the day.</p>
        </div>
        <DateNav date={date} />
      </div>

      <section className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
        <h2 className="font-semibold mb-3">Daily Totals</h2>
        <div className="flex flex-col gap-3">
          <MacroBar label="Calories" current={totals.calories} target={targets.targetCalories} unit="kcal" color="#34d399" />
          <MacroBar label="Protein" current={totals.proteinG} target={targets.targetProteinG} color="#60a5fa" />
          <MacroBar label="Carbs" current={totals.carbsG} target={targets.targetCarbsG} color="#fbbf24" />
          <MacroBar label="Fat" current={totals.fatG} target={targets.targetFatG} color="#f472b6" />
        </div>
      </section>

      <section className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
        <h2 className="font-semibold mb-3">Add Food</h2>
        <FoodSearchPicker date={date} />
      </section>

      <section className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
        <h2 className="font-semibold mb-3">Scan a Meal (AI)</h2>
        <p className="text-sm text-neutral-600 mb-3">Take or upload a photo and get an AI nutrition estimate you can edit before logging.</p>
        <FoodPhotoAnalyzer date={date} />
      </section>

      {byMeal.map(({ mealType, logs: mealLogs }) => {
        const mealTotals = computeFoodLogTotals(mealLogs);
        return (
          <section key={mealType} className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">{MEAL_TYPE_LABELS[mealType]}</h2>
              <span className="text-sm text-neutral-600">{round(mealTotals.calories)} kcal</span>
            </div>
            {mealLogs.length === 0 ? (
              <p className="text-sm text-neutral-500">Nothing logged.</p>
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
                      <span className="text-neutral-600">{round(log.food.calories * log.servings)} kcal</span>
                      <DeleteButton endpoint={`/api/food-logs/${log.id}`} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
