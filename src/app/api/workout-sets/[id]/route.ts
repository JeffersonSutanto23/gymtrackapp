import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { workoutSetUpdateSchema } from "@/lib/validation";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;

  const set = await prisma.workoutSet.findUnique({ where: { id }, include: { session: true } });
  if (!set || set.session.userId !== user!.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = workoutSetUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.workoutSet.update({
    where: { id },
    data: {
      reps: parsed.data.reps,
      weightKg: parsed.data.weightKg,
      rpe: parsed.data.rpe ?? null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;

  const set = await prisma.workoutSet.findUnique({ where: { id }, include: { session: true } });
  if (!set || set.session.userId !== user!.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.workoutSet.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
