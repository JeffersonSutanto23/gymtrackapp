import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { cardioLogSchema } from "@/lib/validation";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  const logs = await prisma.cardioLog.findMany({
    where: { userId: user!.id },
    orderBy: { loggedAt: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = cardioLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const log = await prisma.cardioLog.create({
    data: {
      userId: user!.id,
      activity: parsed.data.activity,
      durationMin: parsed.data.durationMin,
      distanceKm: parsed.data.distanceKm,
      calories: parsed.data.calories,
      loggedAt: parsed.data.loggedAt ? new Date(parsed.data.loggedAt) : undefined,
    },
  });

  return NextResponse.json(log, { status: 201 });
}
