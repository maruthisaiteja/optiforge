import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { sendTeamCredentialsEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin privileges required." }, { status: 401 });
    }

    const body = await req.json();
    const { teamCode, broadcastAll } = body;

    if (!teamCode && !broadcastAll) {
      return NextResponse.json(
        { error: "Please specify teamCode or set broadcastAll: true" },
        { status: 400 }
      );
    }

    const allTeams = await db.team.findMany();

    let targetTeams = [];
    if (broadcastAll) {
      // Broadcast to all confirmed teams
      targetTeams = allTeams.filter((t) => t.paymentStatus === "CONFIRMED");
    } else {
      const found = allTeams.find((t) => t.teamCode === teamCode);
      if (!found) {
        return NextResponse.json({ error: `Team ${teamCode} not found.` }, { status: 404 });
      }
      targetTeams = [found];
    }

    if (targetTeams.length === 0) {
      return NextResponse.json(
        { error: "No confirmed teams found to send credentials email." },
        { status: 400 }
      );
    }

    const results = [];
    let sentCount = 0;
    let failCount = 0;

    for (const team of targetTeams) {
      const isApproved = team.paymentStatus === "CONFIRMED";
      const rawPass = team.rawPassword || (isApproved ? `Forge#${team.teamCode?.split("-")[2] || "2026"}` : "PENDING_APPROVAL");

      const emailResult = await sendTeamCredentialsEmail({
        teamCode: team.teamCode,
        teamName: team.teamName,
        leaderEmail: team.leaderEmail,
        domainId: team.domainId,
        rawPassword: rawPass,
        members: team.members || [],
      });

      if (emailResult.success) {
        sentCount++;
      } else {
        failCount++;
      }

      results.push({
        teamCode: team.teamCode,
        teamName: team.teamName,
        recipients: emailResult.recipients,
        success: emailResult.success,
        error: emailResult.error || null,
      });

      // Audit log
      if (emailResult.success) {
        try {
          await db.auditLog.create({
            data: {
              action: "EMAIL_CREDENTIALS_DISPATCHED",
              performedBy: session.name || "Admin",
              details: `Registration credentials dispatched to team ${team.teamName} (${team.teamCode}). Recipients: ${emailResult.recipients.join(", ")}`,
              reason: "Admin broadcast credentials email",
            },
          });
        } catch {}
      }
    }

    return NextResponse.json({
      success: sentCount > 0,
      totalTargets: targetTeams.length,
      sentCount,
      failCount,
      results,
      message: `Successfully dispatched credentials email to ${sentCount} team(s).${failCount > 0 ? ` (${failCount} failed)` : ""}`,
    });
  } catch (err: any) {
    console.error("Credentials email dispatch error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to dispatch credentials email." },
      { status: 500 }
    );
  }
}
