import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const announcements = await db.announcement.findMany({
      where: { isActive: true },
    });
    return NextResponse.json({ announcements });
  } catch (err) {
    return NextResponse.json({ error: "Error retrieving announcements." }, { status: 500 });
  }
}
