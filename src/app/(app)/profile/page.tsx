import { Scale, Target, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { GOAL_PRESETS } from "@/lib/goals";
import { ProfileForm } from "@/components/ProfileForm";
import { BodyWeightForm } from "@/components/BodyWeightForm";
import { WeightChart } from "@/components/WeightChart";
import { DeleteButton } from "@/components/DeleteButton";
import { round } from "@/lib/nutrition";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";

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
      <PageHeader icon={User} title="Profile" subtitle={`${user!.name} · ${user!.email}`} />

      <Card>
        <SectionHeader icon={Target} title="Goal & Targets" />
        <ProfileForm initial={initial} />
      </Card>

      <Card>
        <SectionHeader icon={Scale} title="Body Weight" />
        <BodyWeightForm />
        <div className="mt-4">
          <WeightChart data={chartData} />
        </div>
        {weightLogs.length > 0 && (
          <ul className="mt-4 flex flex-col gap-1 max-h-56 overflow-y-auto">
            {weightLogs.map((log) => (
              <li key={log.id} className="flex items-center justify-between text-sm py-1 border-b border-neutral-100">
                <span className="text-neutral-500">{new Date(log.loggedAt).toLocaleString()}</span>
                <span className="flex items-center gap-3">
                  <span className="font-medium text-neutral-900">{round(log.weightKg, 1)} kg</span>
                  <DeleteButton endpoint={`/api/bodyweight/${log.id}`} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
