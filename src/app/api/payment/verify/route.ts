import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken, verifyRegistrationToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teamCode, utrNumber, razorpayPaymentId, razorpayOrderId, token } = body;

    if (!teamCode) {
      return NextResponse.json({ error: "Missing team code." }, { status: 400 });
    }

    const cleanCode = teamCode.trim().toUpperCase();
    let team = await db.team.findUnique({
      where: { teamCode: cleanCode },
    });

    // Cross-Container Resilience: Reconstruct team if not present in this container
    if (!team) {
      const regToken = token || cookies().get("optiforge_pending_reg")?.value;
      if (regToken) {
        const payload = verifyRegistrationToken(regToken);
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

    // Extract and validate the 12-digit numeric UTR
    const rawUtr = (utrNumber || razorpayPaymentId || "").toString().trim();
    const cleanUtr = rawUtr.replace(/\D/g, "");

    if (!cleanUtr) {
      return NextResponse.json(
        { error: "Please enter your 12-digit UPI Reference / UTR Number." },
        { status: 400 }
      );
    }

    if (cleanUtr.length !== 12) {
      return NextResponse.json(
        { error: "Invalid UTR format. Please enter the exact 12-digit UPI Reference / UTR Number from your payment details." },
        { status: 400 }
      );
    }

    // Anti-Fraud Safeguard: Check if this UTR has already been submitted by another team
    const allTeams = await db.team.findMany();
    const isDuplicate = allTeams.some(
      (t) =>
        t.teamCode !== cleanCode &&
        t.paymentStatus === "CONFIRMED" &&
        t.razorpayPaymentId &&
        t.razorpayPaymentId.toLowerCase() === cleanUtr.toLowerCase()
    );

    if (isDuplicate) {
      return NextResponse.json(
        { error: "This UPI Reference (UTR) has already been submitted by another registered team. Please check your transaction details." },
        { status: 400 }
      );
    }

    const orderId = razorpayOrderId || `order_upi_${cleanUtr}`;

    // Update team payment status to CONFIRMED
    const updatedTeam = await db.team.update({
      where: { teamCode: cleanCode },
      data: {
        paymentStatus: "CONFIRMED",
        razorpayPaymentId: cleanUtr,
        razorpayOrderId: orderId,
        razorpaySignature: "UPI_DIRECT_SETTLEMENT",
      },
    });

    // Log in Audit trail
    await db.auditLog.create({
      data: {
        action: "PAYMENT_CONFIRMED",
        performedBy: team.leaderEmail,
        details: `UPI Payment of ₹${team.paymentAmount} verified for team ${team.teamName} (${team.teamCode}). 12-digit UTR: ${cleanUtr}. Payee: Maruthi Sai Teja (9490298994@axl)`,
        reason: "Direct UPI Transfer verified with 12-digit UTR",
      },
    });

    // Automatically issue team session token so they can immediately access the portal
    const sessionToken = signToken({
      id: updatedTeam.id,
      role: "TEAM",
      name: updatedTeam.teamName,
      code: updatedTeam.teamCode,
      domainId: updatedTeam.domainId,
    });

    cookies().set("optiforge_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
      teamCode: updatedTeam.teamCode,
      teamName: updatedTeam.teamName,
      paymentAmount: updatedTeam.paymentAmount,
      paymentId: cleanUtr,
      receiptNumber: `RCP-VCE-${updatedTeam.teamCode}`,
      organizer: "IEEE Vardhaman Student Branch",
      payee: "Maruthi Sai Teja (9490298994@axl)",
    });
  } catch (err) {
    console.error("Error in /api/payment/verify:", err);
    return NextResponse.json({ error: "Internal error processing payment verification." }, { status: 500 });
  }
}
