import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.role !== "TEAM") {
      return NextResponse.json({ error: "Unauthorized: Team login required." }, { status: 401 });
    }

    const team = await db.team.findUnique({
      where: { id: session.id },
    });

    if (!team) {
      return NextResponse.json({ error: "Team record not found." }, { status: 404 });
    }

    const activeStage = (await db.systemSetting.get("active_stage")) || "STAGE_3_ATTEMPT_1";
    const leaderboardFrozen = (await db.systemSetting.get("leaderboard_frozen")) === "true";
    const livePatchDeadline = (await db.systemSetting.get("live_patch_deadline")) || null;
    const livePatchDuration = (await db.systemSetting.get("live_patch_duration_mins")) || "20";

    const rawTrack = team.domainId
      ? await db.problemTrack.findUnique({ where: { id: team.domainId } })
      : null;

    let sanitizedTrack = null;
    if (rawTrack) {
      // Determine what confidential shifts are unlocked based on the active stage
      const showShift1 = [
        "STAGE_4_ATTEMPT_2",
        "STAGE_5_ATTEMPT_3",
        "STAGE_6_FREEZE",
        "STAGE_7_LIVE_PATCH",
        "STAGE_8_VIVA",
      ].includes(activeStage);

      const showShift2 = [
        "STAGE_5_ATTEMPT_3",
        "STAGE_6_FREEZE",
        "STAGE_7_LIVE_PATCH",
        "STAGE_8_VIVA",
      ].includes(activeStage);

      const showLivePatch = ["STAGE_7_LIVE_PATCH", "STAGE_8_VIVA"].includes(activeStage);

      sanitizedTrack = {
        id: rawTrack.id,
        name: rawTrack.name,
        shortName: rawTrack.shortName,
        society: rawTrack.society,
        difficulty: rawTrack.difficulty,
        technique: rawTrack.technique,
        context: rawTrack.context,
        coreChallenge: rawTrack.coreChallenge,
        hardConstraints: rawTrack.hardConstraints,
        optimizationObjectives: rawTrack.optimizationObjectives,
        hiddenTestNote: rawTrack.hiddenTestNote,
        expectedOutputChecklist: rawTrack.expectedOutputChecklist,
        description: rawTrack.description,
        statementMarkdown: rawTrack.statementMarkdown,
        starterNotebookUrl: rawTrack.starterNotebookUrl,
        benchmarkType: rawTrack.benchmarkType,
        // Unlocked shifts based on tournament progression
        activeShiftAttempt2: showShift1 ? rawTrack.hiddenShiftAttempt2 : null,
        activeShiftAttempt3: showShift2 ? rawTrack.hiddenShiftAttempt3 : null,
        activeLivePatchSurprise: showLivePatch ? rawTrack.livePatchSurprise : null,
      };
    }

    return NextResponse.json({
      team: {
        id: team.id,
        teamCode: team.teamCode,
        teamName: team.teamName,
        leaderEmail: team.leaderEmail,
        leaderPhone: team.leaderPhone,
        domainId: team.domainId,
        skillLevel: team.skillLevel,
        paymentStatus: team.paymentStatus,
        paymentAmount: team.paymentAmount,
        attemptsUsed: team.attemptsUsed,
        bestScore: team.bestScore,
        isDisqualified: team.isDisqualified,
        members: team.members || [],
      },
      track: sanitizedTrack,
      tournament: {
        activeStage,
        leaderboardFrozen,
        livePatchDeadline,
        livePatchDuration,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load team profile." }, { status: 500 });
  }
}