import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const user = process.env.SMTP_USER;
  const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
  const port = parseInt(process.env.SMTP_PORT || "587", 10);

  if (!user || !pass) {
    console.warn("[OptiForge Email] Missing SMTP_USER or SMTP_PASS environment variables.");
    return null;
  }

  if (host.includes("gmail.com")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

export interface TeamEmailPayload {
  teamCode: string;
  teamName: string;
  leaderEmail: string;
  domainId?: string | null;
  rawPassword: string;
  members?: Array<{ name: string; email: string; rollNumber?: string; branch?: string }>;
}

export async function sendTeamCredentialsEmail(team: TeamEmailPayload): Promise<{
  success: boolean;
  recipients: string[];
  messageId?: string;
  error?: string;
}> {
  const transporter = getTransporter();
  if (!transporter) {
    return {
      success: false,
      recipients: [],
      error: "SMTP transporter not configured. Please set SMTP_USER and SMTP_PASS in environment.",
    };
  }

  // Deduplicate and sanitize recipient email addresses
  const allEmails = new Set<string>();
  if (team.leaderEmail && team.leaderEmail.includes("@")) {
    allEmails.add(team.leaderEmail.trim().toLowerCase());
  }
  if (Array.isArray(team.members)) {
    team.members.forEach((m) => {
      if (m.email && m.email.includes("@")) {
        allEmails.add(m.email.trim().toLowerCase());
      }
    });
  }

  const recipients = Array.from(allEmails);
  if (recipients.length === 0) {
    return { success: false, recipients: [], error: "No valid recipient email addresses found for team." };
  }

  const portalUrl = process.env.NEXT_PUBLIC_APP_URL || "https://optiforge-2026.vercel.app";
  const loginUrl = `${portalUrl}/login`;

  const trackLabels: Record<string, string> = {
    "theme-1-biomedical-ai": "01: Biomedical Artificial Intelligence (IEEE EMBS × CIS)",
    "theme-2-signals": "02: Biomedical Signals & Intelligent Systems (IEEE EMBS)",
    "theme-3-imaging": "03: Medical Imaging & Computer Vision (IEEE EMBS)",
    "theme-4-ml-ai": "04: Machine Learning & Artificial Intelligence (IEEE CIS)",
    "theme-5-autonomous": "05: Intelligent Systems & Autonomous Computing (IEEE CIS)",
    "theme-6-open-innovation": "06: Open Innovation: CIS × EMBS (IEEE EMBS × CIS)",
  };

  const trackName = team.domainId && trackLabels[team.domainId]
    ? trackLabels[team.domainId]
    : "Track Assigned upon Check-In";

  const memberRows = (team.members || [])
    .map(
      (m, idx) => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 10px 14px; font-size: 13px; color: #1E293B; font-weight: 600;">${idx + 1}. ${m.name}</td>
        <td style="padding: 10px 14px; font-size: 12px; color: #475569; font-family: monospace;">${m.rollNumber || "—"}</td>
        <td style="padding: 10px 14px; font-size: 12px; color: #475569;">${m.branch || "—"}</td>
        <td style="padding: 10px 14px; font-size: 12px; color: #0284C7;">${m.email}</td>
      </tr>`
    )
    .join("");

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OptiForge 2026 — Registration Confirmed & Login Credentials</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 12px; background-color: #F8FAFC;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #CBD5E1; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);" cellspacing="0" cellpadding="0">
          
          <!-- Top Header Strip -->
          <tr>
            <td style="background: linear-gradient(135deg, #0A2540 0%, #00629B 50%, #12A8C4 100%); padding: 32px 30px; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; background-color: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); color: #E0F2FE; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                      Official Registration Confirmation
                    </span>
                    <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 900; margin: 12px 0 4px 0; letter-spacing: -0.5px;">
                      OptiForge 2026
                    </h1>
                    <p style="color: #BAE6FD; font-size: 13px; margin: 0; font-weight: 500;">
                      IEEE EMBS × IEEE CIS · Vardhaman College of Engineering
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 30px;">
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
                Dear <strong>${team.teamName}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Your registration and payment verification for <strong>OptiForge 2026</strong> has been officially confirmed! Below are your exclusive, secure team credentials for accessing the OptiForge Challenge Portal and Autonomous AI Evaluation Console.
              </p>

              <!-- Credentials Box -->
              <table role="presentation" width="100%" style="background: #F0F9FF; border: 1.5px solid #0284C7; border-radius: 14px; margin-bottom: 26px; overflow: hidden;" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 11px; font-weight: 800; color: #0369A1; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                      🔒 Official Team Login Credentials
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="6">
                      <tr>
                        <td width="35%" style="font-size: 13px; color: #64748B; font-weight: 600;">Team Code / ID:</td>
                        <td style="font-size: 16px; color: #0A2540; font-weight: 800; font-family: monospace;">${team.teamCode}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #64748B; font-weight: 600;">Login Password:</td>
                        <td style="font-size: 16px; color: #0284C7; font-weight: 800; font-family: monospace; letter-spacing: 0.5px;">${team.rawPassword}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #64748B; font-weight: 600;">Assigned Track:</td>
                        <td style="font-size: 13px; color: #0F172A; font-weight: 700;">${trackName}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #64748B; font-weight: 600;">Login Portal:</td>
                        <td style="font-size: 13px;">
                          <a href="${loginUrl}" target="_blank" style="color: #0284C7; font-weight: 700; text-decoration: underline;">
                            ${loginUrl}
                          </a>
                        </td>
                      </tr>
                    </table>

                    <div style="margin-top: 18px; text-align: center;">
                      <a href="${loginUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #00629B 0%, #12A8C4 100%); color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 98, 155, 0.25);">
                        Open Team Dashboard &rarr;
                      </a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Pre-Event Important Notice -->
              <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 14px 16px; margin-bottom: 26px;">
                <div style="font-size: 12px; font-weight: 800; color: #92400E; text-transform: uppercase; margin-bottom: 4px;">
                  ⚠️ Important Pre-Event Notice: Submissions Locked Until Event Day
                </div>
                <p style="font-size: 12px; line-height: 1.5; color: #78350F; margin: 0;">
                  You can log in now to review your team profile, registered members, and challenge requirements. Code evaluation submissions will officially unlock tomorrow when the hackathon begins (<strong>30 September 2026 at 9:00 AM IST</strong>).
                </p>
              </div>

              <!-- Event Schedule & Venue -->
              <table role="presentation" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 26px;" cellspacing="0" cellpadding="14">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; color: #0F172A; margin-bottom: 6px;">
                      📍 Event Information
                    </div>
                    <div style="font-size: 13px; color: #334155; line-height: 1.6;">
                      <strong>Date:</strong> 30th September 2026 (Wednesday)<br>
                      <strong>Reporting Time:</strong> 08:30 AM IST (Inaugural at 09:00 AM)<br>
                      <strong>Venue:</strong> Vardhaman College of Engineering, Kacharam, Shamshabad, Hyderabad<br>
                      <strong>What to Bring:</strong> College ID Cards, Laptops & Chargers, GitHub accounts ready.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Registered Team Members Table -->
              <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 10px;">
                👥 Registered Team Roster (${team.members?.length || 1} Members)
              </div>
              <table role="presentation" width="100%" style="border: 1px solid #CBD5E1; border-radius: 10px; border-collapse: collapse; margin-bottom: 24px;" cellspacing="0" cellpadding="0">
                <thead>
                  <tr style="background-color: #F1F5F9; border-bottom: 1px solid #CBD5E1;">
                    <th align="left" style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Member</th>
                    <th align="left" style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Roll No</th>
                    <th align="left" style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Branch</th>
                    <th align="left" style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Email</th>
                  </tr>
                </thead>
                <tbody>
                  ${memberRows}
                </tbody>
              </table>

              <p style="font-size: 12px; color: #64748B; line-height: 1.5; margin: 0;">
                If you encounter any login or portal issues, reply directly to this email or visit the Help Desk at the registration venue.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 30px; text-align: center;">
              <p style="font-size: 11px; color: #94A3B8; margin: 0 0 6px 0; font-weight: 600;">
                OptiForge 2026 · IEEE EMBS Student Branch Chapter × IEEE Computational Intelligence Society
              </p>
              <p style="font-size: 11px; color: #94A3B8; margin: 0; line-height: 1.4;">
                Vardhaman College of Engineering (Autonomous), Shamshabad, Hyderabad.<br>
                This is an automated institutional message sent to registered hackathon participants.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const plainText = `
OptiForge 2026 — Registration Confirmed & Login Credentials

Dear ${team.teamName},

Your registration for OptiForge 2026 has been officially confirmed!

OFFICIAL LOGIN CREDENTIALS:
- Portal URL: ${loginUrl}
- Team Code: ${team.teamCode}
- Password: ${team.rawPassword}
- Assigned Track: ${trackName}

PRE-EVENT NOTICE:
Submissions are locked until Event Day (30 September 2026 at 9:00 AM IST). You can log in now to review your team dashboard and challenge details.

EVENT DETAILS:
- Date: 30 September 2026
- Reporting Time: 08:30 AM IST
- Venue: Vardhaman College of Engineering, Hyderabad

Registered Team Members:
${(team.members || []).map((m, idx) => `${idx + 1}. ${m.name} (${m.rollNumber || "N/A"}) - ${m.email}`).join("\n")}

Best regards,
OptiForge 2026 Organizing Committee
IEEE EMBS × IEEE CIS · Vardhaman College of Engineering
  `.trim();

  const senderFrom = process.env.SMTP_FROM || `"OptiForge 2026" <${process.env.SMTP_USER}>`;

  try {
    const info = await transporter.sendMail({
      from: senderFrom,
      to: recipients.join(", "),
      subject: `OptiForge 2026 — Registration Confirmed & Team Credentials (${team.teamCode})`,
      text: plainText,
      html: emailHtml,
    });

    return {
      success: true,
      recipients,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error(`[OptiForge Email] Failed to send credentials email to team ${team.teamCode}:`, err);
    return {
      success: false,
      recipients,
      error: err?.message || "Failed to send email via SMTP.",
    };
  }
}
