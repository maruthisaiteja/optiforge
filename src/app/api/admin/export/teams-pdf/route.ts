import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { jsPDF } from "jspdf";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    // Allow ADMIN or direct authorized requests
    if (!session || (session.role !== "ADMIN" && session.role !== "JUDGE")) {
      return NextResponse.json({ error: "Unauthorized: Admin access required." }, { status: 401 });
    }

    const rawTeams = await db.team.findMany({
      orderBy: { createdAt: "asc" },
    });

    const teams = [...rawTeams].sort((a: any, b: any) =>
      (a.teamCode || "").localeCompare(b.teamCode || "")
    );

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    const TEAMS_PER_PAGE = 5;
    const totalPages = Math.ceil(teams.length / TEAMS_PER_PAGE) || 1;

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      if (pageIdx > 0) {
        doc.addPage();
      }

      // --- 1. HEADER BANNER ---
      doc.setFillColor(10, 25, 47); // Deep Navy (#0A192F)
      doc.rect(0, 0, pageWidth, 34, "F");

      doc.setFillColor(0, 98, 155); // OptiForge Teal/Blue (#00629B)
      doc.rect(0, 34, pageWidth, 2.5, "F");

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("OPTIFORGE 2026 — REGISTERED TEAMS", margin, 14);

      // Subtitle
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(200, 220, 240);
      doc.text("Official Team Directory · IEEE EMBS × IEEE CIS Student Branch", margin, 21);

      // Metadata
      doc.setFontSize(8.5);
      doc.setTextColor(170, 200, 225);
      const dateStr = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      });
      doc.text(`Total Teams: ${teams.length} | Generated: ${dateStr} IST`, pageWidth - margin, 14, { align: "right" });
      doc.text(`Page ${pageIdx + 1} of ${totalPages} (5 Teams / Page)`, pageWidth - margin, 21, { align: "right" });

      // --- 2. TEAMS LIST (5 Teams per Page with Large Fonts) ---
      const pageTeams = teams.slice(pageIdx * TEAMS_PER_PAGE, (pageIdx + 1) * TEAMS_PER_PAGE);
      const cardStartY = 43;
      const cardGap = 5;
      const cardHeight = 44;

      pageTeams.forEach((team: any, idx: number) => {
        const cardY = cardStartY + idx * (cardHeight + cardGap);
        const members = team.members || [];
        const leader = members.length > 0 ? members[0] : null;
        const leaderName = leader?.name || "Team Leader";
        const collegeName = leader?.collegeName || "Vardhaman College of Engineering";
        const memberCount = members.length || 1;

        // Card Box
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(217, 230, 238);
        doc.roundedRect(margin, cardY, contentWidth, cardHeight, 3, 3, "FD");

        // Left Accent Strip
        doc.setFillColor(0, 98, 155);
        doc.roundedRect(margin, cardY, 3, cardHeight, 1.5, 1.5, "F");

        // Team Code (Large Font: 15pt)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(0, 98, 155);
        doc.text(team.teamCode || `TEAM-${idx + 1}`, margin + 6, cardY + 8);

        // Separator
        doc.setTextColor(150, 165, 180);
        doc.text("·", margin + 50, cardY + 8);

        // Team Name (Large Font: 15pt)
        doc.setTextColor(16, 42, 67);
        doc.setFont("helvetica", "bold");
        const cleanTeamName = team.teamName || `Team ${team.teamCode}`;
        doc.text(cleanTeamName, margin + 54, cardY + 8);

        // Status Badge
        const isConfirmed = team.paymentStatus === "CONFIRMED";
        const badgeText = isConfirmed ? "CONFIRMED" : "REGISTERED";
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        if (isConfirmed) {
          doc.setFillColor(220, 252, 231);
          doc.setTextColor(22, 101, 52);
        } else {
          doc.setFillColor(238, 242, 255);
          doc.setTextColor(55, 48, 163);
        }
        const badgeWidth = 26;
        doc.roundedRect(pageWidth - margin - badgeWidth - 2, cardY + 3.5, badgeWidth, 6, 1.5, 1.5, "F");
        doc.text(badgeText, pageWidth - margin - badgeWidth / 2 - 2, cardY + 7.8, { align: "center" });

        // Divider
        doc.setDrawColor(230, 238, 244);
        doc.line(margin + 6, cardY + 12, pageWidth - margin - 6, cardY + 12);

        // Leader
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(51, 78, 104);
        doc.text("Leader:", margin + 6, cardY + 19);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(16, 42, 67);
        doc.text(`${leaderName} (${team.leaderEmail || "N/A"})`, margin + 23, cardY + 19);

        // Phone
        doc.setFont("helvetica", "bold");
        doc.setTextColor(51, 78, 104);
        doc.text("Phone:", pageWidth - margin - 58, cardY + 19);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(16, 42, 67);
        doc.text(team.leaderPhone || "N/A", pageWidth - margin - 42, cardY + 19);

        // College
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(51, 78, 104);
        doc.text("College:", margin + 6, cardY + 26.5);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(16, 42, 67);
        doc.text(collegeName, margin + 23, cardY + 26.5);

        // Members
        doc.setFont("helvetica", "bold");
        doc.setTextColor(51, 78, 104);
        doc.text("Members:", pageWidth - margin - 58, cardY + 26.5);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 98, 155);
        doc.text(`${memberCount} Registered`, pageWidth - margin - 37, cardY + 26.5);

        // Theme / Domain
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 78, 104);
        doc.text("Theme / Track:", margin + 6, cardY + 34);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(16, 42, 67);
        const trackLabel = team.domainId || "Theme 1: CIS × EMBS Biomedical & Clinical AI";
        doc.text(trackLabel, margin + 35, cardY + 34);

        // UUID
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(130, 154, 177);
        doc.text(`UUID: ${team.id}`, margin + 6, cardY + 40);
      });

      // Footer
      doc.setDrawColor(217, 230, 238);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(130, 154, 177);
      doc.text("OptiForge 2026 Autonomous Hackathon · Vardhaman College of Engineering", margin, pageHeight - 7);
      doc.text(`Confidential Tournament Document · Page ${pageIdx + 1} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
    }

    const pdfArrayBuffer = doc.output("arraybuffer");
    const pdfUint8Array = new Uint8Array(pdfArrayBuffer);

    return new NextResponse(pdfUint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="OptiForge_Registered_Teams_5PerPage_${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to generate PDF." }, { status: 500 });
  }
}
