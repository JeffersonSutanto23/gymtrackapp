import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NewWorkoutForm } from "@/components/NewWorkoutForm";

export default async function WorkoutsPage() {
  const user = await getCurrentUser();

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: user!.id },
    orderBy: { startedAt: "desc" },
    include: { sets: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Workouts</h1>
        <p className="text-neutral-600 text-sm mt-1">Log a new session or review past ones.</p>
      </div>

      <section className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
        <h2 className="font-semibold mb-3">New Session</h2>
        <NewWorkoutForm />
      </section>

      <section className="flex flex-col gap-2">
        {sessions.length === 0 ? (
          <p className="text-sm text-neutral-500">No workouts yet. Start your first session above.</p>
        ) : (
          sessions.map((session) => {
            const totalVolume = session.sets.reduce((sum, s) => sum + s.reps * s.weightKg, 0);
            return (
              <Link
                key={session.id}
                href={`/workouts/${session.id}`}
                className="flex items-center justify-between rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 hover:border-emerald-600/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{session.title}</p>
                  <p className="text-sm text-neutral-600">
                    {new Date(session.startedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right text-sm text-neutral-600">
                  <p>{session.sets.length} sets</p>
                  <p>{Math.round(totalVolume)} kg volume</p>
                </div>
              </Link>
            );
          })
        )}
      </section>
    </div>
  );
}
