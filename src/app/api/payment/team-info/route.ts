import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamCode = searchParams.get("teamCode");

    if (!teamCode) {
      return NextResponse.json({ error: "Missing teamCode parameter." }, { status: 400 });
    }

    const cleanCode = teamCode.trim().toUpperCase();
    const team = await db.team.findUnique({
      where: { teamCode: cleanCode },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team not found. Please verify your team code or complete registration first." },
        { status: 404 }
      );
    }

    const track = team.domainId ? await db.problemTrack.findUnique({ where: { id: team.domainId } }) : null;

    return NextResponse.json({
      success: true,
      teamCode: team.teamCode,
      teamName: team.teamName,
      leaderEmail: team.leaderEmail,
      leaderPhone: team.leaderPhone,
      paymentAmount: team.paymentAmount || 150,
      paymentStatus: team.paymentStatus,
      razorpayPaymentId: team.razorpayPaymentId || null,
      domainId: team.domainId,
      trackName: track?.shortName || track?.name || "Computational Intelligence Challenge",
      membersCount: team.members?.length || 3,
      receiptNumber: `RCP-VCE-${team.teamCode}`,
      organizer: "IEEE Vardhaman Student Branch",
    });
  } catch (err) {
    console.error("Error in /api/payment/team-info:", err);
    return NextResponse.json({ error: "Failed to fetch team payment information." }, { status: 500 });
  }
}
