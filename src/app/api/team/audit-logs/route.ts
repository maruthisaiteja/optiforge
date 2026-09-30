import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.role !== "TEAM") {
      return NextResponse.json({ error: "Unauthorized: Team login required." }, { status: 401 });
    }

    const teamIdentifier = session.code || session.id;
    const auditLogs = await db.auditLog.findManyForTeam(teamIdentifier);

    return NextResponse.json({
      success: true,
      auditLogs,
      teamCode: session.code,
    });
  } catch (err: any) {
    console.error("GET /api/team/audit-logs error:", err);
    return NextResponse.json({ error: "Error retrieving audit logs." }, { status: 500 });
  }
}
