import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const profileSchema = z.object({
  goal: z.enum(["CLEAN_BULK", "BULK", "CUT", "MAINTAIN"]),
  heightCm: z.number().positive().optional().nullable(),
  targetCalories: z.number().int().positive(),
  targetProteinG: z.number().int().nonnegative(),
  targetCarbsG: z.number().int().nonnegative(),
  targetFatG: z.number().int().nonnegative(),
  age: z.number().int().positive().max(120).optional().nullable(),
  sex: z.enum(["MALE", "FEMALE"]).optional().nullable(),
  activityLevel: z.enum(["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"]).optional().nullable(),
  targetWeightKg: z.number().positive().optional().nullable(),
  targetDate: z.string().optional().nullable(),
});

export const bodyWeightSchema = z.object({
  weightKg: z.number().positive(),
  loggedAt: z.string().optional(),
  note: z.string().max(280).optional(),
});

export const workoutSessionSchema = z.object({
  title: z.string().min(1).max(120),
  startedAt: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const workoutSetSchema = z.object({
  exerciseId: z.string().min(1),
  setNumber: z.number().int().positive(),
  reps: z.number().int().positive(),
  weightKg: z.number().nonnegative(),
  rpe: z.number().min(1).max(10).optional().nullable(),
});

export const workoutSessionUpdateSchema = z.object({
  title: z.string().min(1).max(120),
});

export const workoutSetUpdateSchema = z.object({
  reps: z.number().int().positive(),
  weightKg: z.number().nonnegative(),
  rpe: z.number().min(1).max(10).optional().nullable(),
});

export const foodLogSchema = z.object({
  foodId: z.string().min(1),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  servings: z.number().positive(),
  loggedAt: z.string().optional(),
});

export const foodPhotoAnalysisSchema = z.object({
  image: z.string().min(1).max(8_000_000),
  mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

export const cardioLogSchema = z.object({
  activity: z.enum(["RUN", "TREADMILL", "BIKE", "SWIM", "WALK", "OTHER"]),
  durationMin: z.number().int().positive(),
  distanceKm: z.number().nonnegative().optional().nullable(),
  calories: z.number().int().nonnegative().optional().nullable(),
  loggedAt: z.string().optional(),
});

export const cardioLogUpdateSchema = z.object({
  activity: z.enum(["RUN", "TREADMILL", "BIKE", "SWIM", "WALK", "OTHER"]),
  durationMin: z.number().int().positive(),
  distanceKm: z.number().nonnegative().optional().nullable(),
  calories: z.number().int().nonnegative().optional().nullable(),
  loggedAt: z.string().min(1),
});

export const sleepLogSchema = z
  .object({
    bedTime: z.string().min(1),
    wakeTime: z.string().min(1),
  })
  .refine((data) => new Date(data.wakeTime) > new Date(data.bedTime), {
    message: "Wake time must be after bed time",
  });

export const waterLogSchema = z.object({
  glasses: z.number().int().positive().max(50),
  loggedAt: z.string().optional(),
});

export const waterLogUpdateSchema = z.object({
  glasses: z.number().int().positive().max(50),
  loggedAt: z.string().min(1),
});

export const customExerciseSchema = z.object({
  name: z.string().min(1).max(120),
  muscleGroup: z.enum([
    "CHEST",
    "BACK",
    "SHOULDERS",
    "BICEPS",
    "TRICEPS",
    "LEGS",
    "GLUTES",
    "CALVES",
    "CORE",
    "FULL_BODY",
    "CARDIO",
  ]),
  equipment: z.string().max(80).optional(),
  isCompound: z.boolean().optional(),
});

export const customFoodSchema = z.object({
  name: z.string().min(1).max(120),
  brand: z.string().max(80).optional(),
  category: z.string().min(1).max(60),
  servingSize: z.number().positive(),
  servingUnit: z.string().min(1).max(40),
  calories: z.number().nonnegative(),
  proteinG: z.number().nonnegative(),
  carbsG: z.number().nonnegative(),
  fatG: z.number().nonnegative(),
  fiberG: z.number().nonnegative().optional(),
  sugarG: z.number().nonnegative().optional(),
  sodiumMg: z.number().nonnegative().optional(),
});
