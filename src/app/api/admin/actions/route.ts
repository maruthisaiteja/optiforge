import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession, hashPassword } from "@/lib/auth";
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

        const paymentUpdateData = {
          paymentStatus: "CONFIRMED" as const,
          razorpayPaymentId: transactionId || `manual_${Date.now()}`,
        };

        try {
          await db.team.update({
            where: { id: team.id },
            data: paymentUpdateData,
          });
        } catch {
          // Fallback: upsert handles stale ensureDb() on Vercel serverless
          try {
            await db.team.upsert({
              where: { teamCode },
              update: paymentUpdateData,
              create: { ...team, ...paymentUpdateData, members: { create: team.members || [] } },
            });
          } catch (upsertErr) {
            return NextResponse.json({ error: "Failed to update payment: " + (upsertErr instanceof Error ? upsertErr.message : String(upsertErr)) }, { status: 500 });
          }
        }

        try {
          await db.auditLog.create({
            data: {
              action: "MANUAL_PAYMENT_OVERRIDE",
              performedBy: session.name,
              details: `Manual payment confirmed for team ${team.teamName} (${team.teamCode}). Ref: ${transactionId}`,
              reason: reason || "Offline UPI / Cash receipt verification",
            },
          });
        } catch {}

        return NextResponse.json({ success: true, message: `Team ${teamCode} marked as CONFIRMED.` });
      }

      case "TOGGLE_DISQUALIFY": {
        const { teamCode, reason } = payload;
        const team = await db.team.findUnique({ where: { teamCode } });
        if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

        const newStatus = !team.isDisqualified;
        try {
          await db.team.update({
            where: { id: team.id },
            data: { isDisqualified: newStatus },
          });
        } catch {
          try {
            await db.team.upsert({
              where: { teamCode },
              update: { isDisqualified: newStatus },
              create: { ...team, isDisqualified: newStatus, members: { create: team.members || [] } },
            });
          } catch {}
        }

        try {
          await db.auditLog.create({
            data: {
              action: newStatus ? "TEAM_DISQUALIFIED" : "TEAM_REINSTATED",
              performedBy: session.name,
              details: `Team ${team.teamName} (${team.teamCode}) status changed to ${newStatus ? "DISQUALIFIED" : "ACTIVE"}.`,
              reason: reason || "Admin discretion",
            },
          });
        } catch {}

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

      case "DELETE_TEAM": {
        const { teamCode, confirmCode, reason } = payload;
        if (!teamCode || !reason || !reason.trim()) {
          return NextResponse.json({ error: "Team code and deletion reason are both required." }, { status: 400 });
        }
        if (confirmCode !== teamCode) {
          return NextResponse.json({ error: "Confirmation code does not match. Please type the exact Team ID to confirm deletion." }, { status: 400 });
        }

        const team = await db.team.findUnique({ where: { teamCode } });
        if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

        // Capture pre-deletion metadata for audit (no sensitive data)
        const auditMeta = {
          teamCode: team.teamCode,
          teamName: team.teamName,
          leaderEmail: team.leaderEmail,
          membersCount: team.members?.length || 0,
          paymentStatus: team.paymentStatus,
          paymentAmount: team.paymentAmount,
          attemptsUsed: team.attemptsUsed,
          bestScore: team.bestScore,
          domainId: team.domainId,
          registeredAt: team.createdAt,
        };

        const result = await db.team.delete({ where: { teamCode } });

        await db.auditLog.create({
          data: {
            action: "TEAM_DELETED",
            performedBy: `${session.name} (${session.id})`,
            details: JSON.stringify({
              ...auditMeta,
              deletedMembersCount: result.deletedMembersCount,
              deletedSubmissionsCount: result.deletedSubmissionsCount,
              deletedEvaluationsCount: result.deletedEvaluationsCount,
              deletionTimestamp: new Date().toISOString(),
            }),
            reason: reason.trim(),
          },
        });

        return NextResponse.json({
          success: true,
          message: `Team ${teamCode} (${auditMeta.teamName}) permanently deleted.`,
          deletedMembers: result.deletedMembersCount,
          deletedSubmissions: result.deletedSubmissionsCount,
          deletedEvaluations: result.deletedEvaluationsCount,
        });
      }

      case "RESET_TEAM_PASSWORD": {
        const { teamCode, reason } = payload;
        if (!teamCode) {
          return NextResponse.json({ error: "Team code is required." }, { status: 400 });
        }

        const team = await db.team.findUnique({ where: { teamCode } });
        if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

        // Generate new temporary password
        const codeSuffix = teamCode.split("-")[2] || Math.random().toString(36).slice(2, 6);
        const tempPassword = `Forge#${codeSuffix}_${Date.now().toString(36).slice(-4)}`;
        const hashedPassword = await hashPassword(tempPassword);

        await db.team.update({
          where: { teamCode },
          data: { password: hashedPassword },
        });

        await db.auditLog.create({
          data: {
            action: "TEAM_PASSWORD_RESET",
            performedBy: `${session.name} (${session.id})`,
            details: `Password reset for team ${team.teamName} (${team.teamCode}). A new temporary password was generated.`,
            reason: reason || "Admin-initiated password reset",
          },
        });

        return NextResponse.json({
          success: true,
          teamCode,
          temporaryPassword: tempPassword,
          message: "Password has been reset. Share the temporary password securely with the team leader.",
        });
      }

      case "RESET_JUDGE_PASSWORD": {
        const { judgeUsername, reason } = payload;
        if (!judgeUsername) {
          return NextResponse.json({ error: "Judge username is required." }, { status: 400 });
        }

        const judge = await db.user.findUnique({ where: { username: judgeUsername } });
        if (!judge || judge.role !== "JUDGE") {
          return NextResponse.json({ error: "Judge account not found." }, { status: 404 });
        }

        const tempPassword = `Judge#${judgeUsername}_${Date.now().toString(36).slice(-5)}`;
        const hashedPassword = await hashPassword(tempPassword);

        await db.user.upsert({
          where: { username: judgeUsername },
          update: { password: hashedPassword },
          create: { ...judge, password: hashedPassword } as any,
        });

        await db.auditLog.create({
          data: {
            action: "JUDGE_PASSWORD_RESET",
            performedBy: `${session.name} (${session.id})`,
            details: `Password reset for judge ${judge.name} (${judgeUsername}). A new temporary password was generated.`,
            reason: reason || "Admin-initiated judge password reset",
          },
        });

        return NextResponse.json({
          success: true,
          judgeUsername,
          temporaryPassword: tempPassword,
          message: "Judge password has been reset. Share the temporary password securely.",
        });
      }

      case "APPROVE_AND_GENERATE_CREDENTIALS": {
        const { teamCode, adminNote } = payload;
        if (!teamCode) {
          return NextResponse.json({ error: "Team code is required." }, { status: 400 });
        }

        const team = await db.team.findUnique({ where: { teamCode } });
        if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

        // Generate the official Forge#XXXX password
        const codeSuffix = teamCode.split("-")[2] || "2026";
        const rawPassword = `Forge#${codeSuffix}`;
        const hashedPassword = await hashPassword(rawPassword);

        // Update: store real password hash + mark as approved
        try {
          await db.team.update({
            where: { teamCode },
            data: {
              password: hashedPassword,
              paymentStatus: "CONFIRMED" as const,
              razorpaySignature: "ADMIN_VERIFIED_APPROVED",
            },
          });
        } catch (updateErr) {
          // Fallback upsert for Vercel serverless
          try {
            await db.team.upsert({
              where: { teamCode },
              update: {
                password: hashedPassword,
                paymentStatus: "CONFIRMED" as const,
                razorpaySignature: "ADMIN_VERIFIED_APPROVED",
              },
              create: { ...team, password: hashedPassword, paymentStatus: "CONFIRMED" as const, razorpaySignature: "ADMIN_VERIFIED_APPROVED", members: { create: team.members || [] } },
            });
          } catch (upsertErr) {
            return NextResponse.json({ error: "Failed to generate credentials: " + (upsertErr instanceof Error ? upsertErr.message : String(upsertErr)) }, { status: 500 });
          }
        }

        // Audit log
        try {
          await db.auditLog.create({
            data: {
              action: "CREDENTIALS_GENERATED",
              performedBy: `${session.name} (${session.id})`,
              details: `Credentials generated for team ${team.teamName} (${teamCode}). UTR: ${team.razorpayPaymentId}. Admin note: ${adminNote || "None"}`,
              reason: "Admin verified UPI payment and generated team login credentials",
            },
          });
        } catch {}

        return NextResponse.json({
          success: true,
          loginUsername: teamCode,
          loginPassword: rawPassword,
          leaderEmail: team.leaderEmail,
          teamName: team.teamName,
          message: `Credentials generated for ${team.teamName}. Share login via email to ${team.leaderEmail}.`,
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Error executing admin action." }, { status: 500 });
  }
}
