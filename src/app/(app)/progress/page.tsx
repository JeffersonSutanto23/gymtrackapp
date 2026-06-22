import { prisma } from "@/lib/prisma";
import { ProgressExplorer } from "@/components/ProgressExplorer";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ exerciseId?: string }>;
}) {
  const { exerciseId } = await searchParams;
  const exercises = await prisma.exercise.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-neutral-600 text-sm mt-1">Track max weight and volume per exercise over time.</p>
      </div>
      <section className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
        <ProgressExplorer exercises={exercises} initialExerciseId={exerciseId} />
      </section>
    </div>
  );
}
