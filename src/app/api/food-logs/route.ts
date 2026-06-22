import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { foodLogSchema } from "@/lib/validation";

function dayRange(dateStr: string | null) {
  const date = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function GET(req: NextRequest) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const { start, end } = dayRange(searchParams.get("date"));

  const logs = await prisma.foodLog.findMany({
    where: {
      userId: user!.id,
      loggedAt: { gte: start, lt: end },
    },
    include: { food: true },
    orderBy: { loggedAt: "asc" },
  });

  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = foodLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const log = await prisma.foodLog.create({
    data: {
      userId: user!.id,
      foodId: parsed.data.foodId,
      mealType: parsed.data.mealType,
      servings: parsed.data.servings,
      loggedAt: parsed.data.loggedAt ? new Date(parsed.data.loggedAt) : undefined,
    },
    include: { food: true },
  });

  return NextResponse.json(log, { status: 201 });
}
