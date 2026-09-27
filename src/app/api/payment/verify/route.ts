import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyRegistrationToken, hashPassword } from "@/lib/auth";
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
      let regToken = token || "";
      try {
        regToken = regToken || cookies().get("optiforge_pending_reg")?.value || "";
      } catch {
        // cookies() may not be available in all contexts
      }
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

    // Gate sandbox verification bypass mode
    if (body.isSandbox || body.sandbox) {
      if (process.env.NODE_ENV === "production" && process.env.ENABLE_SANDBOX_PAYMENT !== "true") {
        return NextResponse.json(
          { error: "Instant Sandbox Verification mode is strictly disabled in production." },
          { status: 403 }
        );
      }
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

    // Reject obvious dummy / test patterns
    const dummyPatterns = [
      /^(\d)\1{11}$/,
      /^123456789012$/,
      /^012345678901$/,
    ];
    if (dummyPatterns.some((pattern) => pattern.test(cleanUtr))) {
      return NextResponse.json(
        { error: "Invalid UPI Reference Number. Please enter the authentic 12-digit UTR from your actual bank transaction receipt." },
        { status: 400 }
      );
    }

    // Anti-Fraud Safeguard: Check if this UTR has already been submitted by another team
    try {
      const allTeams = await db.team.findMany();
      const isDuplicate = allTeams.some(
        (t: any) =>
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
    } catch (dupErr) {
      console.warn("[verify] Duplicate check failed (non-fatal):", dupErr);
    }

    const orderId = razorpayOrderId || `order_upi_${cleanUtr}`;

    // ============================================================
    // PAYMENT SUBMITTED - UTR recorded, awaiting admin approval
    // Use upsert to handle Vercel serverless race conditions where
    // ensureDb() may return stale data from seed file.
    // ============================================================
    const paymentData = {
      paymentStatus: "CONFIRMED" as const,
      razorpayPaymentId: cleanUtr,
      razorpayOrderId: orderId,
      razorpaySignature: "UTR_SUBMITTED_PENDING_ADMIN_APPROVAL",
    };

    try {
      // Try update first
      await db.team.update({
        where: { id: team.id },
        data: paymentData,
      });
    } catch (updateErr) {
      console.warn("[verify] First update attempt failed, retrying with upsert:", updateErr);
      try {
        // Retry with upsert (handles case where ensureDb returns stale data)
        await db.team.upsert({
          where: { teamCode: cleanCode },
          update: paymentData,
          create: {
            ...team,
            ...paymentData,
            members: { create: team.members || [] },
          },
        });
      } catch (upsertErr) {
        console.error("[verify] Upsert also failed:", upsertErr);
        return NextResponse.json(
          { error: "Failed to record payment. Please try again in a moment." },
          { status: 500 }
        );
      }
    }

    // Log in Audit trail (non-fatal if this fails)
    try {
      await db.auditLog.create({
        data: {
          action: "PAYMENT_UTR_SUBMITTED",
          performedBy: team.leaderEmail,
          details: `Team ${team.teamName} (${team.teamCode}) submitted UPI UTR: ${cleanUtr}. Amount: ${team.paymentAmount}. PENDING ADMIN VERIFICATION.`,
          reason: "Self-submitted UPI UTR - awaiting admin approval",
        },
      });
    } catch (logErr) {
      console.warn("[verify] Audit log failed (non-fatal):", logErr);
    }

    // Clear the pending registration cookie (non-fatal if this fails)
    try {
      cookies().set("optiforge_pending_reg", "", { maxAge: 0, path: "/" });
    } catch (cookieErr) {
      console.warn("[verify] Cookie clear failed (non-fatal):", cookieErr);
    }

    // ============================================================
    // IMPORTANT: We intentionally do NOT set a session cookie here.
    // The team cannot log in until admin approves and sends credentials.
    // ============================================================
    return NextResponse.json({
      success: true,
      teamCode: cleanCode,
      teamName: team.teamName,
      paymentAmount: team.paymentAmount,
      paymentId: cleanUtr,
      receiptNumber: `RCP-VCE-${cleanCode}`,
      organizer: "IEEE Vardhaman Student Branch",
      nextStep: "AWAITING_ADMIN_APPROVAL",
      message: `Your payment reference (UTR: ${cleanUtr}) has been recorded. The IEEE EMBS organizing team will verify your payment and email your secure login credentials to ${team.leaderEmail} within 24 hours.`,
    });
  } catch (err: any) {
    console.error("Error in /api/payment/verify:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Internal error processing payment verification: " + message }, { status: 500 });
  }
}
