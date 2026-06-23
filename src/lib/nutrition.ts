type Macro = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export function computeFoodLogTotals(
  logs: { servings: number; food: Macro }[]
): Macro {
  return logs.reduce(
    (totals, log) => ({
      calories: totals.calories + log.food.calories * log.servings,
      proteinG: totals.proteinG + log.food.proteinG * log.servings,
      carbsG: totals.carbsG + log.food.carbsG * log.servings,
      fatG: totals.fatG + log.food.fatG * log.servings,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );
}

export function round(value: number, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export const ACTIVITY_MULTIPLIERS = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
  VERY_ACTIVE: 1.9,
} as const;

export type ActivityLevel = keyof typeof ACTIVITY_MULTIPLIERS;
export type Sex = "MALE" | "FEMALE";

const KCAL_PER_KG = 7700;
const MIN_CALORIES = 1200;

export type NutritionPlanInput = {
  sex: Sex;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  activityLevel: ActivityLevel;
  targetWeightKg: number;
  targetDate: Date;
  now?: Date;
};

export type NutritionPlan = {
  bmr: number;
  tdee: number;
  daysUntilTarget: number;
  dailyCalorieAdjustment: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  cappedToMinimum: boolean;
};

export function calculateNutritionPlan(input: NutritionPlanInput): NutritionPlan {
  const { sex, age, heightCm, currentWeightKg, activityLevel, targetWeightKg, targetDate } = input;
  const now = input.now ?? new Date();

  const bmr =
    10 * currentWeightKg + 6.25 * heightCm - 5 * age + (sex === "MALE" ? 5 : -161);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];

  const daysUntilTarget = Math.max(1, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const totalKcalNeeded = (targetWeightKg - currentWeightKg) * KCAL_PER_KG;
  const dailyCalorieAdjustment = totalKcalNeeded / daysUntilTarget;

  const rawTargetCalories = tdee + dailyCalorieAdjustment;
  const targetCalories = Math.max(MIN_CALORIES, Math.round(rawTargetCalories));
  const cappedToMinimum = rawTargetCalories < MIN_CALORIES;

  const targetProteinG = Math.round(currentWeightKg * 2);
  const targetFatG = Math.round((targetCalories * 0.25) / 9);
  const targetCarbsG = Math.max(0, Math.round((targetCalories - targetProteinG * 4 - targetFatG * 9) / 4));

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    daysUntilTarget,
    dailyCalorieAdjustment: Math.round(dailyCalorieAdjustment),
    targetCalories,
    targetProteinG,
    targetCarbsG,
    targetFatG,
    cappedToMinimum,
  };
}
