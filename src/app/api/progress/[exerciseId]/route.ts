import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ exerciseId: string }> }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { exerciseId } = await params;

  const sets = await prisma.workoutSet.findMany({
    where: {
      exerciseId,
      session: { userId: user!.id },
    },
    include: { session: true },
    orderBy: { session: { startedAt: "asc" } },
  });

  const bySession = new Map<string, { date: Date; maxWeight: number; volume: number }>();
  for (const set of sets) {
    const key = set.sessionId;
    const existing = bySession.get(key);
    const volume = set.reps * set.weightKg;
    if (existing) {
      existing.maxWeight = Math.max(existing.maxWeight, set.weightKg);
      existing.volume += volume;
    } else {
      bySession.set(key, { date: set.session.startedAt, maxWeight: set.weightKg, volume });
    }
  }

  const data = Array.from(bySession.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  return NextResponse.json(data);
}
