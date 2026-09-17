import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { generateTeamCode } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teamName, members, prefTracks, skillLevel, agreedToTerms } = body;

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

    // Check if leader email or member email already exists
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

    // Auto-generate secure password for team
    const rawPassword = `Forge#${teamCode.split("-")[2]}`;
    const hashedPassword = await hashPassword(rawPassword);

    // Dynamic fee: ₹50 per member
    const paymentAmount = members.length * 50;

    // Preferred domain
    const assignedDomain = prefTracks && prefTracks.length > 0 ? prefTracks[0] : "track-ga";

    const newTeam = await db.team.create({
      data: {
        teamCode,
        teamName: teamName.trim(),
        leaderEmail,
        leaderPhone,
        password: hashedPassword,
        domainId: assignedDomain,
        prefTrack1: prefTracks?.[0] || "track-ga",
        prefTrack2: prefTracks?.[1] || "track-pso",
        prefTrack3: prefTracks?.[2] || "track-aco",
        prefTrack4: prefTracks?.[3] || "track-fuzzy",
        skillLevel: skillLevel || "Intermediate",
        paymentStatus: "PENDING_PAYMENT",
        paymentAmount,
        attemptsUsed: 0,
        bestScore: 0,
        isDisqualified: false,
        members: {
          create: members.map((m: any) => ({
            name: m.name.trim(),
            rollNumber: m.rollNumber.trim().toUpperCase(),
            branch: m.branch?.trim() || "CSE/IT",
            year: m.year?.trim() || "3rd Year",
            email: m.email.trim().toLowerCase(),
            phone: m.phone.trim(),
            tshirtSize: m.tshirtSize || "M",
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      teamId: newTeam.id,
      teamCode: newTeam.teamCode,
      teamName: newTeam.teamName,
      paymentAmount: newTeam.paymentAmount,
      memberCount: members.length,
      assignedDomain,
      temporaryPassword: rawPassword,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error while registering team. Please try again." },
      { status: 500 }
    );
  }
}
