import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { evaluateSubmission } from "@/lib/evaluator/runner";
import { computeCodeSimilarity } from "@/lib/evaluator/similarity";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetTeamId = searchParams.get("teamId") || session.id;

    // Only Admin and Judge can view other teams' submissions
    if (targetTeamId !== session.id && session.role !== "ADMIN" && session.role !== "JUDGE") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const submissions = await db.submission.findMany({
      where: { teamId: targetTeamId },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch {
    return NextResponse.json({ error: "Error retrieving submissions." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== "TEAM") {
      return NextResponse.json({ error: "Unauthorized: Team login required." }, { status: 401 });
    }

    const team = await db.team.findUnique({
      where: { id: session.id },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found." }, { status: 404 });
    }

    if (team.isDisqualified) {
      return NextResponse.json({ error: "Team has been disqualified." }, { status: 403 });
    }

    const body = await req.json();
    const { codeContent, filename, approachNotes, whatChangedNotes, isLivePatch } = body;

    if (!codeContent || !codeContent.trim()) {
      return NextResponse.json({ error: "Code content cannot be empty." }, { status: 400 });
    }

    let currentAttempt: number;

    if (isLivePatch) {
      // Check if team already submitted live patch
      const existingLivePatches = await db.submission.findMany({
        where: { teamId: team.id, isLivePatch: true },
      });
      if (existingLivePatches.length > 0) {
        return NextResponse.json(
          { error: "Stage 7 Live Patch already submitted. Only one live patch attempt is permitted." },
          { status: 400 }
        );
      }
      currentAttempt = 4;
    } else {
      // Strict 3 attempts limit enforcement
      if (team.attemptsUsed >= 3) {
        return NextResponse.json(
          { error: "Maximum attempts reached (3 of 3 attempts used). Further standard submissions are locked." },
          { status: 400 }
        );
      }

      // Enforce mandatory 'what changed and why' note for Attempt 2 and Attempt 3
      if (team.attemptsUsed >= 1 && (!whatChangedNotes || !whatChangedNotes.trim())) {
        return NextResponse.json(
          { error: "A mandatory 'What changed and why' reflection note is required for Attempt 2 and Attempt 3." },
          { status: 400 }
        );
      }

      currentAttempt = team.attemptsUsed + 1;
    }

    const trackId = team.domainId || "p1-hospital-scheduling";

    // 1. Plagiarism / Similarity Check across submissions in same track
    let maxSimilarity = 0;
    const allTrackTeams = await db.team.findMany({
      where: { domainId: trackId },
    });
    const trackTeamIds = allTrackTeams.map((t) => t.id).filter((id) => id !== team.id);

    for (const otherId of trackTeamIds) {
      const otherSubs = await db.submission.findMany({ where: { teamId: otherId } });
      for (const otherSub of otherSubs) {
        const sim = computeCodeSimilarity(codeContent, otherSub.codeContent);
        if (sim > maxSimilarity) maxSimilarity = sim;
      }
    }

    const isSimilarityFlagged = maxSimilarity >= 80;

    // 2. Fetch prior attempt scores for consistency metric
    const priorSubs = await db.submission.findMany({ where: { teamId: team.id } });
    const priorScores = priorSubs.map((s) => s.autoScore);

    // 3. Execute Sandboxed Benchmark Runner
    const evalResult = await evaluateSubmission(trackId, codeContent, priorScores);

    // 4. Save Submission
    const defaultFilename = isLivePatch ? "live_patch_solution.py" : `attempt_${currentAttempt}.py`;
    const submission = await db.submission.create({
      data: {
        teamId: team.id,
        attemptNumber: currentAttempt,
        filename: filename || defaultFilename,
        codeContent,
        approachNotes: approachNotes?.trim() || null,
        whatChangedNotes: whatChangedNotes?.trim() || null,
        isLivePatch: Boolean(isLivePatch),
        status: evalResult.status,
        runtimeMs: evalResult.runtimeMs,
        solutionQuality: evalResult.solutionQuality,
        efficiencyScore: evalResult.efficiencyScore,
        designQuality: evalResult.designQuality,
        consistencyScore: evalResult.consistencyScore,
        autoScore: evalResult.autoScore,
        isAiAssisted: evalResult.isAiAssisted,
        aiExplanation: evalResult.aiExplanation,
        executionLogs: evalResult.executionLogs,
        similarityScore: maxSimilarity,
        similarityFlag: isSimilarityFlagged,
      },
    });

    // 5. Update Team Stats
    const newBestScore = Math.max(team.bestScore, evalResult.autoScore);
    const updatedTeam = await db.team.update({
      where: { id: team.id },
      data: {
        attemptsUsed: isLivePatch ? team.attemptsUsed : currentAttempt,
        bestScore: newBestScore,
      },
    });

    // 6. Log Audit
    const actionLabel = isLivePatch ? "LIVE_PATCH_EVALUATED" : "SUBMISSION_EVALUATED";
    const detailsLabel = isLivePatch
      ? `Team ${team.teamName} completed Stage 7 Live Patch. Auto-Score: ${evalResult.autoScore}. Similarity: ${maxSimilarity}%.`
      : `Team ${team.teamName} completed Attempt ${currentAttempt}/3. Auto-Score: ${evalResult.autoScore}. Similarity: ${maxSimilarity}%.`;

    await db.auditLog.create({
      data: {
        action: actionLabel,
        performedBy: team.teamCode,
        details: detailsLabel,
      },
    });

    return NextResponse.json({
      success: true,
      submission,
      attemptsRemaining: isLivePatch ? 3 - team.attemptsUsed : 3 - currentAttempt,
      teamBestScore: updatedTeam.bestScore,
    });
  } catch {
    return NextResponse.json(
      { error: "Server error executing submission evaluation." },
      { status: 500 }
    );
  }
}