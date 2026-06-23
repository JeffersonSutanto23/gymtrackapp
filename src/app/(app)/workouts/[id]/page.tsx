import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ListChecks, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AddSetForm } from "@/components/AddSetForm";
import { AddExerciseForm } from "@/components/AddExerciseForm";
import { DeleteButton } from "@/components/DeleteButton";
import { EditSessionTitle } from "@/components/EditSessionTitle";
import { ExerciseGroup } from "@/components/ExerciseGroup";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const [session, exercises, recentSets] = await Promise.all([
    prisma.workoutSession.findUnique({
      where: { id },
      include: { sets: { include: { exercise: true }, orderBy: { setNumber: "asc" } } },
    }),
    prisma.exercise.findMany({ orderBy: { name: "asc" } }),
    prisma.workoutSet.findMany({
      where: { session: { userId: user!.id } },
      orderBy: [{ session: { startedAt: "desc" } }, { setNumber: "desc" }],
      select: { exerciseId: true, reps: true, weightKg: true },
      take: 500,
    }),
  ]);

  if (!session || session.userId !== user!.id) notFound();

  const nextSetNumber = session.sets.length + 1;
  const totalVolume = session.sets.reduce((sum, s) => sum + s.reps * s.weightKg, 0);

  const lastSetByExercise: Record<string, { reps: number; weightKg: number }> = {};
  for (const set of recentSets) {
    if (!lastSetByExercise[set.exerciseId]) {
      lastSetByExercise[set.exerciseId] = { reps: set.reps, weightKg: set.weightKg };
    }
  }

  const exerciseGroups: {
    exerciseId: string;
    exerciseName: string;
    muscleGroup: (typeof session.sets)[number]["exercise"]["muscleGroup"];
    sets: typeof session.sets;
  }[] = [];
  const groupIndexByExerciseId = new Map<string, number>();
  for (const set of session.sets) {
    const idx = groupIndexByExerciseId.get(set.exerciseId);
    if (idx === undefined) {
      groupIndexByExerciseId.set(set.exerciseId, exerciseGroups.length);
      exerciseGroups.push({
        exerciseId: set.exerciseId,
        exerciseName: set.exercise.name,
        muscleGroup: set.exercise.muscleGroup,
        sets: [set],
      });
    } else {
      exerciseGroups[idx].sets.push(set);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href="/workouts" className="flex items-center gap-1 text-sm text-emerald-600 hover:underline">
            <ChevronLeft className="h-3.5 w-3.5" /> All workouts
          </Link>
          <EditSessionTitle sessionId={session.id} title={session.title} />
          <p className="text-sm text-neutral-500">
            {new Date(session.startedAt).toLocaleString()} · {session.sets.length} sets · {Math.round(totalVolume)} kg volume
          </p>
        </div>
        <DeleteButton endpoint={`/api/workouts/${session.id}`} redirectTo="/workouts" label="Delete session" />
      </div>

      <Card>
        <SectionHeader icon={Plus} title="Add Set" />
        <AddSetForm
          sessionId={session.id}
          exercises={exercises}
          nextSetNumber={nextSetNumber}
          lastSetByExercise={lastSetByExercise}
        />
        <div className="mt-3">
          <AddExerciseForm />
        </div>
      </Card>

      <Card>
        <SectionHeader icon={ListChecks} title="Sets" />
        {exerciseGroups.length === 0 ? (
          <EmptyState icon={ListChecks} message="No sets logged yet." />
        ) : (
          <div className="flex flex-col gap-2">
            {exerciseGroups.map((group) => (
              <ExerciseGroup
                key={group.exerciseId}
                exerciseId={group.exerciseId}
                exerciseName={group.exerciseName}
                muscleGroup={group.muscleGroup}
                sets={group.sets}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
