import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { workoutSessionUpdateSchema } from "@/lib/validation";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;

  const session = await prisma.workoutSession.findUnique({
    where: { id },
    include: { sets: { include: { exercise: true }, orderBy: { setNumber: "asc" } } },
  });

  if (!session || session.userId !== user!.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json(session);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;

  const session = await prisma.workoutSession.findUnique({ where: { id } });
  if (!session || session.userId !== user!.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = workoutSessionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.workoutSession.update({
    where: { id },
    data: { title: parsed.data.title },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;

  const session = await prisma.workoutSession.findUnique({ where: { id } });
  if (!session || session.userId !== user!.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.workoutSession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
