import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Official Tournament Unlock Date: 30 September 2026 at 9:00 AM IST
const UNLOCK_DATE_ISO = "2026-09-30T09:00:00+05:30";
const UNLOCK_TIMESTAMP = new Date(UNLOCK_DATE_ISO).getTime();
const UNLOCK_DATE_FORMATTED = "30 September 2026, 09:00 AM IST";

export async function GET() {
  try {
    const session = await getServerSession();
    const isFrozen = (await db.systemSetting.get("leaderboard_frozen", "false")) === "true";
    const settingVisible = (await db.systemSetting.get("leaderboard_visible", "false")) === "true";
    const activeStage = await db.systemSetting.get("active_stage", "PRE_EVENT");

    const now = Date.now();
    // Leaderboard is locked if:
    // 1. Current time is before the event date (30 Sept 2026, 9:00 AM IST)
    // 2. OR active_stage is still PRE_EVENT
    // 3. OR leaderboard_visible setting is explicitly set to false
    const isPastUnlockDate = now >= UNLOCK_TIMESTAMP;
    const isLocked = !isPastUnlockDate || activeStage === "PRE_EVENT" || !settingVisible;

    // If locked and requester is not an ADMIN, return locked response without revealing team scores
    if (isLocked && session?.role !== "ADMIN") {
      return NextResponse.json({
        isLocked: true,
        isVisible: false,
        isAdminPreview: false,
        isFrozen,
        unlockDate: UNLOCK_DATE_FORMATTED,
        unlockIso: UNLOCK_DATE_ISO,
        unlockTimestamp: UNLOCK_TIMESTAMP,
        entries: [],
        message: "The official OptiForge 2026 tournament leaderboard is locked and will be unlocked on the event date (30 September 2026 at 9:00 AM IST) when Round 1 begins.",
      });
    }

    const teams = await db.team.findMany({
      where: { paymentStatus: "CONFIRMED" },
      orderBy: { bestScore: "desc" },
    });

    const activeTeams = teams.filter((t) => !t.isDisqualified);
    const tracks = await db.problemTrack.findMany();
    const trackMap = new Map(tracks.map((tr) => [tr.id, tr.shortName]));

    const entries = activeTeams.map((t, idx) => {
      return {
        id: t.id,
        rank: idx + 1,
        teamCode: t.teamCode,
        teamName: t.teamName,
        trackName: trackMap.get(t.domainId || "") || "GA Track",
        trackId: t.domainId || "track-ga",
        attemptsUsed: t.attemptsUsed,
        bestScore: t.bestScore,
        finalJudgeScore: t.finalJudgeScore,
        finalCombinedScore: t.finalCombinedScore,
        updatedAt: t.updatedAt,
        isCurrentUserTeam: session?.code === t.teamCode,
      };
    });

    return NextResponse.json({
      isLocked,
      isVisible: true,
      isAdminPreview: isLocked && session?.role === "ADMIN",
      isFrozen,
      unlockDate: UNLOCK_DATE_FORMATTED,
      unlockIso: UNLOCK_DATE_ISO,
      unlockTimestamp: UNLOCK_TIMESTAMP,
      entries,
      teams: entries,
    });
  } catch (err) {
    return NextResponse.json({ error: "Error retrieving leaderboard." }, { status: 500 });
  }
}
