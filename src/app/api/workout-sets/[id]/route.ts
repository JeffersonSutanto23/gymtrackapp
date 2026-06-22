import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";

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
