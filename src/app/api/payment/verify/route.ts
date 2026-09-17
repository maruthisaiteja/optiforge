import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teamCode, utrNumber, razorpayPaymentId, razorpayOrderId, razorpaySignature, isSimulated } = body;

    if (!teamCode) {
      return NextResponse.json({ error: "Missing team code." }, { status: 400 });
    }

    const team = await db.team.findUnique({
      where: { teamCode },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found." }, { status: 404 });
    }

    // Determine reference ID: prioritize utrNumber, then fallback to razorpayPaymentId or simulated ID
    let finalPaymentId = (utrNumber || razorpayPaymentId || "").trim();

    if (!finalPaymentId && isSimulated) {
      finalPaymentId = `pay_sim_${Date.now()}`;
    }

    if (!finalPaymentId) {
      return NextResponse.json(
        { error: "Please enter your 12-digit UPI Reference / UTR Number." },
        { status: 400 }
      );
    }

    // Validate 12-digit UTR for real UPI submissions
    if (!isSimulated && !finalPaymentId.startsWith("pay_sim_")) {
      const cleanUtr = finalPaymentId.replace(/\D/g, "");
      if (cleanUtr.length !== 12) {
        return NextResponse.json(
          { error: "Invalid UTR format. Please enter the exact 12-digit UPI Reference / UTR Number from your payment details." },
          { status: 400 }
        );
      }
      finalPaymentId = cleanUtr;
    }

    // Anti-Fraud Safeguard: Check if this UTR has already been submitted by another team
    const allTeams = await db.team.findMany();
    const isDuplicate = allTeams.some(
      (t) =>
        t.teamCode !== teamCode &&
        t.paymentStatus === "CONFIRMED" &&
        t.razorpayPaymentId &&
        t.razorpayPaymentId.toLowerCase() === finalPaymentId.toLowerCase()
    );

    if (isDuplicate) {
      return NextResponse.json(
        { error: "This UPI Reference (UTR) has already been submitted by another registered team. Please check your transaction details." },
        { status: 400 }
      );
    }

    const orderId = razorpayOrderId || `order_upi_${Date.now()}`;

    // Update team payment status to CONFIRMED
    const updatedTeam = await db.team.update({
      where: { teamCode },
      data: {
        paymentStatus: "CONFIRMED",
        razorpayPaymentId: finalPaymentId,
        razorpayOrderId: orderId,
        razorpaySignature: razorpaySignature || "UPI_UTR_DIRECT",
      },
    });

    // Log in Audit trail
    await db.auditLog.create({
      data: {
        action: "PAYMENT_CONFIRMED",
        performedBy: team.leaderEmail,
        details: `UPI Payment of ₹${team.paymentAmount} verified for team ${team.teamName} (${team.teamCode}). 12-digit UTR: ${finalPaymentId}. Payee: Maruthi Sai Teja (9490298994@axl)`,
        reason: isSimulated ? "Simulated Sandbox Checkout" : "Direct UPI UTR Submission (Approach A)",
      },
    });

    // Automatically issue team session token so they can immediately access the portal
    const token = signToken({
      id: updatedTeam.id,
      role: "TEAM",
      name: updatedTeam.teamName,
      code: updatedTeam.teamCode,
      domainId: updatedTeam.domainId,
    });

    cookies().set("optiforge_session", token, {
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
      paymentId: finalPaymentId,
      receiptNumber: `RCP-VCE-${updatedTeam.teamCode}`,
      organizer: "IEEE Vardhaman Student Branch",
      payee: "Maruthi Sai Teja (9490298994@axl)",
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal error processing payment verification." }, { status: 500 });
  }
}
