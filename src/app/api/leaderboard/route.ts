import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession();
    const isFrozen = (await db.systemSetting.get("leaderboard_frozen", "false")) === "true";
    const isVisible = (await db.systemSetting.get("leaderboard_visible", "true")) === "true";

    // If hidden and not admin, return hidden response
    if (!isVisible && session?.role !== "ADMIN") {
      return NextResponse.json({
        isVisible: false,
        isFrozen,
        entries: [],
        message: "The OptiForge 2026 leaderboard will be unveiled once the challenge begins.",
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
        teamName: t.teamName, // Real team names as requested
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
      isVisible: true,
      isFrozen,
      entries,
    });
  } catch (err) {
    return NextResponse.json({ error: "Error retrieving leaderboard." }, { status: 500 });
  }
}
