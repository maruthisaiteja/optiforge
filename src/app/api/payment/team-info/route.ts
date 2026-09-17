import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyRegistrationToken } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamCode = searchParams.get("teamCode");

    if (!teamCode) {
      return NextResponse.json({ error: "Missing teamCode parameter." }, { status: 400 });
    }

    const cleanCode = teamCode.trim().toUpperCase();
    let team = await db.team.findUnique({
      where: { teamCode: cleanCode },
    });

    // Cross-Container Resilience: If team is not in this lambda instance yet, self-heal via signed token
    if (!team) {
      const token = searchParams.get("token") || cookies().get("optiforge_pending_reg")?.value;
      if (token) {
        const payload = verifyRegistrationToken(token);
        if (payload && payload.teamCode === cleanCode) {
          try {
            team = await db.team.create({
              data: {
                teamCode: payload.teamCode,
                teamName: payload.teamName,
                leaderEmail: payload.leaderEmail,
                leaderPhone: payload.leaderPhone,
                password: payload.password,
                domainId: payload.domainId,
                skillLevel: "Standard",
                paymentStatus: "PENDING_PAYMENT",
                paymentAmount: payload.paymentAmount,
                attemptsUsed: 0,
                bestScore: 0,
                isDisqualified: false,
                members: {
                  create: payload.members || [],
                },
              },
            });
          } catch {
            team = await db.team.findUnique({ where: { teamCode: cleanCode } });
          }
        }
      }
    }

    if (!team) {
      return NextResponse.json(
        { error: `Team ${cleanCode} not found. Please verify your team code or complete registration first.` },
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
