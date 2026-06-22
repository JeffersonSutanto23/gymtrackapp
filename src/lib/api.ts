import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };
  }
  return { user, error: null };
}
