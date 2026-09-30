import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession, hashPassword, generateSecureTeamPassword } from "@/lib/auth";
import { generateTeamCode } from "@/lib/utils";
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

        return NextResponse.json({ success: true, teamCode, domainId });
      }

      case "ADD_TEAM": {
        const {
          teamName,
          domainId,
          venue,
          leaderName,
          leaderEmail,
          leaderPhone,
          members,
          customTeamCode,
          customPassword,
        } = payload;

        if (!teamName || !teamName.trim()) {
          return NextResponse.json({ error: "Team name is required." }, { status: 400 });
        }
        if (!leaderEmail || !leaderEmail.trim()) {
          return NextResponse.json({ error: "Leader email is required." }, { status: 400 });
        }
        if (!leaderPhone || !leaderPhone.trim()) {
          return NextResponse.json({ error: "Leader phone is required." }, { status: 400 });
        }

        const existingTeams = await db.team.findMany();
        let teamCode = (customTeamCode && customTeamCode.trim())
          ? customTeamCode.trim().toUpperCase()
          : generateTeamCode();

        if (existingTeams.some((t) => t.teamCode.toUpperCase() === teamCode.toUpperCase())) {
          if (customTeamCode) {
            return NextResponse.json({ error: `Team Code ${teamCode} already exists.` }, { status: 400 });
          }
          while (existingTeams.some((t) => t.teamCode.toUpperCase() === teamCode.toUpperCase())) {
            teamCode = generateTeamCode();
          }
        }

        const rawPass = (customPassword && customPassword.trim())
          ? customPassword.trim()
          : generateSecureTeamPassword();
        const hashedPassword = await hashPassword(rawPass);

        const assignedDomain = domainId || "theme-1-biomedical-ai";
        const assignedVenue = venue || "1011";

        const membersList = Array.isArray(members) && members.length > 0 ? members : [
          {
            name: leaderName || "Team Leader",
            rollNumber: "ROLL01",
            branch: "CSE",
            year: "3rd Year",
            email: leaderEmail.trim().toLowerCase(),
            phone: leaderPhone.trim(),
            collegeName: "Vardhaman College of Engineering",
          }
        ];

        const newTeam = await db.team.create({
          data: {
            teamCode,
            teamName: teamName.trim(),
            leaderEmail: leaderEmail.trim().toLowerCase(),
            leaderPhone: leaderPhone.trim(),
            password: hashedPassword,
            rawPassword: rawPass,
            domainId: assignedDomain,
            venue: assignedVenue,
            prefTrack1: assignedDomain,
            skillLevel: "Standard",
            paymentStatus: "CONFIRMED",
            paymentAmount: membersList.length * 100,
            razorpayPaymentId: `ADMIN_MANUAL_${Date.now()}`,
            razorpaySignature: "ADMIN_MANUAL_ONBOARD",
            attemptsUsed: 0,
            bestScore: 0,
            isDisqualified: false,
            members: {
              create: membersList.map((m: any, idx: number) => ({
                name: m.name?.trim() || (idx === 0 ? (leaderName || "Team Leader") : `Member ${idx + 1}`),
                collegeName: m.collegeName?.trim() || "Vardhaman College of Engineering",
                rollNumber: m.rollNumber?.trim().toUpperCase() || `ROLL0${idx + 1}`,
                branch: m.branch?.trim() || "CSE",
                year: m.year?.trim() || "3rd Year",
                email: m.email?.trim().toLowerCase() || (idx === 0 ? leaderEmail.trim().toLowerCase() : `member${idx + 1}_${teamCode.toLowerCase()}@vce.ac.in`),
                phone: m.phone?.trim() || leaderPhone.trim(),
                tshirtSize: null,
              })),
            },
          },
        });

        // Also add or sync User record if team login checks User table
        try {
          const userHashed = hashedPassword;
          await db.user.upsert({
            where: { username: teamCode.toLowerCase() },
            update: { password: userHashed, name: teamName.trim(), role: "TEAM" },
            create: {
              username: teamCode.toLowerCase(),
              password: userHashed,
              name: teamName.trim(),
              role: "TEAM",
              assignedDomainId: assignedDomain,
            },
          });
        } catch {}

        await db.auditLog.create({
          data: {
            action: "MANUAL_TEAM_ADDED",
            performedBy: session.name,
            details: `Manually added team "${teamName}" (${teamCode}) to track ${assignedDomain} and venue ${assignedVenue}.`,
            reason: "Admin manual registration",
          },
        });

        return NextResponse.json({
          success: true,
          team: {
            id: newTeam.id,
            teamCode: newTeam.teamCode,
            teamName: newTeam.teamName,
            domainId: newTeam.domainId,
            venue: newTeam.venue,
            password: rawPass,
          },
          message: `Team ${teamCode} (${teamName}) successfully onboarded.`,
        });
      }

      case "ASSIGN_VENUE": {
        const { teamCode, venue } = payload;
        if (!teamCode || !venue) {
          return NextResponse.json({ error: "Team code and venue (1011, 1019, 1020) are required." }, { status: 400 });
        }
        const team = await db.team.findUnique({ where: { teamCode } });
        if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

        await db.team.update({
          where: { teamCode },
          data: { venue },
        });

        await db.auditLog.create({
          data: {
            action: "VENUE_ASSIGNED",
            performedBy: session.name,
            details: `Team ${team.teamName} (${teamCode}) assigned to venue ${venue}.`,
          },
        });

        return NextResponse.json({ success: true, teamCode, venue });
      }

      case "AUTO_ASSIGN_VENUES": {
        const VENUES = ["1011", "1019", "1020"];
        const allTeams = await db.team.findMany();
        let idx = 0;
        let count = 0;
        for (const t of allTeams) {
          const v = VENUES[idx % VENUES.length];
          await db.team.update({
            where: { teamCode: t.teamCode },
            data: { venue: v },
          });
          idx++;
          count++;
        }

        await db.auditLog.create({
          data: {
            action: "AUTO_ASSIGN_VENUES",
            performedBy: session.name,
            details: `Auto-distributed ${count} teams across venues 1011, 1019, and 1020.`,
          },
        });

        return NextResponse.json({ success: true, count, message: `Successfully distributed ${count} teams across venues 1011, 1019, and 1020.` });
      }

      case "ASSIGN_JUDGE": {
        const { teamCode, judgeId } = payload;
        if (!teamCode) {
          return NextResponse.json({ error: "Team code is required." }, { status: 400 });
        }
        const team = await db.team.findUnique({ where: { teamCode } });
        if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

        await db.team.update({
          where: { teamCode },
          data: { assignedJudgeId: judgeId || null },
        });

        await db.auditLog.create({
          data: {
            action: "JUDGE_ASSIGNED",
            performedBy: session.name,
            details: `Team ${team.teamName} (${teamCode}) assigned to judge ${judgeId || "None"}.`,
          },
        });

        return NextResponse.json({ success: true, teamCode, assignedJudgeId: judgeId });
      }

      case "AUTO_ASSIGN_JUDGES": {
        const allUsers = await db.user.findMany({ where: { role: "JUDGE" } });
        const judges = allUsers.filter((u: any) => u.username.startsWith("judge"));
        if (judges.length === 0) {
          return NextResponse.json({ error: "No judges found to distribute." }, { status: 400 });
        }
        const allTeams = await db.team.findMany();
        let jIdx = 0;
        let count = 0;
        for (const t of allTeams) {
          const targetJudge = judges[jIdx % judges.length];
          await db.team.update({
            where: { teamCode: t.teamCode },
            data: { assignedJudgeId: targetJudge.id },
          });
          jIdx++;
          count++;
        }

        await db.auditLog.create({
          data: {
            action: "AUTO_ASSIGN_JUDGES",
            performedBy: session.name,
            details: `Auto-distributed ${count} teams across ${judges.length} judges.`,
          },
        });

        return NextResponse.json({ success: true, count, judgesCount: judges.length, message: `Successfully distributed ${count} teams across ${judges.length} judges.` });
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

        // Generate non-predictable high-entropy secure password
        const rawPassword = team.rawPassword && !team.rawPassword.startsWith(`Forge#${teamCode.split("-")[2] || "2026"}`)
          ? team.rawPassword
          : generateSecureTeamPassword();
        const hashedPassword = await hashPassword(rawPassword);

        // Update: store real password hash + rawPassword + mark as approved
        try {
          await db.team.update({
            where: { teamCode },
            data: {
              password: hashedPassword,
              rawPassword,
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
                rawPassword,
                paymentStatus: "CONFIRMED" as const,
                razorpaySignature: "ADMIN_VERIFIED_APPROVED",
              },
              create: { ...team, password: hashedPassword, rawPassword, paymentStatus: "CONFIRMED" as const, razorpaySignature: "ADMIN_VERIFIED_APPROVED", members: { create: team.members || [] } },
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
              details: `Secure credentials generated for team ${team.teamName} (${teamCode}). UTR: ${team.razorpayPaymentId}. Admin note: ${adminNote || "None"}`,
              reason: "Admin verified UPI payment and generated secure team login credentials",
            },
          });
        } catch {}

        return NextResponse.json({
          success: true,
          loginUsername: teamCode,
          loginPassword: rawPassword,
          leaderEmail: team.leaderEmail,
          teamName: team.teamName,
          message: `Secure credentials generated for ${team.teamName}. Credentials can be dispatched via email.`,
        });
      }

      case "REGENERATE_TEAM_PASSWORD": {
        const { teamCode } = payload;
        if (!teamCode) {
          return NextResponse.json({ error: "Team code is required." }, { status: 400 });
        }

        const team = await db.team.findUnique({ where: { teamCode } });
        if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

        const newRawPassword = generateSecureTeamPassword();
        const hashedPassword = await hashPassword(newRawPassword);

        await db.team.update({
          where: { teamCode },
          data: {
            password: hashedPassword,
            rawPassword: newRawPassword,
          },
        });

        await db.auditLog.create({
          data: {
            action: "PASSWORD_REGENERATED",
            performedBy: session.name || "Admin",
            details: `Regenerated secure password for team ${team.teamName} (${teamCode}).`,
          },
        });

        return NextResponse.json({
          success: true,
          teamCode,
          teamName: team.teamName,
          loginPassword: newRawPassword,
          message: `New secure password generated for ${team.teamName}: ${newRawPassword}`,
        });
      }

      case "REGENERATE_ALL_PASSWORDS": {
        const allTeams = await db.team.findMany();
        let count = 0;

        for (const t of allTeams) {
          if (t.teamCode === "OPT-26-TEST") continue;
          const newRaw = generateSecureTeamPassword();
          const newHash = await hashPassword(newRaw);
          await db.team.update({
            where: { id: t.id },
            data: {
              password: newHash,
              rawPassword: newRaw,
            },
          });
          count++;
        }

        await db.auditLog.create({
          data: {
            action: "ALL_PASSWORDS_REGENERATED",
            performedBy: session.name || "Admin",
            details: `Regenerated secure non-predictable passwords for ${count} teams.`,
          },
        });

        return NextResponse.json({
          success: true,
          count,
          message: `Successfully regenerated secure passwords for all ${count} teams.`,
        });
      }

      case "SET_SUBMISSIONS_LOCK": {
        const { locked } = payload;
        const lockVal = locked ? "true" : "false";
        await db.systemSetting.set("submissions_locked", lockVal);

        await db.auditLog.create({
          data: {
            action: locked ? "SUBMISSIONS_LOCKED" : "SUBMISSIONS_UNLOCKED",
            performedBy: session.name || "Admin",
            details: `Admin ${locked ? "locked" : "unlocked"} team submissions portal.`,
          },
        });

        return NextResponse.json({
          success: true,
          locked: Boolean(locked),
          message: `Team submissions portal is now ${locked ? "LOCKED" : "UNLOCKED"}.`,
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Error executing admin action." }, { status: 500 });
  }
}
