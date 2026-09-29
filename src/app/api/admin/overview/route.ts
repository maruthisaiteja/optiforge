import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required." }, { status: 401 });
    }

    const teams = await db.team.findMany({ orderBy: { createdAt: "desc" } });
    const tracks = await db.problemTrack.findMany();
    const submissions = await db.submission.findMany({ orderBy: { submittedAt: "desc" } });
    const announcements = await db.announcement.findMany();
    const settings = await db.systemSetting.findMany();
    const auditLogs = await db.auditLog.findMany();
    const judges = await db.user.findMany({ where: { role: "JUDGE" } });

    // Financial reconciliation
    const totalCollected = teams
      .filter((t) => t.paymentStatus === "CONFIRMED")
      .reduce((sum, t) => sum + (t.paymentAmount || 0), 0);
    const pendingCount = teams.filter((t) => t.paymentStatus === "PENDING_PAYMENT").length;
    const confirmedCount = teams.filter((t) => t.paymentStatus === "CONFIRMED").length;
    const totalParticipants = teams.reduce((sum, t) => sum + (t.members?.length || 0), 0);

    const stats = {
      totalTeams: teams.length,
      confirmedTeams: confirmedCount,
      pendingTeams: pendingCount,
      totalParticipants,
      totalCollected,
      totalSubmissions: submissions.length,
      flaggedSubmissions: submissions.filter((s) => s.similarityFlag).length,
      judgesCount: judges.length,
    };

    // Strip sensitive data from teams (never expose password hashes to frontend)
    const safeTeams = teams.map((t: any) => {
      const { password, ...safe } = t;
      return safe;
    });

    // Strip sensitive data from judges (never expose password hashes)
    const safeJudges = judges.map((j: any) => {
      const { password, ...safe } = j;
      return safe;
    });

    // Strip code content from submissions for overview (reduce payload size)
    const safeSubmissions = submissions.map((s: any) => {
      const { codeContent, ...safe } = s;
      return safe;
    });

    return NextResponse.json({
      stats,
      teams: safeTeams,
      tracks,
      submissions: safeSubmissions,
      announcements,
      settings,
      auditLogs: auditLogs.slice(0, 100),
      judges: safeJudges,
    });
  } catch (err) {
    return NextResponse.json({ error: "Error loading admin overview." }, { status: 500 });
  }
}
