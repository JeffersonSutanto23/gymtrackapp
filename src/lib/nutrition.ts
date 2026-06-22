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
