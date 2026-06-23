import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { profileSchema } from "@/lib/validation";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  const profile = await prisma.profile.findUnique({ where: { userId: user!.id } });
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const { user, error } = await requireUser();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const data = {
    ...parsed.data,
    targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
  };

  const profile = await prisma.profile.upsert({
    where: { userId: user!.id },
    update: data,
    create: { userId: user!.id, ...data },
  });

  return NextResponse.json(profile);
}
