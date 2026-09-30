import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";
import { db } from "../src/lib/db";

async function generateStrictTeamsPdf() {
  console.log("Fetching registered teams from database...");
  const rawTeams = await db.team.findMany({
    orderBy: { createdAt: "asc" },
  });

  const teams = [...rawTeams].sort((a: any, b: any) =>
    (a.teamCode || "").localeCompare(b.teamCode || "")
  );

  console.log(`Found ${teams.length} registered teams.`);

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

    // --- HEADER BANNER ---
    doc.setFillColor(10, 25, 47); // Deep Navy (#0A192F)
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setFillColor(0, 98, 155); // Brand Blue (#00629B)
    doc.rect(0, 28, pageWidth, 2, "F");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("OPTIFORGE 2026 — OFFICIAL TEAM ROSTER", margin, 13);

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(180, 210, 235);
    doc.text("Official Directory · Team ID & Team Name (5 Teams Per Page)", margin, 20);

    // Page indicator right-aligned
    doc.setFontSize(9);
    doc.setTextColor(200, 225, 245);
    doc.text(`Page ${pageIdx + 1} of ${totalPages}`, pageWidth - margin, 13, { align: "right" });
    doc.text(`Total Teams: ${teams.length}`, pageWidth - margin, 20, { align: "right" });

    // --- TEAMS CARDS (Exactly 5 Slots per Page, ONLY Team ID and Team Name, LARGE FONT) ---
    const pageTeams = teams.slice(pageIdx * TEAMS_PER_PAGE, (pageIdx + 1) * TEAMS_PER_PAGE);
    const startY = 36;
    const cardHeight = 44;
    const cardGap = 6;

    pageTeams.forEach((team: any, slotIdx: number) => {
      const overallIndex = pageIdx * TEAMS_PER_PAGE + slotIdx + 1;
      const cardY = startY + slotIdx * (cardHeight + cardGap);

      // Card Background with smooth rounded border
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.setDrawColor(203, 213, 225); // Slate 300
      doc.setLineWidth(0.4);
      doc.roundedRect(margin, cardY, contentWidth, cardHeight, 3, 3, "FD");

      // Left Accent Vertical Bar
      doc.setFillColor(0, 98, 155);
      doc.roundedRect(margin, cardY, 3.5, cardHeight, 1.5, 1.5, "F");

      // Slot Number Badge (#1, #2, etc.)
      doc.setFillColor(224, 234, 244);
      doc.roundedRect(margin + 6, cardY + 6, 12, 8, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(0, 98, 155);
      doc.text(`#${overallIndex}`, margin + 12, cardY + 11.5, { align: "center" });

      // Field Label: "TEAM ID"
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(98, 125, 152); // Muted Label
      doc.text("TEAM ID", margin + 22, cardY + 10);

      // Team ID Value (Large Bold Font: 20pt)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(0, 98, 155); // Prominent Brand Blue
      doc.text(team.teamCode || `OPT-26-${overallIndex}`, margin + 22, cardY + 20);

      // Vertical subtle separator
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin + 78, cardY + 6, margin + 78, cardY + cardHeight - 6);

      // Field Label: "TEAM NAME"
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(98, 125, 152);
      doc.text("TEAM NAME", margin + 84, cardY + 10);

      // Team Name Value (Large Bold Font: 18pt)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(16, 42, 67); // Deep Slate Navy
      const teamNameText = team.teamName || `Team ${team.teamCode}`;
      doc.text(teamNameText, margin + 84, cardY + 20);
    });

    // --- FOOTER ---
    doc.setDrawColor(217, 230, 238);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(130, 154, 177);
    doc.text("OptiForge 2026 Autonomous Hackathon · Vardhaman College of Engineering", margin, pageHeight - 7);
    doc.text(`Official Directory · Page ${pageIdx + 1} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
  }

  // Ensure public directory exists
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const publicPdfPath = path.join(publicDir, "registered_teams.pdf");
  const rootPdfPath = path.join(process.cwd(), "registered_teams.pdf");

  const pdfOutput = doc.output("arraybuffer");
  fs.writeFileSync(publicPdfPath, Buffer.from(pdfOutput));
  fs.writeFileSync(rootPdfPath, Buffer.from(pdfOutput));

  console.log(`✓ Strict PDF successfully generated at:\n  - ${rootPdfPath}\n  - ${publicPdfPath}`);
}

generateStrictTeamsPdf()
  .then(() => {
    console.log("PDF generation finished successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error generating PDF:", err);
    process.exit(1);
  });
