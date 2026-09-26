import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signRegistrationToken } from "@/lib/auth";
import { generateTeamCode } from "@/lib/utils";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teamName, members, selectedProblem, chosenProblem, prefTracks, skillLevel, agreedToTerms } = body;

    if (!teamName || !teamName.trim()) {
      return NextResponse.json({ error: "Team name is required." }, { status: 400 });
    }

    if (!members || !Array.isArray(members) || members.length < 2 || members.length > 4) {
      return NextResponse.json(
        { error: "Teams must consist of strictly 2 to 4 members." },
        { status: 400 }
      );
    }

    if (!agreedToTerms) {
      return NextResponse.json(
        { error: "You must accept the event code of conduct and rules to register." },
        { status: 400 }
      );
    }

    // Validate members
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/; // Indian 10-digit mobile number

    const seenEmails = new Set<string>();

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name || !m.name.trim()) {
        return NextResponse.json({ error: `Member ${i + 1} name is required.` }, { status: 400 });
      }
      if (!m.collegeName || !m.collegeName.trim()) {
        return NextResponse.json({ error: `Member ${i + 1} college name is required.` }, { status: 400 });
      }
      if (!m.rollNumber || !m.rollNumber.trim()) {
        return NextResponse.json({ error: `Member ${i + 1} college roll number is required.` }, { status: 400 });
      }
      if (!m.email || !emailRegex.test(m.email.trim())) {
        return NextResponse.json({ error: `Member ${i + 1} email is invalid.` }, { status: 400 });
      }
      if (!m.phone || !phoneRegex.test(m.phone.trim().replace(/\D/g, ""))) {
        return NextResponse.json(
          { error: `Member ${i + 1} phone number must be a valid 10-digit Indian mobile number.` },
          { status: 400 }
        );
      }

      const lowerEmail = m.email.trim().toLowerCase();
      if (seenEmails.has(lowerEmail)) {
        return NextResponse.json(
          { error: `Duplicate email detected: ${lowerEmail} cannot be used multiple times in the same team.` },
          { status: 400 }
        );
      }
      seenEmails.add(lowerEmail);
    }

    // Check if team name already exists
    const existingTeams = await db.team.findMany();
    if (existingTeams.some((t) => t.teamName.toLowerCase() === teamName.trim().toLowerCase())) {
      return NextResponse.json(
        { error: "A team with this exact name already exists. Please choose a unique name." },
        { status: 400 }
      );
    }

    // Check if leader email already exists
    const leaderEmail = members[0].email.trim().toLowerCase();
    const leaderPhone = members[0].phone.trim();

    if (existingTeams.some((t) => t.leaderEmail.toLowerCase() === leaderEmail)) {
      return NextResponse.json(
        { error: `A team with leader email ${leaderEmail} has already registered.` },
        { status: 400 }
      );
    }

    // Generate unique Team Code
    let teamCode = generateTeamCode();
    while (existingTeams.some((t) => t.teamCode === teamCode)) {
      teamCode = generateTeamCode();
    }

    // ============================================================
    // SECURITY: Password is NOT generated yet at registration time.
    // Credentials are generated only AFTER admin verifies payment.
    // We store a placeholder hash that is unusable until approved.
    // ============================================================
    const placeholderPassword = await hashPassword(`PENDING_APPROVAL_${teamCode}_${Date.now()}`);

    // Dynamic fee: ₹100 per member (as per official event spec)
    const paymentAmount = members.length * 100;

    // Assigned innovation theme (single chosen theme, with fallback)
    const assignedDomain =
      selectedProblem || chosenProblem || (prefTracks && prefTracks.length > 0 ? prefTracks[0] : "theme-1-biomedical-ai");

    const membersList = members.map((m: any) => ({
      name: m.name.trim(),
      collegeName: m.collegeName ? m.collegeName.trim() : null,
      rollNumber: m.rollNumber.trim().toUpperCase(),
      branch: m.branch?.trim() || "CSE",
      year: m.year?.trim() || "3rd Year",
      email: m.email.trim().toLowerCase(),
      phone: m.phone.trim(),
      tshirtSize: null,
    }));

    const newTeam = await db.team.create({
      data: {
        teamCode,
        teamName: teamName.trim(),
        leaderEmail,
        leaderPhone,
        password: placeholderPassword,
        domainId: assignedDomain,
        prefTrack1: assignedDomain,
        prefTrack2: null,
        prefTrack3: null,
        prefTrack4: null,
        skillLevel: skillLevel || "Standard",
        paymentStatus: "PENDING_PAYMENT",
        paymentAmount,
        attemptsUsed: 0,
        bestScore: 0,
        isDisqualified: false,
        members: {
          create: membersList,
        },
      },
    });

    // Store a registration token (for cross-container recovery during payment page)
    const registrationPayload = {
      teamCode: newTeam.teamCode,
      teamName: newTeam.teamName,
      leaderEmail,
      leaderPhone,
      password: placeholderPassword,
      domainId: assignedDomain,
      paymentAmount: newTeam.paymentAmount,
      members: membersList,
    };

    const registrationToken = signRegistrationToken(registrationPayload);

    cookies().set("optiforge_pending_reg", registrationToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 2, // 48 hours
    });

    // Log in audit trail (no credentials exposed)
    await db.auditLog.create({
      data: {
        action: "TEAM_REGISTERED",
        performedBy: leaderEmail,
        details: `New team registered: ${newTeam.teamName} (${newTeam.teamCode}) | ${members.length} members | Domain: ${assignedDomain} | Fee: ₹${paymentAmount}. Awaiting payment submission and admin approval before credentials are issued.`,
        reason: "Team self-registration via registration portal",
      },
    });

    // ============================================================
    // IMPORTANT: We do NOT return the password to the client.
    // The team will receive their login credentials only after the
    // admin verifies their payment and approves their registration.
    // ============================================================
    return NextResponse.json({
      success: true,
      teamId: newTeam.id,
      teamCode: newTeam.teamCode,
      teamName: newTeam.teamName,
      paymentAmount: newTeam.paymentAmount,
      memberCount: members.length,
      assignedDomain,
      leaderEmail,
      registrationToken,
      // NOTE: temporaryPassword is intentionally NOT included in response
      // Credentials will be emailed by admin after payment verification
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error while registering team. Please try again." },
      { status: 500 }
    );
  }
}
