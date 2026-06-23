import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { cardioLogUpdateSchema } from "@/lib/validation";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;

  const log = await prisma.cardioLog.findUnique({ where: { id } });
  if (!log || log.userId !== user!.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = cardioLogUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.cardioLog.update({
    where: { id },
    data: {
      activity: parsed.data.activity,
      durationMin: parsed.data.durationMin,
      distanceKm: parsed.data.distanceKm ?? null,
      calories: parsed.data.calories ?? null,
      loggedAt: new Date(parsed.data.loggedAt),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;

  const log = await prisma.cardioLog.findUnique({ where: { id } });
  if (!log || log.userId !== user!.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.cardioLog.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
