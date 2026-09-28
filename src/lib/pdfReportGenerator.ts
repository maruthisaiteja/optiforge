import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Official IEEE EMBS × IEEE CIS Brand Palette
const PALETTE = {
  ieeeBlue: [0, 98, 155] as [number, number, number],       // #00629B
  embsPurple: [119, 37, 131] as [number, number, number],    // #772583
  cyanAccent: [24, 169, 201] as [number, number, number],    // #18A9C9
  darkNavy: [10, 25, 47] as [number, number, number],        // #0A192F
  navyText: [16, 42, 67] as [number, number, number],        // #102A43
  mutedText: [98, 125, 152] as [number, number, number],     // #627D98
  lightBg: [248, 250, 252] as [number, number, number],      // #F8FAFC
  altRowBg: [241, 245, 249] as [number, number, number],     // #F1F5F9
  borderGray: [203, 213, 225] as [number, number, number],   // #CBD5E1
  amberText: [180, 83, 9] as [number, number, number],       // #B45309
  greenText: [16, 120, 72] as [number, number, number],      // #107848
  white: [255, 255, 255] as [number, number, number],
};

/**
 * Draws high-resolution vector crests and organization logos directly onto the PDF canvas.
 * Renders crisp emblems for IEEE, EMBS, CIS, and Vardhaman College of Engineering.
 */
function drawVectorLogos(doc: jsPDF, startX: number, startY: number): void {
  // 1. IEEE Diamond Emblem
  const diamondX = startX + 10;
  const diamondY = startY + 11;
  const dW = 8;
  const dH = 9;

  doc.setFillColor(...PALETTE.ieeeBlue);
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  // Diamond polygon
  doc.triangle(diamondX, diamondY - dH, diamondX + dW, diamondY, diamondX, diamondY + dH, "FD");
  doc.triangle(diamondX, diamondY - dH, diamondX - dW, diamondY, diamondX, diamondY + dH, "FD");

  // Inner IEEE lettering
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("IEEE", diamondX, diamondY + 2.2, { align: "center" });

  // 2. IEEE EMBS Circular Crest
  const embsX = diamondX + 19;
  const embsY = diamondY;
  const radius = 8;

  doc.setFillColor(...PALETTE.embsPurple);
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.circle(embsX, embsY, radius, "FD");

  // Pulse line inside EMBS circle
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.6);
  doc.line(embsX - 5.5, embsY + 1, embsX - 2.5, embsY + 1);
  doc.line(embsX - 2.5, embsY + 1, embsX - 1, embsY - 3.5);
  doc.line(embsX - 1, embsY - 3.5, embsX + 1, embsY + 3.5);
  doc.line(embsX + 1, embsY + 3.5, embsX + 2.5, embsY + 1);
  doc.line(embsX + 2.5, embsY + 1, embsX + 5.5, embsY + 1);

  doc.setFontSize(4.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("EMBS", embsX, embsY - 4.2, { align: "center" });

  // 3. IEEE CIS Circular Crest
  const cisX = embsX + 18;
  const cisY = diamondY;

  doc.setFillColor(...PALETTE.cyanAccent);
  doc.circle(cisX, cisY, radius, "FD");

  // Neural network nodes inside CIS
  doc.setFillColor(255, 255, 255);
  doc.circle(cisX - 3.5, cisY - 2, 1.2, "F");
  doc.circle(cisX + 3.5, cisY - 2, 1.2, "F");
  doc.circle(cisX, cisY + 3, 1.2, "F");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.line(cisX - 3.5, cisY - 2, cisX + 3.5, cisY - 2);
  doc.line(cisX - 3.5, cisY - 2, cisX, cisY + 3);
  doc.line(cisX + 3.5, cisY - 2, cisX, cisY + 3);

  doc.setFontSize(5);
  doc.setTextColor(...PALETTE.darkNavy);
  doc.setFont("helvetica", "bold");
  doc.text("CIS", cisX, cisY + 0.5, { align: "center" });

  // 4. Vardhaman College Shield Crest
  const vceX = cisX + 18;
  const vceY = diamondY;

  doc.setFillColor(...PALETTE.darkNavy);
  doc.setDrawColor(245, 158, 11); // Gold accent
  doc.setLineWidth(0.6);
  doc.roundedRect(vceX - 7, vceY - 7.5, 14, 15, 2, 2, "FD");

  doc.setTextColor(245, 158, 11);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("VCE", vceX, vceY + 0.5, { align: "center" });
  doc.setFontSize(3.8);
  doc.setTextColor(255, 255, 255);
  doc.text("ESTD 1999", vceX, vceY + 4.8, { align: "center" });
}

/**
 * Draws the master executive header banner with logos, institutional titles, and document badge.
 */
function drawMasterHeader(
  doc: jsPDF,
  title: string,
  docBadgeText: string,
  pageWidth: number
): void {
  // Deep Navy background header bar
  doc.setFillColor(...PALETTE.darkNavy);
  doc.rect(0, 0, pageWidth, 28, "F");

  // Triple-colored border stripe (IEEE Blue / Cyan / EMBS Purple)
  doc.setFillColor(...PALETTE.ieeeBlue);
  doc.rect(0, 28, pageWidth * 0.4, 2, "F");
  doc.setFillColor(...PALETTE.cyanAccent);
  doc.rect(pageWidth * 0.4, 28, pageWidth * 0.3, 2, "F");
  doc.setFillColor(...PALETTE.embsPurple);
  doc.rect(pageWidth * 0.7, 28, pageWidth * 0.3, 2, "F");

  // Draw Vector Logos on the left
  drawVectorLogos(doc, 4, 3);

  // Institution & Organizer Titles (Next to logos)
  const textStartX = 94;
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("IEEE EMBS × IEEE CIS · STUDENT CHAPTERS", textStartX, 9);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...PALETTE.cyanAccent);
  doc.text("VARDHAMAN COLLEGE OF ENGINEERING (AUTONOMOUS)", textStartX, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(...PALETTE.mutedText);
  doc.text("Approved by AICTE, Affiliated to JNTUH · Accredited by NAAC with 'A++' Grade · Shamshabad, Hyderabad", textStartX, 20);
  doc.text("Computational Intelligence Challenge · Event Date: Wednesday, 30 September 2026", textStartX, 24.5);

  // Document Title Badge & Metadata (Right side)
  doc.setFillColor(...PALETTE.embsPurple);
  doc.roundedRect(pageWidth - 92, 6, 82, 8, 1.5, 1.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(docBadgeText, pageWidth - 51, 11.5, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(title, pageWidth - 10, 20, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...PALETTE.cyanAccent);
  doc.text(`Official Document · Generated: ${new Date().toLocaleString("en-IN")}`, pageWidth - 10, 25, { align: "right" });
}

/**
 * 1. GENERATE OFFICIAL ATTENDANCE & VERIFICATION ROSTER (PDF)
 * - Landscape A4 format
 * - Strictly UTR submitted / confirmed teams only (excludes pending payment and disqualified teams)
 * - Split into clean, dedicated columns: Team ID, Team Name, Theme, Role, Student Name, Roll No, College, Branch, Contact, UTR & Fee, Signature
 * - Uses rowSpan across team members to eliminate fragmented divider lines
 * - All currency rendered as "Rs." (never corrupted unicode)
 */
export function generateAttendanceSheetPdf(allTeams: any[]): void {
  // 1. Strict filter: confirmed payment + UTR submitted + not disqualified
  const eligibleTeams = (allTeams || []).filter((t: any) => {
    const isConfirmed = t.paymentStatus === "CONFIRMED";
    const hasUtr = !!(t.razorpayPaymentId && String(t.razorpayPaymentId).trim().length > 0);
    const notDisqualified = !t.isDisqualified;
    return isConfirmed && hasUtr && notDisqualified;
  });

  if (eligibleTeams.length === 0) {
    alert("No eligible teams found with confirmed payment and submitted UTR.");
    return;
  }

  // Sort by Team Code (e.g. OPT-26-1173, OPT-26-1282...)
  eligibleTeams.sort((a, b) => (a.teamCode || "").localeCompare(b.teamCode || ""));

  const totalTeams = eligibleTeams.length;
  const totalStudents = eligibleTeams.reduce((acc, t) => acc + (t.members?.length || 1), 0);
  const totalFee = eligibleTeams.reduce((acc, t) => acc + (t.paymentAmount || 0), 0);

  // Landscape A4 (297mm x 210mm)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Draw Master Header Banner
  drawMasterHeader(doc, "DESK ATTENDANCE & VERIFICATION ROSTER", "OFFICIAL PHYSICAL DESK ROSTER", pageWidth);

  // Summary Metrics Bar (KPI Pill Strip)
  const kpiY = 32;
  doc.setFillColor(...PALETTE.lightBg);
  doc.roundedRect(10, kpiY, pageWidth - 20, 11, 2, 2, "F");
  doc.setDrawColor(...PALETTE.borderGray);
  doc.setLineWidth(0.3);
  doc.roundedRect(10, kpiY, pageWidth - 20, 11, 2, 2, "S");

  // KPI 1: Verified Teams
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...PALETTE.ieeeBlue);
  doc.text(`VERIFIED TEAMS: ${totalTeams}`, 16, kpiY + 7);

  // Divider dot
  doc.setTextColor(...PALETTE.mutedText);
  doc.text("|", 68, kpiY + 7);

  // KPI 2: Student Seats
  doc.setTextColor(...PALETTE.navyText);
  doc.text(`REGISTERED STUDENTS: ${totalStudents}`, 74, kpiY + 7);

  doc.setTextColor(...PALETTE.mutedText);
  doc.text("|", 140, kpiY + 7);

  // KPI 3: Reconciled Fee (Formatted with Rs.)
  doc.setTextColor(...PALETTE.greenText);
  doc.text(`FEE RECONCILED: Rs. ${totalFee.toLocaleString("en-IN")}`, 146, kpiY + 7);

  doc.setTextColor(...PALETTE.mutedText);
  doc.text("|", 208, kpiY + 7);

  // KPI 4: Reporting
  doc.setTextColor(...PALETTE.embsPurple);
  doc.text("REPORTING: 09:00 AM IST", 214, kpiY + 7);

  // Build Table Rows with rowSpan across team members
  const tableBody: any[] = [];
  let teamIndex = 0;

  eligibleTeams.forEach((team) => {
    teamIndex++;
    const members = (team.members && team.members.length > 0) ? team.members : [
      {
        name: team.teamName,
        rollNumber: "N/A",
        collegeName: "Vardhaman College of Engineering",
        branch: "CSE",
        year: "3rd Year",
        phone: team.leaderPhone || "N/A",
        email: team.leaderEmail || "N/A",
      }
    ];

    const memberCount = members.length;
    const cleanTrack = (team.domainId || "Theme 1")
      .replace("theme-1-biomedical-ai", "01: Biomedical AI")
      .replace("theme-2-signals", "02: Biomedical Signals")
      .replace("theme-3-imaging", "03: Medical Imaging")
      .replace("theme-4-ml-ai", "04: ML & AI Theory")
      .replace("theme-5-autonomous", "05: Autonomous Systems")
      .replace("theme-6-open-innovation", "06: Open Innovation");

    const feeText = `Rs. ${team.paymentAmount || (memberCount * 100)}`;
    const utrText = `UTR: ${team.razorpayPaymentId || "Verified"}\n${feeText} (Paid)`;

    members.forEach((m: any, mIdx: number) => {
      const isLeader = mIdx === 0;
      const roleText = isLeader ? "LEADER" : `Member ${mIdx + 1}`;

      const row: any[] = [];

      // If it is the first member of the team, attach rowSpans to team columns
      if (isLeader) {
        row.push({
          content: String(teamIndex),
          rowSpan: memberCount,
          styles: { halign: "center", fontStyle: "bold", valign: "middle" },
        });
        row.push({
          content: team.teamCode || "N/A",
          rowSpan: memberCount,
          styles: { halign: "center", fontStyle: "bold", textColor: PALETTE.ieeeBlue, valign: "middle" },
        });
        row.push({
          content: team.teamName || "N/A",
          rowSpan: memberCount,
          styles: { fontStyle: "bold", textColor: PALETTE.navyText, valign: "middle" },
        });
        row.push({
          content: cleanTrack,
          rowSpan: memberCount,
          styles: { fontSize: 6.8, textColor: PALETTE.mutedText, valign: "middle" },
        });
        row.push({
          content: utrText,
          rowSpan: memberCount,
          styles: { fontSize: 6.8, halign: "center", fontStyle: "bold", textColor: PALETTE.greenText, valign: "middle" },
        });
      }

      // Member specific columns
      row.push({
        content: roleText,
        styles: {
          halign: "center",
          fontStyle: isLeader ? "bold" : "normal",
          textColor: isLeader ? PALETTE.embsPurple : PALETTE.mutedText,
          fontSize: 7,
        },
      });
      row.push({
        content: m.name || "N/A",
        styles: { fontStyle: "bold", textColor: PALETTE.navyText },
      });
      row.push({
        content: m.rollNumber || "N/A",
        styles: { halign: "center", fontStyle: "bold", textColor: PALETTE.darkNavy },
      });
      row.push({
        content: m.collegeName || "Vardhaman College of Eng.",
        styles: { fontSize: 7 },
      });
      row.push({
        content: `${m.branch || "CSE"}\n${m.year || "3rd Year"}`,
        styles: { halign: "center", fontSize: 6.8 },
      });
      row.push({
        content: `${m.phone || ""}\n${m.email || ""}`,
        styles: { fontSize: 6.5 },
      });
      row.push({
        content: "", // Desk Signature guideline line
        styles: { halign: "center" },
      });

      tableBody.push(row);
    });
  });

  // Render Table
  autoTable(doc, {
    startY: 45,
    head: [[
      "#",
      "Team ID",
      "Team Name",
      "Innovation Domain Track",
      "Verified UTR & Fee",
      "Role",
      "Student Full Name",
      "Roll Number",
      "College Name",
      "Branch / Year",
      "Student Contact Info",
      "Desk Signature / ID Check",
    ]],
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: PALETTE.ieeeBlue,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
      valign: "middle",
      cellPadding: 2.5,
    },
    styles: {
      fontSize: 7.2,
      textColor: PALETTE.navyText,
      lineColor: PALETTE.borderGray,
      lineWidth: 0.18,
      valign: "middle",
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 7 },
      1: { cellWidth: 22 },
      2: { cellWidth: 28 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 15 },
      6: { cellWidth: 30 },
      7: { cellWidth: 22 },
      8: { cellWidth: 32 },
      9: { cellWidth: 18 },
      10: { cellWidth: 29 },
      11: { cellWidth: 24 },
    },
    didDrawCell: (data) => {
      // Draw signature baseline for verification
      if (data.column.index === 11 && data.section === "body") {
        const x = data.cell.x + 2;
        const y = data.cell.y + data.cell.height - 3;
        doc.setDrawColor(180, 195, 210);
        doc.setLineDashPattern([0.8, 0.8], 0);
        doc.line(x, y, x + 20, y);
        doc.setLineDashPattern([], 0);
      }
    },
    didDrawPage: (data) => {
      // Master running footer
      doc.setFontSize(6.8);
      doc.setTextColor(...PALETTE.mutedText);
      doc.setFont("helvetica", "normal");
      doc.text(
        "OptiForge 2026 · Official On-Desk Attendance Roster · Check physical College ID Card before signature verification · Strictly Confidential",
        10,
        pageHeight - 5
      );
      doc.text(
        `Page ${data.pageNumber} of ${doc.getNumberOfPages()} · IEEE EMBS × IEEE CIS Student Branches`,
        pageWidth - 10,
        pageHeight - 5,
        { align: "right" }
      );
    },
    margin: { top: 45, bottom: 10, left: 10, right: 10 },
  });

  doc.save(`OptiForge_2026_Official_Attendance_Sheet_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * 2. GENERATE REGISTERED TEAMS MASTER CREDENTIALS DIRECTORY (PDF)
 * - Landscape A4 format for spacious, uncrowded layout
 * - Split into clear columns: Team ID, Team Name, Password, Leader Name, Leader Email, Contact, Domain, Members, Payment Status & UTR
 * - Clean visual hierarchy with official logos and security dispatch watermark
 * - All currency rendered as "Rs."
 */
export function generateCredentialsSheetPdf(allTeams: any[]): void {
  const teams = (allTeams || []).filter((t: any) => !t.isDisqualified);

  if (teams.length === 0) {
    alert("No registered teams found to export.");
    return;
  }

  // Sort by Team Code
  teams.sort((a, b) => (a.teamCode || "").localeCompare(b.teamCode || ""));

  // Landscape A4 for wide, executive directory view
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Draw Master Header Banner
  drawMasterHeader(doc, "TEAM CREDENTIALS MASTER DIRECTORY", "CONFIDENTIAL ACCESS DISPATCH SHEET", pageWidth);

  // Security Dispatch Warning Box
  const noticeY = 32;
  doc.setFillColor(254, 242, 242); // Light Red
  doc.roundedRect(10, noticeY, pageWidth - 20, 11, 2, 2, "F");
  doc.setDrawColor(248, 113, 113);
  doc.setLineWidth(0.3);
  doc.roundedRect(10, noticeY, pageWidth - 20, 11, 2, 2, "S");

  doc.setTextColor(185, 28, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("SECURITY PROTOCOL:", 16, noticeY + 6.8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(153, 27, 27);
  doc.text(
    "Distribute login passwords strictly to verified team leaders. Portal Login URL: https://optiforge-2026.vercel.app/login  ·  Event: 30 September 2026",
    55,
    noticeY + 6.8
  );

  doc.setFont("helvetica", "bold");
  doc.text(`Total Active Teams: ${teams.length}`, pageWidth - 16, noticeY + 6.8, { align: "right" });

  // Build Table Rows
  const rows = teams.map((t, idx) => {
    const codeSuffix = t.teamCode?.split("-")[2] || "2026";
    const password = t.rawPassword || `Forge#${codeSuffix}`;
    const leaderName = t.members?.[0]?.name || t.teamName;
    const memberCount = `${t.members?.length || 1} Members`;

    const cleanTrack = (t.domainId || "Theme 1")
      .replace("theme-1-biomedical-ai", "01: Biomedical AI")
      .replace("theme-2-signals", "02: Biomedical Signals")
      .replace("theme-3-imaging", "03: Medical Imaging")
      .replace("theme-4-ml-ai", "04: ML & AI Theory")
      .replace("theme-5-autonomous", "05: Autonomous Systems")
      .replace("theme-6-open-innovation", "06: Open Innovation");

    const paymentPill = t.paymentStatus === "CONFIRMED"
      ? (t.razorpayPaymentId ? `CONFIRMED\nUTR: ${t.razorpayPaymentId}` : `CONFIRMED\n(Rs. ${t.paymentAmount || 100})`)
      : "PENDING PAYMENT";

    return [
      String(idx + 1),
      t.teamCode || "N/A",
      t.teamName || "N/A",
      password,
      leaderName,
      t.leaderEmail || "N/A",
      t.leaderPhone || "N/A",
      cleanTrack,
      memberCount,
      paymentPill,
    ];
  });

  autoTable(doc, {
    startY: 45,
    head: [[
      "#",
      "Team ID (Username)",
      "Team Name",
      "Portal Password",
      "Team Leader Name",
      "Team Leader Email",
      "Mobile Contact",
      "Innovation Domain Track",
      "Seats",
      "Payment & UTR Reference",
    ]],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: PALETTE.embsPurple,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      valign: "middle",
      cellPadding: 2.8,
    },
    styles: {
      fontSize: 7.5,
      textColor: PALETTE.navyText,
      lineColor: PALETTE.borderGray,
      lineWidth: 0.18,
      valign: "middle",
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 26, fontStyle: "bold", textColor: PALETTE.ieeeBlue, halign: "center" },
      2: { cellWidth: 34, fontStyle: "bold" },
      3: { cellWidth: 28, fontStyle: "bold", textColor: PALETTE.amberText, halign: "center" }, // Highlighted password
      4: { cellWidth: 34 },
      5: { cellWidth: 46, fontSize: 7 },
      6: { cellWidth: 23, halign: "center" },
      7: { cellWidth: 32, fontSize: 7 },
      8: { cellWidth: 16, halign: "center" },
      9: { cellWidth: 30, halign: "center", fontSize: 6.8, fontStyle: "bold" },
    },
    didDrawPage: (data) => {
      // Footer
      doc.setFontSize(6.8);
      doc.setTextColor(...PALETTE.mutedText);
      doc.setFont("helvetica", "normal");
      doc.text(
        "OptiForge 2026 · Confidential Master Credentials Directory · Strictly for Administrative Dispatch · IEEE EMBS × IEEE CIS",
        10,
        pageHeight - 5
      );
      doc.text(
        `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`,
        pageWidth - 10,
        pageHeight - 5,
        { align: "right" }
      );
    },
    margin: { top: 45, bottom: 10, left: 10, right: 10 },
  });

  doc.save(`OptiForge_2026_Team_Credentials_Master_${new Date().toISOString().slice(0, 10)}.pdf`);
}
