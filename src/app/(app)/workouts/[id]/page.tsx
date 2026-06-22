import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AddSetForm } from "@/components/AddSetForm";
import { DeleteButton } from "@/components/DeleteButton";
import { MUSCLE_GROUP_LABELS } from "@/lib/goals";

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
      <div className="flex items-start justify-between">
        <div>
          <Link href="/workouts" className="text-sm text-emerald-600 hover:underline">
            ← All workouts
          </Link>
          <h1 className="text-2xl font-bold mt-1">{session.title}</h1>
          <p className="text-neutral-600 text-sm">
            {new Date(session.startedAt).toLocaleString()} · {session.sets.length} sets · {Math.round(totalVolume)} kg volume
          </p>
        </div>
        <DeleteButton endpoint={`/api/workouts/${session.id}`} redirectTo="/workouts" label="Delete session" />
      </div>

      <section className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
        <h2 className="font-semibold mb-3">Add Set</h2>
        <AddSetForm sessionId={session.id} exercises={exercises} nextSetNumber={nextSetNumber} />
      </section>

      <section className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
        <h2 className="font-semibold mb-3">Sets</h2>
        {session.sets.length === 0 ? (
          <p className="text-sm text-neutral-500">No sets logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-600 border-b border-neutral-300">
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
                  <tr key={set.id} className="border-b border-neutral-100">
                    <td className="py-2 pr-2">{set.setNumber}</td>
                    <td className="py-2 pr-2">
                      <Link href={`/progress?exerciseId=${set.exerciseId}`} className="hover:text-emerald-600">
                        {set.exercise.name}
                      </Link>
                    </td>
                    <td className="py-2 pr-2 text-neutral-600">{MUSCLE_GROUP_LABELS[set.exercise.muscleGroup]}</td>
                    <td className="py-2 pr-2">{set.reps}</td>
                    <td className="py-2 pr-2">{set.weightKg} kg</td>
                    <td className="py-2 pr-2">{set.rpe ?? "—"}</td>
                    <td className="py-2 pr-2">
                      <DeleteButton endpoint={`/api/workout-sets/${set.id}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
