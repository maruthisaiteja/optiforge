import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required." }, { status: 401 });
    }

    const teams = await db.team.findMany({ orderBy: { createdAt: "desc" } });
    const tracks = await db.problemTrack.findMany();
    const submissions = await db.submission.findMany();
    const judgeEvaluations = await db.judgeEvaluation.findMany();
    const activeStage = (await db.systemSetting.get("active_stage")) || "STAGE_3_ATTEMPT_1";

    const validTeams = teams;

    // Escape CSV cell helper
    const esc = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    // --- SHEET 1: TEAM OVERVIEW ---
    const overviewHeaders = [
      "Team Code",
      "Team Name",
      "Registration Date",
      "Team Status",
      "Payment Status",
      "Payment Amount (INR)",
      "Payment UTR / Reference ID",
      "Payment Method",
      "Assigned Theme / Domain",
      "Skill Level",
      "Best Score",
      "Final Combined Score",
      "Current Tournament Stage",
      "Attempts Used",
      "Submission Status",
      "Latest Submission ID",
      "Latest Submission Score",
      "Judge Evaluation Status",
      "Certificate Eligibility",
      "Disqualified",
      "Team Leader Name",
      "Team Leader Email",
      "Team Leader Phone",
      "Number of Team Members",
    ];

    const overviewRows = validTeams.map((t: any) => {
      const teamSubs = submissions.filter((s) => s.teamId === t.id);
      const latestSub = teamSubs.length > 0
        ? [...teamSubs].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0]
        : null;

      const teamEvals = judgeEvaluations.filter((e) => e.teamId === t.id);
      const leader = (t.members && t.members.length > 0) ? t.members[0] : null;

      const track = tracks.find((tr) => tr.id === t.domainId);
      const domainName = track ? track.name : t.domainId || "Unassigned";

      const subStatus = teamSubs.length > 0 ? "SUBMITTED" : "NO_SUBMISSION";
      const evalStatus = teamEvals.length > 0 ? "EVALUATED" : "PENDING_EVALUATION";
      const certStatus = t.paymentStatus === "CONFIRMED" ? "ELIGIBLE" : "PENDING_PAYMENT";

      return [
        esc(t.teamCode),
        esc(t.teamName),
        esc(new Date(t.createdAt).toISOString()),
        esc(t.paymentStatus === "CONFIRMED" ? "ACTIVE" : "PENDING"),
        esc(t.paymentStatus),
        esc(t.paymentAmount || 100),
        esc(t.razorpayPaymentId || "N/A"),
        esc("Online UPI"),
        esc(domainName),
        esc(t.skillLevel || "Standard"),
        esc(t.bestScore > 0 ? t.bestScore.toFixed(2) : 0),
        esc(t.finalCombinedScore ? t.finalCombinedScore.toFixed(2) : "N/A"),
        esc(activeStage),
        esc(`${t.attemptsUsed || 0} / 3`),
        esc(subStatus),
        esc(latestSub?.id || "N/A"),
        esc(latestSub ? latestSub.autoScore.toFixed(2) : "N/A"),
        esc(evalStatus),
        esc(certStatus),
        esc(t.isDisqualified ? "YES" : "NO"),
        esc(leader ? leader.name : t.teamName),
        esc(t.leaderEmail),
        esc(t.leaderPhone),
        esc(t.members?.length || 0),
      ].join(",");
    });

    // --- SHEET 2: TEAM MEMBERS ---
    const memberHeaders = [
      "Team Code",
      "Team Name",
      "Member Name",
      "Member Role",
      "College / Institution",
      "Roll Number",
      "Email Address",
      "Phone Number",
      "Branch",
      "Academic Year",
      "T-Shirt Size",
      "Registration Date",
    ];

    const memberRows: string[] = [];
    validTeams.forEach((t: any) => {
      (t.members || []).forEach((m: any, idx: number) => {
        memberRows.push(
          [
            esc(t.teamCode),
            esc(t.teamName),
            esc(m.name),
            esc(idx === 0 ? "Team Leader" : "Team Member"),
            esc(m.collegeName || "N/A"),
            esc(m.rollNumber || "N/A"),
            esc(m.email),
            esc(m.phone || "N/A"),
            esc(m.branch || "N/A"),
            esc(m.year || "N/A"),
            esc(m.tshirtSize || "N/A"),
            esc(new Date(m.createdAt || t.createdAt).toISOString()),
          ].join(",")
        );
      });
    });

    // --- SHEET 3: TEAM CREDENTIALS ---
    const credentialHeaders = [
      "Team Code",
      "Team Name",
      "Login Identifier (Leader Email)",
      "Login URL",
      "Password Status",
      "Password / Credentials",
      "Password Reset Status",
      "Account Status",
    ];

    const origin = req.headers.get("origin") || "https://optiforge-2026.vercel.app";
    const loginUrl = `${origin}/login`;

    const credentialRows = validTeams.map((t: any) => {
      let passStatus = "AWAITING_ADMIN_APPROVAL";
      let credentialNote = "Generate credentials via Admin Portal → Teams & Payments tab";

      if (t.razorpaySignature === "ADMIN_VERIFIED_APPROVED") {
        passStatus = "CREDENTIALS_GENERATED_AND_SENT";
        credentialNote = "Credentials were generated and shared with team leader";
      } else if (t.razorpaySignature === "UTR_SUBMITTED_PENDING_ADMIN_APPROVAL") {
        passStatus = "UTR_SUBMITTED_AWAITING_VERIFICATION";
        credentialNote = "Team submitted UTR — verify payment and generate credentials in Admin Portal";
      } else if (t.paymentStatus === "CONFIRMED") {
        passStatus = "PAYMENT_CONFIRMED_CREDENTIALS_PENDING";
        credentialNote = "Payment confirmed by admin — generate credentials in Admin Portal";
      }

      return [
        esc(t.teamCode),
        esc(t.teamName),
        esc(t.leaderEmail),
        esc(loginUrl),
        esc(passStatus),
        esc(credentialNote),
        esc(t.passwordResetAt ? `Reset at ${t.passwordResetAt}` : "Not reset"),
        esc(t.isDisqualified ? "DISQUALIFIED" : "ACTIVE"),
      ].join(",");
    });

    // Build consolidated CSV workbook output with sheet delimiters
    const content = [
      "==========================================================================================",
      "OPTIFORGE 2026 — CONSOLIDATED TEAM MASTER EXPORT (ADMIN SECURE)",
      `Generated At: ${new Date().toISOString()} | Exported By: ${session.name} (${session.id})`,
      "==========================================================================================",
      "",
      "--- SHEET 1: TEAM OVERVIEW ---",
      overviewHeaders.join(","),
      ...overviewRows,
      "",
      "--- SHEET 2: TEAM MEMBERS ROSTER ---",
      memberHeaders.join(","),
      ...memberRows,
      "",
      "--- SHEET 3: TEAM CREDENTIALS ---",
      credentialHeaders.join(","),
      ...credentialRows,
    ].join("\n");

    // Log export action in audit logs (WITHOUT PASSWORDS)
    await db.auditLog.create({
      data: {
        action: "TEAM_DETAILS_EXPORT",
        performedBy: `${session.name} (${session.id})`,
        details: `Exported complete master details for ${validTeams.length} teams (${memberRows.length} members). Format: Consolidated Master CSV.`,
        reason: "Admin consolidated team export",
      },
    });

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="OptiForge_2026_Complete_Team_Details_${Date.now()}.csv"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Error generating team details export." }, { status: 500 });
  }
}
