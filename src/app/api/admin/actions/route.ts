import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { evaluateSubmission } from "@/lib/evaluator/runner";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required." }, { status: 401 });
    }

    const body = await req.json();
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    switch (action) {
      case "MARK_PAID": {
        const { teamCode, transactionId, reason } = payload;
        const team = await db.team.findUnique({ where: { teamCode } });
        if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

        await db.team.update({
          where: { teamCode },
          data: {
            paymentStatus: "CONFIRMED",
            razorpayPaymentId: transactionId || `manual_${Date.now()}`,
          },
        });

        await db.auditLog.create({
          data: {
            action: "MANUAL_PAYMENT_OVERRIDE",
            performedBy: session.name,
            details: `Manual payment confirmed for team ${team.teamName} (${team.teamCode}). Ref: ${transactionId}`,
            reason: reason || "Offline UPI / Cash receipt verification",
          },
        });

        return NextResponse.json({ success: true, message: `Team ${teamCode} marked as CONFIRMED.` });
      }

      case "TOGGLE_DISQUALIFY": {
        const { teamCode, reason } = payload;
        const team = await db.team.findUnique({ where: { teamCode } });
        if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

        const newStatus = !team.isDisqualified;
        await db.team.update({
          where: { teamCode },
          data: { isDisqualified: newStatus },
        });

        await db.auditLog.create({
          data: {
            action: newStatus ? "TEAM_DISQUALIFIED" : "TEAM_REINSTATED",
            performedBy: session.name,
            details: `Team ${team.teamName} (${team.teamCode}) status changed to ${newStatus ? "DISQUALIFIED" : "ACTIVE"}.`,
            reason: reason || "Admin discretion",
          },
        });

        return NextResponse.json({ success: true, isDisqualified: newStatus });
      }

      case "ASSIGN_DOMAIN": {
        const { teamCode, domainId, reason } = payload;
        const team = await db.team.findUnique({ where: { teamCode } });
        if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

        await db.team.update({
          where: { teamCode },
          data: { domainId },
        });

        await db.auditLog.create({
          data: {
            action: "DOMAIN_REASSIGNED",
            performedBy: session.name,
            details: `Team ${team.teamName} assigned to domain ${domainId}.`,
            reason: reason || "Track balancing",
          },
        });

        return NextResponse.json({ success: true, domainId });
      }

      case "OVERRIDE_SCORE": {
        const { teamCode, newScore, reason } = payload;
        if (!reason || !reason.trim()) {
          return NextResponse.json({ error: "A mandatory audit reason is required for score overrides." }, { status: 400 });
        }

        const team = await db.team.findUnique({ where: { teamCode } });
        if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

        const scoreVal = Number(newScore);
        await db.team.update({
          where: { teamCode },
          data: { bestScore: scoreVal },
        });

        await db.auditLog.create({
          data: {
            action: "SCORE_OVERRIDE",
            performedBy: session.name,
            details: `Score for team ${team.teamName} changed from ${team.bestScore} to ${scoreVal}.`,
            reason,
          },
        });

        return NextResponse.json({ success: true, newScore: scoreVal });
      }

      case "TOGGLE_SETTING": {
        const { key, value } = payload;
        await db.systemSetting.set(key, String(value));

        await db.auditLog.create({
          data: {
            action: "SETTING_CHANGED",
            performedBy: session.name,
            details: `System setting '${key}' updated to '${value}'.`,
          },
        });

        return NextResponse.json({ success: true, key, value });
      }

      case "ADVANCE_STAGE": {
        const { stage, livePatchMins } = payload;
        await db.systemSetting.set("active_stage", stage);

        if (stage === "STAGE_7_LIVE_PATCH") {
          const mins = Number(livePatchMins) || 20;
          const deadline = new Date(Date.now() + mins * 60 * 1000).toISOString();
          await db.systemSetting.set("live_patch_deadline", deadline);
          await db.systemSetting.set("live_patch_duration_mins", String(mins));
        }

        if (stage === "STAGE_6_FREEZE") {
          await db.systemSetting.set("leaderboard_frozen", "true");
        }

        await db.auditLog.create({
          data: {
            action: "STAGE_ADVANCED",
            performedBy: session.name,
            details: `Tournament stage advanced to ${stage}.`,
          },
        });

        return NextResponse.json({ success: true, stage });
      }

      case "BROADCAST_ANNOUNCEMENT": {
        const { title, message, type } = payload;
        if (!title || !message) {
          return NextResponse.json({ error: "Title and message are required." }, { status: 400 });
        }

        const announcement = await db.announcement.create({
          data: {
            title: title.trim(),
            message: message.trim(),
            type: type || "INFO",
            isActive: true,
          },
        });

        await db.auditLog.create({
          data: {
            action: "ANNOUNCEMENT_BROADCAST",
            performedBy: session.name,
            details: `Pushed announcement: "${title}".`,
          },
        });

        return NextResponse.json({ success: true, announcement });
      }

      case "RESCORE_SUBMISSION": {
        const { submissionId } = payload;
        const sub = await db.submission.findUnique({ where: { id: submissionId } });
        if (!sub) return NextResponse.json({ error: "Submission not found." }, { status: 404 });

        const team = await db.team.findUnique({ where: { id: sub.teamId } });
        if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

        const trackId = team.domainId || "track-ga";
        const evalResult = await evaluateSubmission(trackId, sub.codeContent);

        await db.submission.update({
          where: { id: submissionId },
          data: {
            status: evalResult.status,
            runtimeMs: evalResult.runtimeMs,
            solutionQuality: evalResult.solutionQuality,
            efficiencyScore: evalResult.efficiencyScore,
            designQuality: evalResult.designQuality,
            consistencyScore: evalResult.consistencyScore,
            autoScore: evalResult.autoScore,
            aiExplanation: evalResult.aiExplanation,
            executionLogs: evalResult.executionLogs,
          },
        });

        // Recalculate best score
        const allSubs = await db.submission.findMany({ where: { teamId: team.id } });
        const maxScore = Math.max(...allSubs.map((s) => s.autoScore), 0);
        await db.team.update({
          where: { id: team.id },
          data: { bestScore: maxScore },
        });

        await db.auditLog.create({
          data: {
            action: "MANUAL_RESCORE_TRIGGERED",
            performedBy: session.name,
            details: `Rescored submission ${submissionId} for team ${team.teamName}. New score: ${evalResult.autoScore}.`,
          },
        });

        return NextResponse.json({ success: true, autoScore: evalResult.autoScore });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Error executing admin action." }, { status: 500 });
  }
}
