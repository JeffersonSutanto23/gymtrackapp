import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { sleepLogSchema } from "@/lib/validation";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;

  const log = await prisma.sleepLog.findUnique({ where: { id } });
  if (!log || log.userId !== user!.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = sleepLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const wakeTime = new Date(parsed.data.wakeTime);
  const updated = await prisma.sleepLog.update({
    where: { id },
    data: {
      bedTime: new Date(parsed.data.bedTime),
      wakeTime,
      loggedAt: wakeTime,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;

  const log = await prisma.sleepLog.findUnique({ where: { id } });
  if (!log || log.userId !== user!.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.sleepLog.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
