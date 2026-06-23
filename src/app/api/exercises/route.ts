import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { customExerciseSchema } from "@/lib/validation";

export async function GET() {
  const { error } = await requireUser();
  if (error) return error;

  const exercises = await prisma.exercise.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(exercises);
}

export async function POST(req: NextRequest) {
  const { error } = await requireUser();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = customExerciseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.exercise.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return NextResponse.json({ error: "An exercise with this name already exists." }, { status: 409 });
  }

  const exercise = await prisma.exercise.create({
    data: {
      name: parsed.data.name,
      muscleGroup: parsed.data.muscleGroup,
      equipment: parsed.data.equipment || undefined,
      isCompound: parsed.data.isCompound ?? false,
    },
  });

  return NextResponse.json(exercise, { status: 201 });
}
