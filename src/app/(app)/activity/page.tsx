import { Activity, GlassWater, Moon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CardioForm } from "@/components/CardioForm";
import { SleepForm } from "@/components/SleepForm";
import { WaterForm } from "@/components/WaterForm";
import { CardioLogRow } from "@/components/CardioLogRow";
import { SleepLogRow } from "@/components/SleepLogRow";
import { WaterLogRow } from "@/components/WaterLogRow";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function ActivityPage() {
  const user = await getCurrentUser();
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));

  const [cardioLogs, sleepLogs, waterLogs] = await Promise.all([
    prisma.cardioLog.findMany({ where: { userId: user!.id }, orderBy: { loggedAt: "desc" }, take: 10 }),
    prisma.sleepLog.findMany({ where: { userId: user!.id }, orderBy: { loggedAt: "desc" }, take: 7 }),
    prisma.waterLog.findMany({ where: { userId: user!.id, loggedAt: { gte: startOfDay } }, orderBy: { loggedAt: "desc" } }),
  ]);

  const todayGlasses = waterLogs.reduce((sum, log) => sum + log.glasses, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={Activity} title="Activity" subtitle="Cardio, sleep, and hydration tracking." />

      <Card>
        <SectionHeader icon={Activity} title="Cardio" />
        <div className="flex flex-col gap-4">
          <CardioForm />
          {cardioLogs.length === 0 ? (
            <EmptyState icon={Activity} message="No cardio logged yet." />
          ) : (
            <ul className="flex flex-col gap-1">
              {cardioLogs.map((log) => (
                <CardioLogRow
                  key={log.id}
                  log={{
                    id: log.id,
                    activity: log.activity,
                    durationMin: log.durationMin,
                    distanceKm: log.distanceKm,
                    calories: log.calories,
                    loggedAt: log.loggedAt.toISOString(),
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <SectionHeader icon={Moon} title="Sleep" />
          <div className="flex flex-col gap-4">
            <SleepForm />
            {sleepLogs.length === 0 ? (
              <EmptyState icon={Moon} message="No sleep logged yet." />
            ) : (
              <ul className="flex flex-col gap-1">
                {sleepLogs.map((log) => (
                  <SleepLogRow
                    key={log.id}
                    log={{
                      id: log.id,
                      bedTime: log.bedTime.toISOString(),
                      wakeTime: log.wakeTime.toISOString(),
                    }}
                  />
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader icon={GlassWater} title="Water" />
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight">{todayGlasses}</span>
              <span className="text-neutral-500">glasses today</span>
            </div>
            <WaterForm />
            {waterLogs.length === 0 ? (
              <EmptyState icon={GlassWater} message="No water logged today." />
            ) : (
              <ul className="flex flex-col gap-1">
                {waterLogs.map((log) => (
                  <WaterLogRow
                    key={log.id}
                    log={{ id: log.id, glasses: log.glasses, loggedAt: log.loggedAt.toISOString() }}
                  />
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
