import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || (session.role !== "JUDGE" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized: Judge login required." }, { status: 401 });
    }

    const assignedTrack = session.domainId;
    const allTeams = await db.team.findMany({
      where: assignedTrack ? { domainId: assignedTrack } : undefined,
    });

    const evaluations = await db.judgeEvaluation.findMany({
      where: session.role === "JUDGE" ? { judgeId: session.id } : undefined,
    });

    // Build judging queue with final submissions
    const queue = [];
    for (const team of allTeams) {
      if (team.isDisqualified) continue;

      const subs = await db.submission.findMany({
        where: { teamId: team.id },
        orderBy: { submittedAt: "desc" },
      });

      // Prefer attempt 3 or latest attempt
      const finalSub = subs[0] || null;
      const evaluation = evaluations.find((e) => e.teamId === team.id) || null;

      queue.push({
        teamId: team.id,
        teamCode: team.teamCode,
        teamName: team.teamName, // Real team names
        trackId: team.domainId,
        trackName: team.track?.shortName || "Track",
        attemptsUsed: team.attemptsUsed,
        bestScore: team.bestScore,
        finalSubmission: finalSub,
        hasEvaluated: !!evaluation,
        evaluation,
      });
    }

    return NextResponse.json({
      judgeName: session.name,
      assignedTrack: assignedTrack || "ALL_TRACKS",
      queue,
    });
  } catch (err) {
    return NextResponse.json({ error: "Error retrieving judge queue." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || (session.role !== "JUDGE" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized: Judge login required." }, { status: 401 });
    }

    const body = await req.json();
    const { submissionId, teamId, codeQuality, algorithmicReasoning, resultInterpretation, innovation, notes } = body;

    if (!submissionId || !teamId) {
      return NextResponse.json({ error: "Submission ID and Team ID are required." }, { status: 400 });
    }

    // Clamp rubric values
    const qCode = Math.min(25, Math.max(0, Number(codeQuality) || 0));
    const qReasoning = Math.min(35, Math.max(0, Number(algorithmicReasoning) || 0));
    const qInterpretation = Math.min(20, Math.max(0, Number(resultInterpretation) || 0));
    const qInnovation = Math.min(20, Math.max(0, Number(innovation) || 0));

    const totalJudgeScore = Math.round((qCode + qReasoning + qInterpretation + qInnovation) * 10) / 10;

    // Save evaluation
    const evaluation = await db.judgeEvaluation.upsert({
      where: {
        judgeId_submissionId: {
          judgeId: session.id,
          submissionId,
        },
      },
      update: {
        codeQuality: qCode,
        algorithmicReasoning: qReasoning,
        resultInterpretation: qInterpretation,
        innovation: qInnovation,
        totalJudgeScore,
        notes: notes?.trim() || null,
      },
      create: {
        judgeId: session.id,
        submissionId,
        teamId,
        codeQuality: qCode,
        algorithmicReasoning: qReasoning,
        resultInterpretation: qInterpretation,
        innovation: qInnovation,
        totalJudgeScore,
        notes: notes?.trim() || null,
      },
    });

    // Compute average judge score for this team across all judges
    const teamEvals = await db.judgeEvaluation.findMany({ where: { teamId } });
    const avgJudgeScore =
      teamEvals.reduce((acc, ev) => acc + ev.totalJudgeScore, 0) / (teamEvals.length || 1);

    // Fetch config weights
    const weightAutoStr = await db.systemSetting.get("weight_auto", "60");
    const weightJudgeStr = await db.systemSetting.get("weight_judge", "40");
    const wAuto = (Number(weightAutoStr) || 60) / 100;
    const wJudge = (Number(weightJudgeStr) || 40) / 100;

    const team = await db.team.findUnique({ where: { id: teamId } });
    if (team) {
      const combined = Math.round((wAuto * team.bestScore + wJudge * avgJudgeScore) * 10) / 10;
      await db.team.update({
        where: { id: teamId },
        data: {
          finalJudgeScore: Math.round(avgJudgeScore * 10) / 10,
          finalCombinedScore: combined,
        },
      });
    }

    // Audit log
    await db.auditLog.create({
      data: {
        action: "JUDGE_EVALUATION_RECORDED",
        performedBy: session.name,
        details: `Judge scored team ${team?.teamName || teamId} with ${totalJudgeScore}/100.`,
      },
    });

    return NextResponse.json({
      success: true,
      evaluation,
      totalJudgeScore,
      avgJudgeScore: Math.round(avgJudgeScore * 10) / 10,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error saving evaluation." }, { status: 500 });
  }
}
