import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { workoutSessionSchema } from "@/lib/validation";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: user!.id },
    orderBy: { startedAt: "desc" },
    include: {
      sets: {
        include: { exercise: true },
        orderBy: { setNumber: "asc" },
      },
    },
  });

  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = workoutSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const session = await prisma.workoutSession.create({
    data: {
      userId: user!.id,
      title: parsed.data.title,
      startedAt: parsed.data.startedAt ? new Date(parsed.data.startedAt) : undefined,
      notes: parsed.data.notes,
    },
  });

  return NextResponse.json(session, { status: 201 });
}
