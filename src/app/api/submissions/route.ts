import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { evaluateOptiforgeSubmission } from "@/lib/evaluator/ai-evaluator";
import { computeCodeSimilarity } from "@/lib/evaluator/similarity";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// In-memory set to prevent concurrent simultaneous submissions from the same team
const activeTeamSubmissions = new Set<string>();

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedTeamId = searchParams.get("teamId");

    let queryTeamId = session.id;

    if (session.role === "TEAM") {
      // Team can only view their own submissions. Allow session.id or session.code
      if (
        requestedTeamId &&
        requestedTeamId !== session.id &&
        (!session.code || requestedTeamId.toUpperCase() !== session.code.toUpperCase())
      ) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }
      queryTeamId = requestedTeamId || session.id;
    } else if (session.role === "ADMIN" || session.role === "JUDGE") {
      queryTeamId = requestedTeamId || "";
    } else {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const submissions = await db.submission.findMany({
      where: queryTeamId ? { teamId: queryTeamId } : undefined,
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (err) {
    console.error("GET /api/submissions error:", err);
    return NextResponse.json({ error: "Error retrieving submissions." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let activeTeamId: string | null = null;
  try {
    const session = await getServerSession();
    if (!session || session.role !== "TEAM") {
      return NextResponse.json({ error: "Unauthorized: Team login required." }, { status: 401 });
    }

    let team = await db.team.findUnique({
      where: { id: session.id },
    });
    if (!team && session.code) {
      team = await db.team.findUnique({
        where: { teamCode: session.code },
      });
    }

    if (!team) {
      return NextResponse.json({ error: "Team not found." }, { status: 404 });
    }

    if (team.isDisqualified) {
      return NextResponse.json({ error: "Team has been disqualified." }, { status: 403 });
    }

    const isTestTeam =
      team.teamCode === "OPT-26-TEST" ||
      team.teamCode?.includes("TEST") ||
      team.leaderEmail === "test@optiforge.internal";

    // Concurrency protection: If another member of the same team clicked submit, block duplicate execution
    if (activeTeamSubmissions.has(team.id)) {
      return NextResponse.json(
        {
          error:
            "A submission from your team is currently being evaluated by the LoopCode Engine. Please wait a moment for results to sync.",
        },
        { status: 429 }
      );
    }

    // Rate-limiting rapid double-clicks (within 8 seconds)
    if (!isTestTeam) {
      const recentSubs = await db.submission.findMany({
        where: { teamId: team.id },
        orderBy: { submittedAt: "desc" },
      });
      if (recentSubs.length > 0) {
        const lastSubmittedMs = new Date(recentSubs[0].submittedAt).getTime();
        if (Date.now() - lastSubmittedMs < 8000) {
          return NextResponse.json(
            { error: "A submission was just recorded for your team. Please wait a few seconds before submitting again." },
            { status: 429 }
          );
        }
      }
    }

    // Acquire lock
    activeTeamSubmissions.add(team.id);
    activeTeamId = team.id;

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

    // Pre-event submission lock: Locked until Event Day (Sept 30, 2026 9:00 AM) unless test team
    const submissionsLocked = (await db.systemSetting.get("submissions_locked")) !== "false";
    if (submissionsLocked && !isTestTeam) {
      return NextResponse.json(
        {
          error:
            "Submissions are currently locked. The evaluation portal opens on Event Day (September 30, 2026 at 9:00 AM IST). You can review your problem track and prepare your repository.",
        },
        { status: 403 }
      );
    }

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

    // 1. Plagiarism & Integrity Cross-Check across all teams in the same track
    const normalizedGithubUrl = githubUrl ? githubUrl.trim().toLowerCase().replace(/\/+$/, "").replace(/\.git$/, "") : "";
    let maxSimilarity = 0;
    let plagiarismDetails = "";
    const allTrackTeams = await db.team.findMany({
      where: { domainId: trackId },
    });
    const trackTeamIds = allTrackTeams.map((t) => t.id).filter((id) => id !== team.id);

    for (const otherId of trackTeamIds) {
      const otherSubs = await db.submission.findMany({ where: { teamId: otherId } });
      for (const otherSub of otherSubs) {
        // A. Exact duplicate GitHub repository URL check
        if (normalizedGithubUrl && otherSub.githubUrl) {
          const otherNormGh = otherSub.githubUrl.trim().toLowerCase().replace(/\/+$/, "").replace(/\.git$/, "");
          if (normalizedGithubUrl === otherNormGh) {
            maxSimilarity = 100;
            plagiarismDetails = "Exact duplicate GitHub repository submitted by another registered team.";
            break;
          }
        }

        // B. Code content similarity check
        if (hasCode && otherSub.codeContent && !otherSub.codeContent.startsWith("[GitHub Repository Submission:")) {
          const sim = computeCodeSimilarity(codeContent, otherSub.codeContent);
          if (sim > maxSimilarity) {
            maxSimilarity = sim;
            if (sim >= 80) plagiarismDetails = `High code similarity (${sim}%) detected against another submission.`;
          }
        }
      }
      if (maxSimilarity === 100) break;
    }

    // 2. Fetch prior attempt scores for consistency metric
    const priorSubs = await db.submission.findMany({ where: { teamId: team.id } });
    const priorScores = priorSubs.map((s) => s.autoScore);

    // 3. Execute Autonomous LoopCode AI Evaluator Model
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

    // C. Check identical commit SHA across other teams
    if (evalResult.repoStats?.commitSha && maxSimilarity < 100) {
      for (const otherId of trackTeamIds) {
        const otherSubs = await db.submission.findMany({ where: { teamId: otherId } });
        for (const otherSub of otherSubs) {
          if (otherSub.repoStats?.commitSha && otherSub.repoStats.commitSha === evalResult.repoStats.commitSha) {
            maxSimilarity = 100;
            plagiarismDetails = "Identical Git commit hash submitted by another registered team.";
            break;
          }
        }
        if (maxSimilarity === 100) break;
      }
    }

    const isSimilarityFlagged = maxSimilarity >= 80;
    if (isSimilarityFlagged && plagiarismDetails) {
      evalResult.insights.unshift(`Integrity Alert: ${plagiarismDetails}`);
    }

    const enrichedMetricsBreakdown = {
      ...evalResult.metrics,
      sdgAlignment: evalResult.sdgAlignment,
      laggingAreas: evalResult.laggingAreas,
      improvementRoadmap: evalResult.improvementRoadmap,
    };

    const enrichedRepoStats = {
      ...evalResult.repoStats,
      sdgAlignment: evalResult.sdgAlignment,
      laggingAreas: evalResult.laggingAreas,
      improvementRoadmap: evalResult.improvementRoadmap,
    };

    // 4. Save Submission Record with Full 7-Parameter Breakdown, SDG & AI Insights
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

        // Extended Fields
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
        metricsBreakdown: enrichedMetricsBreakdown,
        repoStats: enrichedRepoStats,
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
      submission: {
        ...submission,
        sdgAlignment: evalResult.sdgAlignment,
        laggingAreas: evalResult.laggingAreas,
        improvementRoadmap: evalResult.improvementRoadmap,
      },
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
  } finally {
    if (activeTeamId) {
      activeTeamSubmissions.delete(activeTeamId);
    }
  }
}