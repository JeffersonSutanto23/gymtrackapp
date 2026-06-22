import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { workoutSetSchema } from "@/lib/validation";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;

  const session = await prisma.workoutSession.findUnique({ where: { id } });
  if (!session || session.userId !== user!.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = workoutSetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const set = await prisma.workoutSet.create({
    data: {
      sessionId: id,
      exerciseId: parsed.data.exerciseId,
      setNumber: parsed.data.setNumber,
      reps: parsed.data.reps,
      weightKg: parsed.data.weightKg,
      rpe: parsed.data.rpe,
    },
    include: { exercise: true },
  });

  return NextResponse.json(set, { status: 201 });
}
