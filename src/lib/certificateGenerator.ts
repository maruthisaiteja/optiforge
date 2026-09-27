/**
 * OptiForge 2026 — High-Resolution Digital Certificate Generator
 * Renders verified e-credentials on an HTML5 canvas and generates individual certificate image files.
 */

export interface CertificateParticipant {
  id?: string;
  name: string;
  rollNumber?: string;
  branch?: string;
  year?: string;
  email?: string;
}

export interface CertificateTeam {
  id: string;
  teamCode: string;
  teamName: string;
  rank?: number | null;
  trackName?: string;
  domainId?: string;
}

export function drawCertificateCanvas(
  participant: CertificateParticipant,
  team: CertificateTeam,
  trackName: string,
  rank: number | null
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1131; // A4 aspect ratio landscape (1.414:1)
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // 1. Dark Theme Background
  ctx.fillStyle = "#0c101d";
  ctx.fillRect(0, 0, 1600, 1131);

  // 2. Outer Border Frame
  ctx.strokeStyle = "#1f2a63";
  ctx.lineWidth = 16;
  ctx.strokeRect(30, 30, 1540, 1071);

  // 3. Inner Cyan Accent Border
  ctx.strokeStyle = "#00F2FE";
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 50, 1500, 1031);

  // 4. Decorative Corner Ornaments
  const drawCorner = (x: number, y: number, rX: number, rY: number) => {
    ctx.strokeStyle = "#00F2FE";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x + rX * 60, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + rY * 60);
    ctx.stroke();
  };
  drawCorner(70, 70, 1, 1);
  drawCorner(1530, 70, -1, 1);
  drawCorner(70, 1061, 1, -1);
  drawCorner(1530, 1061, -1, -1);

  // 5. Header: OPTIFORGE 2026 & Organizer Branding
  ctx.textAlign = "center";
  ctx.fillStyle = "#00F2FE";
  ctx.font = "bold 44px sans-serif";
  ctx.fillText("OPTIFORGE 2026", 800, 140);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 20px sans-serif";
  ctx.fillText("IEEE Vardhaman Student Branch · EMBS & CIS Chapters", 800, 180);

  // 6. Certificate Type Badge
  const certType =
    rank === 1
      ? "CERTIFICATE OF EXCELLENCE"
      : rank && rank <= 3
      ? "CERTIFICATE OF MERIT"
      : "CERTIFICATE OF PARTICIPATION";

  ctx.fillStyle = "#7928CA";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(certType, 800, 250);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "18px sans-serif";
  ctx.fillText("This official e-credential is proudly presented to", 800, 300);

  // 7. Recipient Name
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 52px serif";
  ctx.fillText(participant.name, 800, 380);

  // Underline
  ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(400, 400);
  ctx.lineTo(1200, 400);
  ctx.stroke();

  // 8. Citation Details
  ctx.fillStyle = "#CBD5E1";
  ctx.font = "20px sans-serif";
  ctx.fillText(
    `of Team ${team.teamName} (ID: ${team.teamCode})`,
    800,
    460
  );
  ctx.fillText(
    "for architecting, optimizing, and benchmark-validating solutions in",
    800,
    500
  );

  ctx.fillStyle = "#00F2FE";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText(trackName || "Computational Intelligence Track", 800, 550);

  ctx.fillStyle = "#CBD5E1";
  ctx.font = "18px sans-serif";
  ctx.fillText(
    "at OptiForge 2026 Hackathon, organized by IEEE EMBS Student Chapter × IEEE CIS Local Chapter at VCE.",
    800,
    600
  );

  if (rank && rank <= 3) {
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(`🏆 Rank Achieved: Top ${rank} Place`, 800, 660);
  }

  // 9. Verification ID & Date
  const rawId = `${team.teamCode}-${participant.name.replace(/\s+/g, "").toUpperCase()}`;
  const vCode = `OPT26-${rawId.slice(0, 24)}`;

  ctx.fillStyle = "#64748B";
  ctx.font = "16px monospace";
  ctx.fillText(`VERIFICATION ID: ${vCode}  ·  ISSUED: 30th September 2026`, 800, 840);

  // 10. Signatures
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(150, 950);
  ctx.lineTo(500, 950);
  ctx.moveTo(1100, 950);
  ctx.lineTo(1450, 950);
  ctx.stroke();

  ctx.fillStyle = "#94a3b8";
  ctx.font = "16px sans-serif";
  ctx.fillText("Lead Organizer", 325, 980);
  ctx.fillText("IEEE EMBS Student Chapter", 325, 1005);

  ctx.fillText("Jury Chair", 1275, 980);
  ctx.fillText("IEEE CIS Local Chapter", 1275, 1005);

  return canvas;
}

export function downloadSingleCertificate(
  participant: CertificateParticipant,
  team: CertificateTeam,
  trackName: string,
  rank: number | null = null
) {
  const canvas = drawCertificateCanvas(participant, team, trackName, rank);
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  const safeName = participant.name.replace(/[^a-zA-Z0-9]/g, "_");
  link.download = `Certificate_${safeName}_${team.teamCode}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadAllTeamCertificates(
  teams: any[],
  onProgress?: (current: number, total: number, currentName: string) => void
) {
  // Filter out test teams
  const TEST_CODES = new Set(["OPT-26-1904", "OPT-26-3340", "OPT-26-7902"]);
  const TEST_NAMES = new Set(["TEAM 1904", "I'M GAME", "TEST"]);

  const validTeams = (teams || []).filter(
    (t) =>
      !TEST_CODES.has((t.teamCode || "").toUpperCase()) &&
      !TEST_NAMES.has((t.teamName || "").trim().toUpperCase())
  );

  // Collect all individual participants
  const items: { participant: CertificateParticipant; team: CertificateTeam; trackName: string; rank: number | null }[] = [];

  validTeams.forEach((t) => {
    const trackName = t.track?.name || t.track?.shortName || "Computational Intelligence Track";
    const members: CertificateParticipant[] = t.members || [];
    members.forEach((m) => {
      items.push({
        participant: m,
        team: {
          id: t.id,
          teamCode: t.teamCode,
          teamName: t.teamName,
          rank: t.rank || null,
        },
        trackName,
        rank: t.rank || null,
      });
    });
  });

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (onProgress) {
      onProgress(i + 1, items.length, item.participant.name);
    }
    downloadSingleCertificate(item.participant, item.team, item.trackName, item.rank);
    // 300ms pause between downloads to ensure browser triggers multiple separate file downloads smoothly
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
}
