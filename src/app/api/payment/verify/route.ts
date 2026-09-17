import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teamCode, razorpayPaymentId, razorpayOrderId, razorpaySignature, isSimulated } = body;

    if (!teamCode) {
      return NextResponse.json({ error: "Missing team code." }, { status: 400 });
    }

    const team = await db.team.findUnique({
      where: { teamCode },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found." }, { status: 404 });
    }

    const paymentId = razorpayPaymentId || `pay_sim_${Date.now()}`;
    const orderId = razorpayOrderId || `order_sim_${Date.now()}`;

    // Update team payment status
    const updatedTeam = await db.team.update({
      where: { teamCode },
      data: {
        paymentStatus: "CONFIRMED",
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        razorpaySignature: razorpaySignature || "simulated_valid_signature",
      },
    });

    // Log in Audit trail
    await db.auditLog.create({
      data: {
        action: "PAYMENT_CONFIRMED",
        performedBy: team.leaderEmail,
        details: `Payment of ₹${team.paymentAmount} verified for team ${team.teamName} (${team.teamCode}). Payment ID: ${paymentId}`,
        reason: isSimulated ? "Simulated Sandbox Checkout" : "Razorpay Gateway Webhook",
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
      paymentId,
      receiptNumber: `RCP-VCE-${updatedTeam.teamCode}`,
      organizer: "IEEE Vardhaman Student Branch",
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal error processing payment verification." }, { status: 500 });
  }
}
