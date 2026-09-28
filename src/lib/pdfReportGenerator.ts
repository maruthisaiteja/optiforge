import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// IEEE EMBS × CIS Brand Colors
const COLORS = {
  ieeeBlue: [0, 98, 155] as [number, number, number],      // #00629B
  embsPurple: [119, 37, 131] as [number, number, number],   // #772583
  navyText: [16, 42, 67] as [number, number, number],       // #102A43
  mutedText: [98, 125, 152] as [number, number, number],    // #627D98
  headerBg: [240, 247, 251] as [number, number, number],    // #F0F7FB
  white: [255, 255, 255] as [number, number, number],
  borderGray: [226, 232, 240] as [number, number, number],  // #E2E8F0
  lightRow: [250, 252, 254] as [number, number, number],
};

/**
 * GENERATE OFFICIAL ATTENDANCE SHEET (PDF)
 * Strictly UTR submitted / confirmed teams only. Excludes pending payment and disqualified teams.
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

  // Sort by Team Code
  eligibleTeams.sort((a, b) => (a.teamCode || "").localeCompare(b.teamCode || ""));

  const totalTeams = eligibleTeams.length;
  const totalStudents = eligibleTeams.reduce((acc, t) => acc + (t.members?.length || 1), 0);
  const totalFee = eligibleTeams.reduce((acc, t) => acc + (t.paymentAmount || 0), 0);

  // Landscape A4 for wide table columns with desk signature
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Document Title Header Banner
  doc.setFillColor(...COLORS.ieeeBlue);
  doc.rect(0, 0, pageWidth, 24, "F");

  doc.setFillColor(...COLORS.embsPurple);
  doc.rect(0, 24, pageWidth, 2, "F");

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("OPTIFORGE 2026 — OFFICIAL DESK ATTENDANCE & VERIFICATION ROSTER", 14, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("IEEE EMBS × IEEE CIS · Vardhaman College of Engineering, Hyderabad", 14, 17);

  doc.setFontSize(8);
  doc.text("Event Date: 30 September 2026 · Reporting: 09:00 AM IST", pageWidth - 14, 11, { align: "right" });
  doc.text("Strictly Verified & UTR-Submitted Teams", pageWidth - 14, 17, { align: "right" });

  // Summary Metrics Strip
  doc.setFillColor(...COLORS.headerBg);
  doc.roundedRect(14, 29, pageWidth - 28, 12, 2, 2, "F");
  doc.setDrawColor(...COLORS.borderGray);
  doc.roundedRect(14, 29, pageWidth - 28, 12, 2, 2, "S");

  doc.setTextColor(...COLORS.navyText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`Total Verified Teams: ${totalTeams}`, 20, 36.5);
  doc.text(`Total Student Seats: ${totalStudents}`, 85, 36.5);
  doc.text(`Total Fee Reconciled: ₹${totalFee.toLocaleString("en-IN")}`, 155, 36.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.mutedText);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, pageWidth - 20, 36.5, { align: "right" });

  // Build Table Rows
  const tableRows: any[] = [];
  let currentSno = 0;

  eligibleTeams.forEach((team) => {
    currentSno++;
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

    members.forEach((m: any, mIdx: number) => {
      const isLeader = mIdx === 0;
      const roleBadge = isLeader ? "LEADER" : `Member ${mIdx + 1}`;
      const teamSummary = isLeader
        ? `${team.teamCode}\n${team.teamName}\nTrack: ${team.domainId || "theme-1"}\nUTR: ${team.razorpayPaymentId || "None"}\nFee: ₹${team.paymentAmount || 100}`
        : "";

      tableRows.push([
        isLeader ? String(currentSno) : "",
        teamSummary,
        roleBadge,
        m.name || "N/A",
        m.rollNumber || "N/A",
        m.collegeName || "Vardhaman College of Eng.",
        `${m.branch || "CSE"}\n${m.year || "3rd Year"}`,
        `${m.phone || ""}\n${m.email || ""}`,
        "", // Blank for physical signature
      ]);
    });
  });

  autoTable(doc, {
    startY: 44,
    head: [[
      "#",
      "Team & Payment Info",
      "Role",
      "Student Name",
      "Roll Number / ID",
      "College Name",
      "Branch / Year",
      "Contact Info",
      "Desk Signature / ID Verified",
    ]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: COLORS.ieeeBlue,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      valign: "middle",
      cellPadding: 2.5,
    },
    styles: {
      fontSize: 7.5,
      textColor: COLORS.navyText,
      lineColor: COLORS.borderGray,
      lineWidth: 0.2,
      valign: "middle",
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 42, fontStyle: "bold", fontSize: 7 },
      2: { cellWidth: 18, halign: "center", fontStyle: "bold" },
      3: { cellWidth: 35, fontStyle: "bold" },
      4: { cellWidth: 26, fontStyle: "bold", halign: "center" },
      5: { cellWidth: 45 },
      6: { cellWidth: 24, halign: "center" },
      7: { cellWidth: 38, fontSize: 6.5 },
      8: { cellWidth: 31, halign: "center" },
    },
    didDrawCell: (data) => {
      // Draw signature guideline in signature column
      if (data.column.index === 8 && data.section === "body") {
        const x = data.cell.x + 3;
        const y = data.cell.y + data.cell.height - 3;
        doc.setDrawColor(180, 195, 210);
        doc.setLineDashPattern([1, 1], 0);
        doc.line(x, y, x + 25, y);
        doc.setLineDashPattern([], 0);
      }
    },
    didDrawPage: (data) => {
      // Running Footer on every page
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.mutedText);
      doc.setFont("helvetica", "normal");
      doc.text(
        "OptiForge 2026 · Official Desk Attendance Roster · Check physical College ID Card before signature verification",
        14,
        pageHeight - 6
      );
      doc.text(
        `Page ${data.pageNumber} | IEEE EMBS × IEEE CIS Student Branches`,
        pageWidth - 14,
        pageHeight - 6,
        { align: "right" }
      );
    },
    margin: { top: 44, bottom: 12, left: 14, right: 14 },
  });

  doc.save(`OptiForge_2026_Attendance_Sheet_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * GENERATE REGISTERED TEAMS MASTER CREDENTIALS DIRECTORY (PDF)
 * Exports Team ID, Team Name, and Login Password in structured PDF format.
 */
export function generateCredentialsSheetPdf(allTeams: any[]): void {
  const teams = (allTeams || []).filter((t: any) => !t.isDisqualified);

  if (teams.length === 0) {
    alert("No registered teams found to export.");
    return;
  }

  // Sort by Team Code
  teams.sort((a, b) => (a.teamCode || "").localeCompare(b.teamCode || ""));

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header Banner
  doc.setFillColor(...COLORS.embsPurple);
  doc.rect(0, 0, pageWidth, 22, "F");

  doc.setFillColor(...COLORS.ieeeBlue);
  doc.rect(0, 22, pageWidth, 2, "F");

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("OPTIFORGE 2026 — TEAM CREDENTIALS DIRECTORY", 14, 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("CONFIDENTIAL: Team IDs, Official Names & Access Passwords (Admin Dispatch Sheet)", 14, 16);

  doc.setFontSize(7.5);
  doc.text(`Total Teams: ${teams.length}`, pageWidth - 14, 10, { align: "right" });
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, pageWidth - 14, 16, { align: "right" });

  // Security Notice Box
  doc.setFillColor(254, 242, 242); // light red
  doc.roundedRect(14, 27, pageWidth - 28, 9, 1.5, 1.5, "F");
  doc.setDrawColor(248, 113, 113);
  doc.roundedRect(14, 27, pageWidth - 28, 9, 1.5, 1.5, "S");

  doc.setTextColor(185, 28, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("RESTRICTED ACCESS:", 18, 33);
  doc.setFont("helvetica", "normal");
  doc.text("Distribute passwords strictly to verified team leaders. Portal URL: https://optiforge-2026.vercel.app/login", 52, 33);

  // Table Data
  const rows = teams.map((t, idx) => {
    const codeSuffix = t.teamCode?.split("-")[2] || "2026";
    const password = t.rawPassword || `Forge#${codeSuffix}`;
    const leaderName = t.members?.[0]?.name || t.teamName;
    const paymentPill = t.paymentStatus === "CONFIRMED"
      ? (t.razorpayPaymentId ? `PAID (UTR: ${t.razorpayPaymentId})` : "PAID (Confirmed)")
      : "PENDING";

    return [
      String(idx + 1),
      t.teamCode || "N/A",
      t.teamName || "N/A",
      password,
      `${leaderName}\n${t.leaderEmail || ""}`,
      t.leaderPhone || "N/A",
      t.domainId ? t.domainId.replace("theme-", "Theme ") : "Theme 1",
      paymentPill,
    ];
  });

  autoTable(doc, {
    startY: 39,
    head: [[
      "#",
      "Team ID (Login ID)",
      "Team Name",
      "Login Password",
      "Team Leader & Email",
      "Phone",
      "Domain",
      "Payment / UTR",
    ]],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: COLORS.embsPurple,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      valign: "middle",
      cellPadding: 2.5,
    },
    styles: {
      fontSize: 7.5,
      textColor: COLORS.navyText,
      lineColor: COLORS.borderGray,
      lineWidth: 0.15,
      valign: "middle",
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 7, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 26, fontStyle: "bold", textColor: COLORS.ieeeBlue, halign: "center" },
      2: { cellWidth: 32, fontStyle: "bold" },
      3: { cellWidth: 25, fontStyle: "bold", textColor: [180, 83, 9], halign: "center" }, // amber/gold password
      4: { cellWidth: 38, fontSize: 7 },
      5: { cellWidth: 20, halign: "center", fontSize: 7 },
      6: { cellWidth: 16, halign: "center", fontSize: 7 },
      7: { cellWidth: 22, halign: "center", fontSize: 6.5 },
    },
    didDrawPage: (data) => {
      // Footer
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.mutedText);
      doc.setFont("helvetica", "normal");
      doc.text(
        "OptiForge 2026 · Confidential Master Credentials Directory · IEEE EMBS × IEEE CIS",
        14,
        pageHeight - 6
      );
      doc.text(
        `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`,
        pageWidth - 14,
        pageHeight - 6,
        { align: "right" }
      );
    },
    margin: { top: 39, bottom: 12, left: 14, right: 14 },
  });

  doc.save(`OptiForge_2026_Team_Credentials_${new Date().toISOString().slice(0, 10)}.pdf`);
}
