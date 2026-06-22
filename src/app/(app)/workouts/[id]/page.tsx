import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ListChecks, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AddSetForm } from "@/components/AddSetForm";
import { DeleteButton } from "@/components/DeleteButton";
import { EditSessionTitle } from "@/components/EditSessionTitle";
import { SetRow } from "@/components/SetRow";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const [session, exercises] = await Promise.all([
    prisma.workoutSession.findUnique({
      where: { id },
      include: { sets: { include: { exercise: true }, orderBy: { setNumber: "asc" } } },
    }),
    prisma.exercise.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!session || session.userId !== user!.id) notFound();

  const nextSetNumber = session.sets.length + 1;
  const totalVolume = session.sets.reduce((sum, s) => sum + s.reps * s.weightKg, 0);

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
        <AddSetForm sessionId={session.id} exercises={exercises} nextSetNumber={nextSetNumber} />
      </Card>

      <Card>
        <SectionHeader icon={ListChecks} title="Sets" />
        {session.sets.length === 0 ? (
          <EmptyState icon={ListChecks} message="No sets logged yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-500 border-b border-neutral-200">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">Exercise</th>
                  <th className="py-2 pr-2">Muscle</th>
                  <th className="py-2 pr-2">Reps</th>
                  <th className="py-2 pr-2">Weight</th>
                  <th className="py-2 pr-2">RPE</th>
                  <th className="py-2 pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {session.sets.map((set) => (
                  <SetRow key={set.id} set={set} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
