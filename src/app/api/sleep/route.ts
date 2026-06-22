import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { sleepLogSchema } from "@/lib/validation";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  const logs = await prisma.sleepLog.findMany({
    where: { userId: user!.id },
    orderBy: { loggedAt: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = sleepLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const log = await prisma.sleepLog.create({
    data: {
      userId: user!.id,
      bedTime: new Date(parsed.data.bedTime),
      wakeTime: new Date(parsed.data.wakeTime),
    },
  });

  return NextResponse.json(log, { status: 201 });
}
