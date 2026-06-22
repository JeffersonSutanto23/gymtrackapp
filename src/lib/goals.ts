export const GOAL_LABELS = {
  CLEAN_BULK: "Clean Bulk",
  BULK: "Bulk",
  CUT: "Cut",
  MAINTAIN: "Maintain",
} as const;

export const GOAL_PRESETS = {
  CLEAN_BULK: { targetCalories: 2800, targetProteinG: 190, targetCarbsG: 340, targetFatG: 80 },
  BULK: { targetCalories: 3200, targetProteinG: 200, targetCarbsG: 420, targetFatG: 90 },
  CUT: { targetCalories: 2000, targetProteinG: 190, targetCarbsG: 160, targetFatG: 55 },
  MAINTAIN: { targetCalories: 2400, targetProteinG: 170, targetCarbsG: 260, targetFatG: 75 },
} as const;

export const MEAL_TYPE_LABELS = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snack",
} as const;

export const MUSCLE_GROUP_LABELS = {
  CHEST: "Chest",
  BACK: "Back",
  SHOULDERS: "Shoulders",
  BICEPS: "Biceps",
  TRICEPS: "Triceps",
  LEGS: "Legs",
  GLUTES: "Glutes",
  CALVES: "Calves",
  CORE: "Core",
  FULL_BODY: "Full Body",
  CARDIO: "Cardio",
} as const;
