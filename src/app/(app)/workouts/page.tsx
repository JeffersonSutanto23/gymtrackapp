import Link from "next/link";
import { Dumbbell, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getClientOffsetMinutes, formatClientDateTime } from "@/lib/timezone";
import { NewWorkoutForm } from "@/components/NewWorkoutForm";
import { DeleteButton } from "@/components/DeleteButton";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function WorkoutsPage() {
  const user = await getCurrentUser();
  const offsetMinutes = await getClientOffsetMinutes();

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: user!.id },
    orderBy: { startedAt: "desc" },
    include: { sets: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={Dumbbell} title="Workouts" subtitle="Log a new session or review past ones." />

      <Card>
        <SectionHeader icon={Plus} title="New Session" />
        <NewWorkoutForm />
      </Card>

      <Card>
        {sessions.length === 0 ? (
          <EmptyState icon={Dumbbell} message="No workouts yet. Start your first session above." />
        ) : (
          <ul className="flex flex-col gap-1">
            {sessions.map((session) => {
              const totalVolume = session.sets.reduce((sum, s) => sum + s.reps * s.weightKg, 0);
              return (
                <li key={session.id} className="flex items-center gap-2 rounded-lg transition-colors hover:bg-neutral-50">
                  <Link
                    href={`/workouts/${session.id}`}
                    className="flex min-w-0 flex-1 flex-col gap-1 px-2 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-neutral-900">{session.title}</p>
                      <p className="truncate text-sm text-neutral-500">
                        {formatClientDateTime(session.startedAt, offsetMinutes)}
                      </p>
                    </div>
                    <div className="flex gap-3 text-sm text-neutral-500 sm:shrink-0 sm:flex-col sm:gap-0 sm:text-right sm:whitespace-nowrap">
                      <p>{session.sets.length} sets</p>
                      <p>{Math.round(totalVolume)} kg volume</p>
                    </div>
                  </Link>
                  <DeleteButton endpoint={`/api/workouts/${session.id}`} />
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
