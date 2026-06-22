import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";

export async function GET() {
  const { error } = await requireUser();
  if (error) return error;

  const exercises = await prisma.exercise.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(exercises);
}
