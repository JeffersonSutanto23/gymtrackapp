import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { GOAL_PRESETS } from "@/lib/goals";
import { ProfileForm } from "@/components/ProfileForm";
import { BodyWeightForm } from "@/components/BodyWeightForm";
import { WeightChart } from "@/components/WeightChart";
import { DeleteButton } from "@/components/DeleteButton";
import { round } from "@/lib/nutrition";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  const [profile, weightLogs] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user!.id } }),
    prisma.bodyWeightLog.findMany({ where: { userId: user!.id }, orderBy: { loggedAt: "desc" } }),
  ]);

  const initial = profile ?? { goal: "MAINTAIN" as const, heightCm: null, ...GOAL_PRESETS.MAINTAIN };
  const chartData = [...weightLogs]
    .reverse()
    .map((log) => ({
      date: new Date(log.loggedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      weightKg: round(log.weightKg, 1),
    }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-neutral-400 text-sm mt-1">
          {user!.name} · {user!.email}
        </p>
      </div>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
        <h2 className="font-semibold mb-4">Goal & Targets</h2>
        <ProfileForm initial={initial} />
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
        <h2 className="font-semibold mb-4">Body Weight</h2>
        <BodyWeightForm />
        <div className="mt-4">
          <WeightChart data={chartData} />
        </div>
        {weightLogs.length > 0 && (
          <ul className="mt-4 flex flex-col gap-1 max-h-56 overflow-y-auto">
            {weightLogs.map((log) => (
              <li key={log.id} className="flex items-center justify-between text-sm py-1 border-b border-neutral-900">
                <span>{new Date(log.loggedAt).toLocaleString()}</span>
                <span className="flex items-center gap-3">
                  <span>{round(log.weightKg, 1)} kg</span>
                  <DeleteButton endpoint={`/api/bodyweight/${log.id}`} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
