const fs = require("fs");
const path = require("path");
const { jsPDF } = require("jspdf");

function generateWorkflowPdf() {
  console.log("Generating OptiForge 2026 Event Workflow PDF...");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const NAVY = [10, 25, 47];       // #0A192F
  const BLUE = [0, 98, 155];       // #00629B
  const TEAL = [20, 184, 166];     // #14B8A6
  const PURPLE = [119, 37, 131];   // #772583
  const ORANGE = [245, 158, 11];   // #F59E0B
  const SLATE_BG = [248, 250, 252];
  const CARD_BORDER = [203, 213, 225];
  const TEXT_DARK = [16, 42, 67];
  const TEXT_MUTED = [98, 125, 152];

  // Helper for drawing headers
  function drawHeader(pageNum, totalPages) {
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setFillColor(...BLUE);
    doc.rect(0, 28, pageWidth, 2, "F");

    // Title & subtitle
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("OPTIFORGE 2026 — FULL EVENT WORKFLOW & SCHEDULE", margin, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(180, 210, 235);
    doc.text("Official Master Operating Plan · IEEE EMBS × IEEE CIS · Vardhaman College of Engineering", margin, 19);
    doc.text("Date: September 30, 2026 | Timings: 08:00 AM – 05:00 PM IST | Venue: CSE/IT Labs", margin, 24);

    doc.setFontSize(8.5);
    doc.setTextColor(200, 225, 245);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, 12, { align: "right" });
    doc.text("Master Blueprint", pageWidth - margin, 19, { align: "right" });
  }

  function drawFooter(pageNum, totalPages) {
    doc.setDrawColor(217, 230, 238);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text("OptiForge 2026 Autonomous Hackathon · IEEE Student Branch · Strict Adherence Required", margin, pageHeight - 5);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: "right" });
  }

  // ==========================================
  // PAGE 1: TOURNAMENT TIMELINE & HOURLY WORKFLOW
  // ==========================================
  drawHeader(1, 2);

  let curY = 34;

  // Section Banner
  doc.setFillColor(...BLUE);
  doc.roundedRect(margin, curY, contentWidth, 7, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("SECTION 1: OFFICIAL TOURNAMENT STAGES & HOURLY SCHEDULE", margin + 4, curY + 5);

  curY += 10;

  const stages = [
    {
      stage: "STAGE 0",
      time: "08:00 - 09:00",
      title: "Team Check-in, Desk Verification & Credentials Distribution",
      desc: "Registration verification at Helpdesk. Distribution of official Team IDs and system credentials. Teams occupy designated terminal stations and verify environment setup (AI IDE, Git, Public GitHub connection).",
      tag: "PRE-EVENT SETUP",
      tagColor: [100, 116, 139]
    },
    {
      stage: "STAGE 1",
      time: "09:00 - 12:15",
      title: "Round 1 Commences: Track Allocation & Architecture Prototyping",
      desc: "Official track problem statements unlocked on dashboard. Teams formulate optimization pipelines, design algorithms (GA, PSO, ACO, Fuzzy Logic), build modular components, and push code to single-branch public repo.",
      tag: "CORE HACKING · 3h 15m",
      tagColor: BLUE
    },
    {
      stage: "STAGE 2",
      time: "12:15 - 12:30",
      title: "Attempt 1 Online Submission Window for Automated AI Evaluation",
      desc: "Portal opens for Attempt 1. Automated multi-metric evaluator executes code validation, AST design checks, efficiency profiling, and baseline convergence benchmarks. Immediate live scores reflected on dashboard.",
      tag: "SUBMISSION 1 · STRICT DEADLINE",
      tagColor: ORANGE
    },
    {
      stage: "STAGE 3",
      time: "12:30 - 13:15",
      title: "Networking & Lunch Break (Leaderboard Insights)",
      desc: "Official lunch break. System displays midway preliminary leaderboard. Teams analyze Attempt 1 feedback diagnostics, rubric suggestions, and plan algorithmic tuning for Stage 4.",
      tag: "BREAK & STRATEGY · 45m",
      tagColor: [16, 185, 129]
    },
    {
      stage: "STAGE 4",
      time: "13:15 - 14:45",
      title: "Round 2 Commences: Perturbation Shifts & Live Patching",
      desc: "Surprise perturbation scenarios activated (demographic drift, sensor noise, corridor blockade). Teams must adapt their models and hyper-parameters dynamically to handle unexpected stress-testing vectors.",
      tag: "LIVE STRESS ROUND · 1h 30m",
      tagColor: PURPLE
    },
    {
      stage: "STAGE 5",
      time: "14:45 - 15:00",
      title: "Attempt 2 & 3 Final Submissions Window",
      desc: "Final window for Attempt 2 and Attempt 3. Strict 15:00 cut-off. Code freeze enforced across all repositories. Best valid attempt score is locked for automated scoring (60% overall weight).",
      tag: "FINAL CODE FREEZE · STRICT",
      tagColor: [220, 38, 38]
    },
    {
      stage: "STAGE 6",
      time: "15:00 - 16:00",
      title: "Expert Panel Jury Evaluation & Viva-Voce Defense",
      desc: "Domain judges and technical jury visit teams or conduct oral defense. 4-minute presentation per team covering: mathematical justification, architectural innovation, real-world viability, and QA (40% weight).",
      tag: "EXPERT JURY EVALUATION · 1h",
      tagColor: BLUE
    },
    {
      stage: "STAGE 7",
      time: "16:00 - 17:00",
      title: "Leaderboard Unfreezing, Valedictory & Awards Ceremony",
      desc: "Combined 60% Auto + 40% Jury scores computed. Unfreezing of final leaderboard. Keynote remarks by organizers, felicitation of winning teams, trophy presentation, and distribution of official IEEE certificates.",
      tag: "VALEDICTORY & PRIZE AWARDS",
      tagColor: [16, 185, 129]
    },
  ];

  stages.forEach((st, idx) => {
    const cardH = 27;
    doc.setFillColor(...SLATE_BG);
    doc.setDrawColor(...CARD_BORDER);
    doc.setLineWidth(0.35);
    doc.roundedRect(margin, curY, contentWidth, cardH, 2, 2, "FD");

    // Left color bar
    doc.setFillColor(...st.tagColor);
    doc.roundedRect(margin, curY, 3, cardH, 1, 1, "F");

    // Badge: Stage & Time
    doc.setFillColor(235, 240, 245);
    doc.roundedRect(margin + 5, curY + 3.5, 34, 6.5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...BLUE);
    doc.text(st.stage, margin + 7, curY + 8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`· ${st.time}`, margin + 20, curY + 8);

    // Tag right aligned
    doc.setFillColor(...st.tagColor);
    doc.roundedRect(pageWidth - margin - 52, curY + 3.5, 48, 6, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text(st.tag, pageWidth - margin - 28, curY + 7.7, { align: "center" });

    // Stage Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.8);
    doc.setTextColor(...TEXT_DARK);
    doc.text(st.title, margin + 5, curY + 14);

    // Stage Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(70, 80, 95);
    const splitDesc = doc.splitTextToSize(st.desc, contentWidth - 10);
    doc.text(splitDesc, margin + 5, curY + 18.5);

    curY += cardH + 2.8;
  });

  drawFooter(1, 2);

  // ==========================================
  // PAGE 2: STEP-BY-STEP PARTICIPANT WORKFLOW, RULES & EVALUATION
  // ==========================================
  doc.addPage();
  drawHeader(2, 2);

  curY = 34;

  // SECTION 2: PARTICIPANT STEP-BY-STEP JOURNEY
  doc.setFillColor(...BLUE);
  doc.roundedRect(margin, curY, contentWidth, 7, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("SECTION 2: STEP-BY-STEP PARTICIPANT WORKFLOW (HOW TO WORK & SUBMIT)", margin + 4, curY + 5);

  curY += 10;

  const steps = [
    {
      num: "01",
      title: "Prerequisites & Environment Setup",
      bullets: [
        "Ensure your AI IDE (Antigravity, Cursor, VS Code) is installed with Python 3.10+ runtime.",
        "Verify Git configuration with your active GitHub account credentials.",
        "Ensure you have received your official Team ID (OPT-26-XXXX) from desk or directory.",
      ],
    },
    {
      num: "02",
      title: "Repository Initialization & Single Branch Rule",
      bullets: [
        "Create a brand new repository on GitHub and set visibility to strictly PUBLIC.",
        "Keep all commits strictly within a SINGLE branch (e.g., 'main'). No multi-branch confusion.",
        "Total repository size must remain strictly under 10 MB (exclude huge datasets / artifacts).",
      ],
    },
    {
      num: "03",
      title: "Prompting, Development & Clean Architecture",
      bullets: [
        "Clone your repository inside your AI platform and begin iterative development.",
        "Follow clean coding practices: modular functions, type hints, proper error boundaries.",
        "Commit progress regularly to demonstrate progressive development and transparent authorship.",
      ],
    },
    {
      num: "04",
      title: "What to Submit & Documentation (README.md)",
      bullets: [
        "Public GitHub repository URL entered into the OptiForge portal.",
        "Complete source code inside repository, executable and self-contained.",
        "Mandatory README.md detailing: Chosen Vertical, Mathematical Approach, Assumptions, and Setup.",
      ],
    },
    {
      num: "05",
      title: "Online AI Evaluation & Progressive Attempts (Max 3)",
      bullets: [
        "Submit URL in portal during submission windows (Stage 2 and Stage 5).",
        "Max 3 attempts allowed. Automated pipeline clones, parses AST, runs stress tests, and grades.",
        "Detailed feedback and scores are instantly displayed. Your highest scored attempt is retained.",
      ],
    },
    {
      num: "06",
      title: "Jury Defense & Master Leaderboard Freeze",
      bullets: [
        "During Stage 6, present your architecture and live demo to the assigned Domain Expert Jury.",
        "Score synthesis: 60% Auto AI Evaluation Score + 40% Expert Panel Jury Score.",
        "Top teams awarded trophies, IEEE certificates, and fast-track recognition.",
      ],
    },
  ];

  steps.forEach((stp) => {
    const stepH = 23;
    doc.setFillColor(...SLATE_BG);
    doc.setDrawColor(...CARD_BORDER);
    doc.setLineWidth(0.35);
    doc.roundedRect(margin, curY, contentWidth, stepH, 2, 2, "FD");

    // Left Number Pill
    doc.setFillColor(...BLUE);
    doc.roundedRect(margin + 3, curY + 3.5, 10, 8, 1.5, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(stp.num, margin + 8, curY + 8.8, { align: "center" });

    // Step Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.8);
    doc.setTextColor(...TEXT_DARK);
    doc.text(stp.title, margin + 16, curY + 8.8);

    // Bullets
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(60, 75, 95);
    let bulletY = curY + 13.5;
    stp.bullets.forEach((b) => {
      doc.setFillColor(...TEAL);
      doc.circle(margin + 17, bulletY - 1, 0.8, "F");
      doc.text(b, margin + 20, bulletY);
      bulletY += 3.8;
    });

    curY += stepH + 2.5;
  });

  curY += 2;

  // SECTION 3: EVALUATION FORMULA & GOLDEN RULES TABLE
  doc.setFillColor(...BLUE);
  doc.roundedRect(margin, curY, contentWidth, 6.5, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("SECTION 3: SCORING SYNTHESIS & STRICT SUBMISSION RULES", margin + 4, curY + 4.8);

  curY += 8.5;

  // 2-column breakdown
  const colW = (contentWidth - 4) / 2;

  // Left Box: Score Formula
  doc.setFillColor(243, 248, 254);
  doc.setDrawColor(...CARD_BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, curY, colW, 35, 2, 2, "FD");

  doc.setFillColor(...BLUE);
  doc.rect(margin, curY, colW, 5.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.text("EVALUATION WEIGHT MATRIX", margin + 4, curY + 4);

  doc.setTextColor(...TEXT_DARK);
  doc.setFontSize(7.2);
  let leftY = curY + 9;
  const weights = [
    { label: "Automated AI Evaluation Engine", val: "60%", sub: "Code AST, Convergence, Benchmarks, Stress tests" },
    { label: "Expert Technical Panel Jury", val: "40%", sub: "Oral defense, mathematical rigor, domain novelty" },
    { label: "High Impact Focus", val: "Crucial", sub: "Solution quality, robustness under noise, correct output" },
    { label: "Medium / Low Impact Focus", val: "Fine-tune", sub: "Code cleanliness, efficiency SLA, README documentation" },
  ];
  weights.forEach((w) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${w.label}:`, margin + 3, leftY);
    doc.setTextColor(...BLUE);
    doc.text(w.val, margin + colW - 4, leftY, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_MUTED);
    doc.text(w.sub, margin + 3, leftY + 3.2);
    doc.setTextColor(...TEXT_DARK);
    leftY += 6.5;
  });

  // Right Box: Golden Rules
  doc.setFillColor(254, 249, 240);
  doc.setDrawColor(251, 191, 36);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin + colW + 4, curY, colW, 35, 2, 2, "FD");

  doc.setFillColor(...ORANGE);
  doc.rect(margin + colW + 4, curY, colW, 5.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.text("GOLDEN RULES & ZERO-TOLERANCE POLICIES", margin + colW + 8, curY + 4);

  doc.setTextColor(...TEXT_DARK);
  doc.setFontSize(7.2);
  let rightY = curY + 9;
  const rules = [
    "1. Strict 3 Attempt Ceiling: Attempt 4 is blocked by system.",
    "2. Public Single-Branch Repo: Private or multi-branch disqualified.",
    "3. Max 10 MB Size: Do not commit large binary weights or dumps.",
    "4. AI-Plagiarism & Hardcoding Guard: AST checks detect dummy scores.",
    "5. Live Patch Mandatory: Must handle Stage 4 unannounced shifts.",
  ];
  rules.forEach((r) => {
    doc.setFont("helvetica", "normal");
    doc.text(r, margin + colW + 7, rightY);
    rightY += 5.2;
  });

  drawFooter(2, 2);

  // Output paths
  const desktopPdfPath = "C:\\Users\\marut\\Desktop\\OptiForge_Event_Workflow.pdf";
  const publicPdfPath = path.join(process.cwd(), "public", "event_workflow.pdf");
  const rootPdfPath = path.join(process.cwd(), "OptiForge_Event_Workflow.pdf");

  const pdfOutput = doc.output("arraybuffer");
  const buffer = Buffer.from(pdfOutput);

  fs.writeFileSync(desktopPdfPath, buffer);
  fs.writeFileSync(rootPdfPath, buffer);
  if (!fs.existsSync(path.join(process.cwd(), "public"))) {
    fs.mkdirSync(path.join(process.cwd(), "public"), { recursive: true });
  }
  fs.writeFileSync(publicPdfPath, buffer);

  console.log(`✓ Workflow PDF successfully created at:`);
  console.log(`  - ${desktopPdfPath}`);
  console.log(`  - ${rootPdfPath}`);
  console.log(`  - ${publicPdfPath}`);
}

generateWorkflowPdf();
