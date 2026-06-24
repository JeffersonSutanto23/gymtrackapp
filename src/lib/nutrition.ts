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

// Sustainable weekly rate of bodyweight change, as a fraction of current bodyweight.
// These follow standard sports-nutrition guidance for lean bulking / safe fat loss,
// and stay CONSTANT day to day — they don't depend on how soon a target date is.
const BULK_WEEKLY_RATE_PCT = 0.0035; // ~0.35% bodyweight/week
const CUT_WEEKLY_RATE_PCT = 0.007; // ~0.7% bodyweight/week

export type NutritionPlanInput = {
  sex: Sex;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  activityLevel: ActivityLevel;
  targetWeightKg: number;
  targetDate?: Date;
  now?: Date;
};

export type NutritionPlan = {
  bmr: number;
  tdee: number;
  weeklyRateKg: number;
  dailyCalorieAdjustment: number;
  estimatedWeeksToGoal: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  cappedToMinimum: boolean;
  targetDateRealistic: boolean | null;
};

export function calculateNutritionPlan(input: NutritionPlanInput): NutritionPlan {
  const { sex, age, heightCm, currentWeightKg, activityLevel, targetWeightKg, targetDate } = input;
  const now = input.now ?? new Date();

  const bmr =
    10 * currentWeightKg + 6.25 * heightCm - 5 * age + (sex === "MALE" ? 5 : -161);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];

  const weightGapKg = targetWeightKg - currentWeightKg;
  const weeklyRateKg =
    weightGapKg === 0
      ? 0
      : Math.sign(weightGapKg) * currentWeightKg * (weightGapKg > 0 ? BULK_WEEKLY_RATE_PCT : CUT_WEEKLY_RATE_PCT);
  const dailyCalorieAdjustment = (weeklyRateKg * KCAL_PER_KG) / 7;
  const estimatedWeeksToGoal = weeklyRateKg === 0 ? 0 : Math.abs(weightGapKg / weeklyRateKg);

  let targetDateRealistic: boolean | null = null;
  if (targetDate) {
    const weeksUntilTarget = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7);
    targetDateRealistic = weeksUntilTarget >= estimatedWeeksToGoal;
  }

  const rawTargetCalories = tdee + dailyCalorieAdjustment;
  const targetCalories = Math.max(MIN_CALORIES, Math.round(rawTargetCalories));
  const cappedToMinimum = rawTargetCalories < MIN_CALORIES;

  const targetProteinG = Math.round(currentWeightKg * 2);
  const targetFatG = Math.round((targetCalories * 0.25) / 9);
  const targetCarbsG = Math.max(0, Math.round((targetCalories - targetProteinG * 4 - targetFatG * 9) / 4));

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    weeklyRateKg: Math.round(weeklyRateKg * 100) / 100,
    dailyCalorieAdjustment: Math.round(dailyCalorieAdjustment),
    estimatedWeeksToGoal: Math.round(estimatedWeeksToGoal * 10) / 10,
    targetCalories,
    targetProteinG,
    targetCarbsG,
    targetFatG,
    cappedToMinimum,
    targetDateRealistic,
  };
}
