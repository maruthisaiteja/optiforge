import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const users = await db.user.findMany();
    const newJudgeHash = await bcrypt.hash("judge@optiforge2026", 10);
    const newAdminHash = await bcrypt.hash("admin@optiforge2026", 10);

    let updated = 0;
    for (const u of users) {
      if (u.role === "JUDGE") {
        await db.user.upsert({
          where: { username: u.username },
          update: { password: newJudgeHash },
          create: { ...u, password: newJudgeHash } as any,
        });
        updated++;
      } else if (u.role === "ADMIN") {
        await db.user.upsert({
          where: { username: u.username },
          update: { password: newAdminHash },
          create: { ...u, password: newAdminHash } as any,
        });
        updated++;
      }
    }

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
