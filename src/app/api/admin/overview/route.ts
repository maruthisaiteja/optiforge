import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

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

    // Count ALL team members across all teams
    const totalParticipants = teams.reduce((sum, t) => sum + ((t as any).members?.length || 0), 0);

    // Pending admin approval (payment submitted but not manually verified yet)
    const pendingApprovalCount = teams.filter(
      (t) =>
        t.paymentStatus === "CONFIRMED" &&
        (t as any).razorpaySignature === "UTR_SUBMITTED_PENDING_ADMIN_APPROVAL"
    ).length;

    const stats = {
      totalTeams: teams.length,
      confirmedTeams: confirmedCount,
      pendingTeams: pendingCount,
      pendingApprovalCount,
      totalParticipants,
      totalCollected,
      totalSubmissions: submissions.length,
      flaggedSubmissions: submissions.filter((s) => s.similarityFlag).length,
      judgesCount: judges.length,
    };

    return NextResponse.json({
      stats,
      teams,
      tracks,
      submissions,
      announcements,
      settings,
      auditLogs: auditLogs.slice(0, 100),
      judges,
    });
  } catch (err) {
    return NextResponse.json({ error: "Error loading admin overview." }, { status: 500 });
  }
}
