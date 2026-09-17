import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";

export async function GET() {
  const user = await getServerSession();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
}
