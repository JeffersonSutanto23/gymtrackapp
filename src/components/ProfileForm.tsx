"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, Check, Loader2, Save } from "lucide-react";
import { GOAL_LABELS, GOAL_PRESETS } from "@/lib/goals";
import { ACTIVITY_MULTIPLIERS, calculateNutritionPlan, type ActivityLevel, type Sex } from "@/lib/nutrition";
import { BTN_PRIMARY, BTN_SECONDARY, INPUT, pillClass } from "@/lib/ui";

type Goal = keyof typeof GOAL_LABELS;

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  SEDENTARY: "Sedentary (little/no exercise)",
  LIGHT: "Light (1-3 days/week)",
  MODERATE: "Moderate (3-5 days/week)",
  ACTIVE: "Active (6-7 days/week)",
  VERY_ACTIVE: "Very active (hard exercise daily)",
};

export function ProfileForm({
  initial,
  currentWeightKg,
}: {
  initial: {
    goal: Goal;
    heightCm: number | null;
    targetCalories: number;
    targetProteinG: number;
    targetCarbsG: number;
    targetFatG: number;
    age: number | null;
    sex: Sex | null;
    activityLevel: ActivityLevel | null;
    targetWeightKg: number | null;
    targetDate: string | null;
  };
  currentWeightKg: number | null;
}) {
  const router = useRouter();
  const [goal, setGoal] = useState<Goal>(initial.goal);
  const [heightCm, setHeightCm] = useState(initial.heightCm ?? 175);
  const [targetCalories, setTargetCalories] = useState(initial.targetCalories);
  const [targetProteinG, setTargetProteinG] = useState(initial.targetProteinG);
  const [targetCarbsG, setTargetCarbsG] = useState(initial.targetCarbsG);
  const [targetFatG, setTargetFatG] = useState(initial.targetFatG);
  const [age, setAge] = useState<number | "">(initial.age ?? "");
  const [sex, setSex] = useState<Sex | "">(initial.sex ?? "");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | "">(initial.activityLevel ?? "");
  const [targetWeightKg, setTargetWeightKg] = useState<number | "">(initial.targetWeightKg ?? "");
  const [targetDate, setTargetDate] = useState(initial.targetDate ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [planSummary, setPlanSummary] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  function applyPreset(nextGoal: Goal) {
    setGoal(nextGoal);
    const preset = GOAL_PRESETS[nextGoal];
    setTargetCalories(preset.targetCalories);
    setTargetProteinG(preset.targetProteinG);
    setTargetCarbsG(preset.targetCarbsG);
    setTargetFatG(preset.targetFatG);
    setPlanSummary(null);
  }

  function calculatePlan() {
    setPlanError(null);
    setPlanSummary(null);

    if (!currentWeightKg) {
      setPlanError("Log a body weight entry below first, so we know your starting point.");
      return;
    }
    if (!age || !sex || !activityLevel || !targetWeightKg) {
      setPlanError("Fill in age, sex, activity level, and target weight first.");
      return;
    }

    let parsedTargetDate: Date | undefined;
    if (targetDate) {
      const date = new Date(targetDate);
      if (!Number.isNaN(date.getTime())) parsedTargetDate = date;
    }

    const plan = calculateNutritionPlan({
      sex,
      age,
      heightCm,
      currentWeightKg,
      activityLevel,
      targetWeightKg,
      targetDate: parsedTargetDate,
    });

    setTargetCalories(plan.targetCalories);
    setTargetProteinG(plan.targetProteinG);
    setTargetCarbsG(plan.targetCarbsG);
    setTargetFatG(plan.targetFatG);

    const direction = plan.dailyCalorieAdjustment > 0 ? "surplus" : plan.dailyCalorieAdjustment < 0 ? "deficit" : "maintenance";
    const pace =
      plan.weeklyRateKg !== 0
        ? `${Math.abs(plan.weeklyRateKg)} kg/week ${direction === "surplus" ? "gain" : "loss"} pace · ~${plan.estimatedWeeksToGoal} weeks to ${targetWeightKg} kg`
        : "already at target weight";

    let summary = `BMR ~${plan.bmr} kcal · TDEE ~${plan.tdee} kcal · ${Math.abs(plan.dailyCalorieAdjustment)} kcal/day ${direction} · ${pace}`;
    if (plan.cappedToMinimum) summary += " (capped at a safe minimum)";
    if (plan.targetDateRealistic === false) summary += " — your target date is sooner than a sustainable pace allows";

    setPlanSummary(summary);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goal,
        heightCm,
        targetCalories,
        targetProteinG,
        targetCarbsG,
        targetFatG,
        age: age === "" ? null : age,
        sex: sex === "" ? null : sex,
        activityLevel: activityLevel === "" ? null : activityLevel,
        targetWeightKg: targetWeightKg === "" ? null : targetWeightKg,
        targetDate: targetDate === "" ? null : targetDate,
      }),
    });

    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-700">Goal</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(GOAL_LABELS).map(([value, label]) => (
            <button key={value} type="button" onClick={() => applyPreset(value as Goal)} className={pillClass(goal === value)}>
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-neutral-500">Picking a goal fills in suggested targets — feel free to fine-tune below.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <NumberField label="Height (cm)" value={heightCm} onChange={setHeightCm} />
        <NumberField label="Target calories (kcal)" value={targetCalories} onChange={setTargetCalories} />
        <NumberField label="Target protein (g)" value={targetProteinG} onChange={setTargetProteinG} />
        <NumberField label="Target carbs (g)" value={targetCarbsG} onChange={setTargetCarbsG} />
        <NumberField label="Target fat (g)" value={targetFatG} onChange={setTargetFatG} />
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-4">
        <label className="text-sm font-medium text-neutral-700">Calculate targets for your goal weight</label>
        <p className="text-xs text-neutral-500">
          Uses a sustainable bulk/cut pace (~0.35%/week gain, ~0.7%/week loss of bodyweight) to set your daily
          calories — not a fixed deadline, so the numbers stay stable day to day as long as your weight does.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <OptionalNumberField label="Age" value={age} onChange={setAge} min={1} />
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Sex
            <select value={sex} onChange={(e) => setSex(e.target.value as Sex | "")} className={INPUT}>
              <option value="">Select...</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700 sm:col-span-2">
            Activity level
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as ActivityLevel | "")}
              className={INPUT}
            >
              <option value="">Select...</option>
              {Object.keys(ACTIVITY_MULTIPLIERS).map((level) => (
                <option key={level} value={level}>
                  {ACTIVITY_LABELS[level as ActivityLevel]}
                </option>
              ))}
            </select>
          </label>
          <OptionalNumberField label="Target weight (kg)" value={targetWeightKg} onChange={setTargetWeightKg} step={0.1} />
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Target date (optional, just to check it&apos;s realistic)
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className={INPUT} />
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <button type="button" onClick={calculatePlan} className={`${BTN_SECONDARY} self-start`}>
            <Calculator className="h-4 w-4" />
            Calculate suggested targets
          </button>
          {planError && <p className="text-xs text-red-600">{planError}</p>}
          {planSummary && <p className="text-xs text-emerald-600">{planSummary}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className={BTN_PRIMARY}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {loading ? "Saving..." : "Save profile"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-emerald-600">
            <Check className="h-4 w-4" /> Saved!
          </span>
        )}
      </div>
    </form>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
      {label}
      <input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value))} className={INPUT} />
    </label>
  );
}

function OptionalNumberField({
  label,
  value,
  onChange,
  min = 0,
  step,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
  min?: number;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
      {label}
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className={INPUT}
      />
    </label>
  );
}
