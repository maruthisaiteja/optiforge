import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
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
      return NextResponse.json({ error: "Team record not found." }, { status: 404 });
    }

    const activeStage = (await db.systemSetting.get("active_stage")) || "STAGE_3_ATTEMPT_1";
    const leaderboardFrozen = (await db.systemSetting.get("leaderboard_frozen")) === "true";
    const livePatchDeadline = (await db.systemSetting.get("live_patch_deadline")) || null;
    const livePatchDuration = (await db.systemSetting.get("live_patch_duration_mins")) || "20";
    const submissionsLocked = (await db.systemSetting.get("submissions_locked")) !== "false";

    let rawTrack = team.domainId
      ? await db.problemTrack.findUnique({ where: { id: team.domainId } })
      : null;
    if (!rawTrack) {
      rawTrack = await db.problemTrack.findUnique({ where: { id: "theme-1-biomedical-ai" } });
    }

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
        venue: team.venue || "1011",
        rawPassword: team.rawPassword || null,
        skillLevel: team.skillLevel,
        paymentStatus: team.paymentStatus,
        paymentAmount: team.paymentAmount,
        attemptsUsed: team.attemptsUsed,
        bestScore: team.bestScore,
        isDisqualified: team.isDisqualified,
        members: team.members || [],
        razorpayPaymentId: team.razorpayPaymentId || null,
        organizer: "IEEE Vardhaman Student Branch",
      },
      track: sanitizedTrack,
      tournament: {
        activeStage,
        leaderboardFrozen,
        livePatchDeadline,
        livePatchDuration,
        submissionsLocked,
      },
      auditLogs: await db.auditLog.findManyForTeam(team.teamCode || team.id),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load team profile." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
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

    const isTestTeam =
      team.teamCode === "OPT-26-TEST" ||
      team.teamCode?.includes("TEST") ||
      team.leaderEmail === "test@optiforge.internal";

    if (!isTestTeam) {
      return NextResponse.json(
        { error: "Track selection is locked upon registration for participating teams." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { domainId } = body;

    if (!domainId) {
      return NextResponse.json({ error: "domainId is required." }, { status: 400 });
    }

    await db.team.update({
      where: { id: team.id },
      data: { domainId },
    });

    return NextResponse.json({ success: true, domainId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update track." }, { status: 500 });
  }
}