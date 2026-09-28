import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { evaluateOptiforgeSubmission } from "@/lib/evaluator/ai-evaluator";
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
    const {
      codeContent,
      filename,
      approachNotes,
      whatChangedNotes,
      isLivePatch,
      problemTitle,
      problemDescription,
      githubUrl,
      deployedUrl,
      mediaUrl,
      trackId: customTrackId,
    } = body;

    const hasCode = Boolean(codeContent && codeContent.trim());
    const hasGithub = Boolean(githubUrl && githubUrl.trim());

    if (!hasCode && !hasGithub) {
      return NextResponse.json(
        { error: "Please provide either source code / notebook content OR a public GitHub repository link." },
        { status: 400 }
      );
    }

    let currentAttempt: number;

    const isTestTeam = team.teamCode === "OPT-26-TEST" || team.teamCode?.includes("TEST") || team.leaderEmail === "test@optiforge.internal";

    if (isLivePatch) {
      // Check if team already submitted live patch
      const existingLivePatches = await db.submission.findMany({
        where: { teamId: team.id, isLivePatch: true },
      });
      if (!isTestTeam && existingLivePatches.length > 0) {
        return NextResponse.json(
          { error: "Stage 7 Live Patch already submitted. Only one live patch attempt is permitted." },
          { status: 400 }
        );
      }
      currentAttempt = isTestTeam ? team.attemptsUsed + 1 : 4;
    } else {
      // Strict 3 attempts limit enforcement (EXEMPT for test account)
      if (!isTestTeam && team.attemptsUsed >= 3) {
        return NextResponse.json(
          { error: "Maximum attempts reached (3 of 3 attempts used). Further standard submissions are locked." },
          { status: 400 }
        );
      }

      // Enforce mandatory 'what changed and why' note for Attempt 2 and Attempt 3 (optional for test account)
      if (!isTestTeam && team.attemptsUsed >= 1 && (!whatChangedNotes || !whatChangedNotes.trim())) {
        return NextResponse.json(
          { error: "A mandatory 'What changed and why' reflection note is required for Attempt 2 and Attempt 3." },
          { status: 400 }
        );
      }

      currentAttempt = team.attemptsUsed + 1;
    }

    // Strict domain locking: Regular teams are locked to team.domainId from registration.
    // Only the test sandbox account (isTestTeam) can dynamically select and switch tracks.
    const trackId = (isTestTeam && customTrackId) ? customTrackId : (team.domainId || "theme-1-biomedical-ai");

    // If test team chose a custom track, also persist it on the test team's profile
    if (isTestTeam && customTrackId && customTrackId !== team.domainId) {
      await db.team.update({
        where: { id: team.id },
        data: { domainId: customTrackId },
      });
    }

    // 1. Plagiarism / Similarity Check across submissions in same track
    let maxSimilarity = 0;
    const allTrackTeams = await db.team.findMany({
      where: { domainId: trackId },
    });
    const trackTeamIds = allTrackTeams.map((t) => t.id).filter((id) => id !== team.id);

    if (hasCode) {
      for (const otherId of trackTeamIds) {
        const otherSubs = await db.submission.findMany({ where: { teamId: otherId } });
        for (const otherSub of otherSubs) {
          if (otherSub.codeContent) {
            const sim = computeCodeSimilarity(codeContent, otherSub.codeContent);
            if (sim > maxSimilarity) maxSimilarity = sim;
          }
        }
      }
    }

    const isSimilarityFlagged = maxSimilarity >= 80;

    // 2. Fetch prior attempt scores for consistency metric
    const priorSubs = await db.submission.findMany({ where: { teamId: team.id } });
    const priorScores = priorSubs.map((s) => s.autoScore);

    // 3. Execute Autonomous Hack2Skill AI Evaluator Model
    const evalResult = await evaluateOptiforgeSubmission({
      trackId,
      problemTitle: problemTitle || "",
      problemDescription: problemDescription || "",
      codeContent: codeContent || "",
      filename: filename || (isLivePatch ? "live_patch_solution.py" : `attempt_${currentAttempt}.py`),
      githubUrl: githubUrl || "",
      deployedUrl: deployedUrl || "",
      mediaUrl: mediaUrl || "",
      approachNotes: approachNotes?.trim() || "",
      whatChangedNotes: whatChangedNotes?.trim() || "",
      attemptNumber: currentAttempt,
      priorScores,
    });

    // 4. Save Submission Record with Full 7-Parameter Breakdown & AI Insights
    const defaultFilename = isLivePatch ? "live_patch_solution.py" : `attempt_${currentAttempt}.py`;
    const submission = await db.submission.create({
      data: {
        teamId: team.id,
        trackId,
        attemptNumber: currentAttempt,
        filename: filename || defaultFilename,
        codeContent: codeContent || `[GitHub Repository Submission: ${githubUrl}]`,
        approachNotes: approachNotes?.trim() || null,
        whatChangedNotes: whatChangedNotes?.trim() || null,
        isLivePatch: Boolean(isLivePatch),
        status: evalResult.status,
        runtimeMs: evalResult.runtimeMs,
        solutionQuality: evalResult.metrics.codeQuality.score,
        efficiencyScore: evalResult.metrics.efficiency.score,
        designQuality: evalResult.metrics.problemAlignment.score,
        consistencyScore: evalResult.metrics.testing.score,
        autoScore: evalResult.overallScore,
        isAiAssisted: true,
        aiExplanation: evalResult.summary,
        executionLogs: evalResult.insights.join("\n"),
        similarityScore: maxSimilarity,
        similarityFlag: isSimilarityFlagged,

        // Hack2Skill Extended Fields
        problemTitle: problemTitle?.trim() || null,
        problemDescription: problemDescription?.trim() || null,
        githubUrl: githubUrl?.trim() || null,
        deployedUrl: deployedUrl?.trim() || null,
        mediaUrl: mediaUrl?.trim() || null,
        codeQualityScore: evalResult.metrics.codeQuality.score,
        securityScore: evalResult.metrics.security.score,
        efficiencyMetricScore: evalResult.metrics.efficiency.score,
        testingScore: evalResult.metrics.testing.score,
        accessibilityScore: evalResult.metrics.accessibility.score,
        domainTrackScore: evalResult.metrics.domainTrack.score,
        problemAlignmentScore: evalResult.metrics.problemAlignment.score,
        aiInsights: evalResult.insights,
        metricsBreakdown: evalResult.metrics,
        repoStats: evalResult.repoStats,
      },
    });

    // 5. Update Team Stats (Best Score & Attempts)
    const newBestScore = Math.max(team.bestScore, evalResult.overallScore);
    const updatedTeam = await db.team.update({
      where: { id: team.id },
      data: {
        attemptsUsed: isLivePatch ? team.attemptsUsed : currentAttempt,
        bestScore: newBestScore,
      },
    });

    // 6. Log Audit Record
    const actionLabel = isLivePatch ? "LIVE_PATCH_EVALUATED" : "SUBMISSION_EVALUATED";
    const detailsLabel = isLivePatch
      ? `Team ${team.teamName} completed Stage 7 Live Patch. Auto-Score: ${evalResult.overallScore}. Similarity: ${maxSimilarity}%.`
      : `Team ${team.teamName} completed Attempt ${currentAttempt}/3. Auto-Score: ${evalResult.overallScore}. Similarity: ${maxSimilarity}%.`;

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
      evalResult,
      attemptsRemaining: isLivePatch ? 3 - team.attemptsUsed : 3 - currentAttempt,
      teamBestScore: updatedTeam.bestScore,
    });
  } catch (error: any) {
    console.error("Submission evaluation error:", error);
    return NextResponse.json(
      { error: "Server error executing submission evaluation: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}