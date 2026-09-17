import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamCode = searchParams.get("teamCode");

    if (!teamCode) {
      return NextResponse.json({ error: "teamCode parameter is required." }, { status: 400 });
    }

    const team = await db.team.findUnique({ where: { teamCode } });
    if (!team) {
      return NextResponse.json({ error: "Team not found." }, { status: 404 });
    }

    // Determine rank
    const allTeams = await db.team.findMany({
      where: { paymentStatus: "CONFIRMED" },
      orderBy: { bestScore: "desc" },
    });
    const rankIndex = allTeams.findIndex((t) => t.teamCode === teamCode);
    const rank = rankIndex >= 0 ? rankIndex + 1 : null;

    const track = await db.problemTrack.findUnique({ where: { id: team.domainId || "track-ga" } });

    const certificateType = rank === 1 ? "EXCELLENCE" : rank && rank <= 3 ? "MERIT" : "PARTICIPATION";

    return NextResponse.json({
      teamName: team.teamName,
      teamCode: team.teamCode,
      members: team.members,
      trackName: track?.name || "Computational Intelligence Track",
      rank,
      certificateType,
      issueDate: "25th September 2026",
      organizer: "IEEE Vardhaman Student Branch",
      verificationCode: `OPT26-${team.teamCode}-${Buffer.from(team.teamName).toString("hex").slice(0, 6).toUpperCase()}`,
    });
  } catch (err) {
    return NextResponse.json({ error: "Error retrieving certificate details." }, { status: 500 });
  }
}
