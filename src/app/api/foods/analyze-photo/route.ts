import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { foodPhotoAnalysisSchema } from "@/lib/validation";
import { analyzeFoodPhoto, AIAnalysisError } from "@/lib/ai-food";

export async function POST(req: NextRequest) {
  const { error } = await requireUser();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = foodPhotoAnalysisSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const estimate = await analyzeFoodPhoto(parsed.data.image, parsed.data.mediaType);
    return NextResponse.json(estimate);
  } catch (err) {
    if (err instanceof AIAnalysisError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Photo analysis failed." }, { status: 500 });
  }
}
