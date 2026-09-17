"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import QRCode from "qrcode";
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  ArrowRight,
  AlertCircle,
  QrCode,
  Smartphone,
  ExternalLink,
  HelpCircle,
  Terminal,
  Building,
  ChevronDown,
  ChevronUp,
  Download,
  Phone,
  Sparkles,
} from "lucide-react";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const teamCode = searchParams.get("teamCode") || "";

  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);

  // UTR Form State
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState<string | null>(null);
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [showUtrHelp, setShowUtrHelp] = useState(false);

  // Dynamic QR Code Data URL
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "9490298994@axl";
  const upiPhone = process.env.NEXT_PUBLIC_UPI_PHONE || "9490298994";
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || "Pilli Maruthi Sai Teja";
  const amount = team?.paymentAmount || 150;
  const transactionNote = `OptiForge ${teamCode || "Team"}`;
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  const gpayUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  const paytmUri = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  // Auto-recover teamCode from localStorage if visited without URL params
  useEffect(() => {
    if (!teamCode && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("optiforge_pending_team_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.teamCode) {
            router.replace(
              `/payment?teamCode=${parsed.teamCode}${parsed.token ? `&token=${encodeURIComponent(parsed.token)}` : ""}`
            );
          }
        }
      } catch {}
    }
  }, [teamCode, router]);

  useEffect(() => {
    if (!teamCode) {
      setLoading(false);
      return;
    }

    let cachedToken = searchParams.get("token") || "";
    if (!cachedToken && typeof window !== "undefined") {
      try {
        cachedToken = sessionStorage.getItem(`optiforge_reg_${teamCode}`) || "";
      } catch {}
    }
    const tokenQuery = cachedToken ? `&token=${encodeURIComponent(cachedToken)}` : "";

    // Fetch team info from public endpoint
    fetch(`/api/payment/team-info?teamCode=${encodeURIComponent(teamCode)}${tokenQuery}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setFetchError(data.error || "Team not found. Please register first.");
          setLoading(false);
          return;
        }

        setTeam(data);
        if (data.paymentStatus === "CONFIRMED") {
          setPaidSuccess(true);
          setReceiptData({
            teamCode: data.teamCode,
            teamName: data.teamName,
            paymentAmount: data.paymentAmount,
            paymentId: data.razorpayPaymentId || "Verified",
            receiptNumber: data.receiptNumber || `RCP-VCE-${data.teamCode}`,
            organizer: data.organizer || "IEEE Vardhaman Student Branch",
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setFetchError("Unable to load team details. Please check your internet connection.");
        setLoading(false);
      });
  }, [teamCode, searchParams]);

  // Generate QR Code when UPI URI is ready
  useEffect(() => {
    if (teamCode && upiUri) {
      QRCode.toDataURL(upiUri, {
        width: 280,
        margin: 2,
        color: {
          dark: "#0B0F1A",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Error generating QR", err));
    }
  }, [teamCode, upiUri]);

  const copyMobileNumber = () => {
    navigator.clipboard.writeText(upiPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const copyNote = () => {
    navigator.clipboard.writeText(transactionNote);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const downloadQrCode = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `OptiForge-UPI-QR-${teamCode || "payment"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyTeamCode = () => {
    navigator.clipboard.writeText(receiptData?.teamCode || teamCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyDefaultPass = () => {
    const rawPass = `Forge#${(receiptData?.teamCode || teamCode).split("-")[2] || "2026"}`;
    navigator.clipboard.writeText(rawPass);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleSubmitUtr = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUtrError(null);

    const cleanUtr = utrNumber.replace(/\D/g, "");
    if (cleanUtr.length !== 12) {
      setUtrError("Please enter the complete 12-digit UPI Reference (UTR) Number from your payment receipt.");
      return;
    }

    setSubmittingUtr(true);

    try {
      let cachedToken = searchParams.get("token") || "";
      if (!cachedToken && typeof window !== "undefined") {
        try {
          cachedToken = sessionStorage.getItem(`optiforge_reg_${teamCode}`) || "";
        } catch {}
      }

      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamCode,
          utrNumber: cleanUtr,
          token: cachedToken || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setUtrError(data.error || "Verification failed. Please double-check your UTR number.");
        setSubmittingUtr(false);
        return;
      }

      // Update saved pending team in localStorage
      try {
        const saved = localStorage.getItem("optiforge_pending_team_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.paymentStatus = "CONFIRMED";
          parsed.utrNumber = cleanUtr;
          localStorage.setItem("optiforge_pending_team_v1", JSON.stringify(parsed));
        }
      } catch {}

      setPaidSuccess(true);
      setReceiptData(data);
      setSubmittingUtr(false);

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.55 },
        colors: ["#2FE6D6", "#7B5CFA", "#3ED598"],
      });
    } catch {
      setUtrError("Network error verifying transaction. Please try again.");
      setSubmittingUtr(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-teal-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-brand-muted">Loading team registration details...</p>
      </div>
    );
  }

  if (!teamCode) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-status-red mx-auto" />
        <h2 className="font-display font-bold text-xl text-brand-white">No Team Code Provided</h2>
        <p className="text-xs text-brand-muted">Please register a team first to complete payment.</p>
        <Link
          href="/register"
          className="inline-block px-5 py-2.5 rounded-xl bg-gradient-signature text-bg-primary font-semibold text-xs"
        >
          Go to Registration
        </Link>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-status-red mx-auto" />
        <h2 className="font-display font-bold text-xl text-brand-white">Team Verification Notice</h2>
        <p className="text-xs text-status-red bg-status-red/10 border border-status-red/30 p-3 rounded-xl">
          {fetchError}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl bg-gradient-signature text-bg-primary font-semibold text-xs"
          >
            Register Team
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-brand-white text-xs"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {!paidSuccess ? (
        <div className="rounded-3xl bg-bg-card border border-navy-border/80 p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-accent/15 border border-teal-accent/30 flex items-center justify-center text-teal-accent mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-white">
              Complete Registration Fee via UPI
            </h1>
            <p className="text-xs text-brand-muted">
              Direct UPI transfer · Zero gateway fees · Instant team activation
            </p>
          </div>

          {/* Fee & Payee Summary Card */}
          <div className="p-5 rounded-2xl bg-navy-deep/40 border border-teal-accent/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-border/60 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-teal-accent font-semibold block">
                  Amount Payable
                </span>
                <div className="font-display font-black text-3xl sm:text-4xl text-brand-white mt-0.5">
                  ₹{amount}
                </div>
                <span className="text-[11px] text-brand-muted">
                  (₹50 × {team?.membersCount || 3} members · OptiForge 2026)
                </span>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-dim block">
                  Team ID
                </span>
                <span className="font-mono text-base font-bold text-teal-accent">{teamCode}</span>
                {team?.teamName && (
                  <div className="text-xs text-brand-white font-medium truncate max-w-[200px]">
                    {team.teamName}
                  </div>
                )}
                {team?.trackName && (
                  <div className="text-[10px] text-brand-dim truncate max-w-[200px]">
                    {team.trackName}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg-secondary/70 border border-navy-border/50">
                <span className="text-brand-muted">Payee Name:</span>
                <span className="font-semibold text-brand-white">{upiName}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg-secondary/70 border border-navy-border/50">
                <span className="text-brand-muted">PhonePe / UPI ID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-teal-accent">{upiId}</span>
                  <button
                    onClick={copyUpiId}
                    type="button"
                    className="p-1 text-brand-muted hover:text-brand-white transition-colors"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-status-green" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 1: PAYMENT OPTIONS */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-accent uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-teal-accent text-bg-primary flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Make the UPI Payment</span>
            </div>

            {/* PhonePe Decline Resolution Alert Box */}
            <div className="p-4 rounded-2xl bg-electric-violet/15 border border-electric-violet/35 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-electric-violet font-mono">
                <AlertCircle className="w-4 h-4 text-electric-violet shrink-0" />
                <span>PhonePe Users: Encountered &quot;Declined for security reasons&quot;?</span>
              </div>
              <p className="text-[12px] text-brand-white/90 leading-relaxed">
                PhonePe automatically declines browser web links to personal bank accounts for anti-phishing safety.
                As PhonePe suggests, use <strong className="text-teal-accent">Option 1 (Pay to Mobile: 9490298994)</strong> or <strong className="text-teal-accent">Option 2 (Download QR to Phone Scanner)</strong> below. Both transfer directly inside PhonePe with 100% success!
              </p>
            </div>

            {/* OPTION 1: DIRECT MOBILE NUMBER OR UPI ID TRANSFER (Guaranteed 0% Decline) */}
            <div className="p-5 rounded-2xl bg-bg-secondary/80 border border-teal-accent/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-navy-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-accent/20 text-teal-accent flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-brand-white uppercase tracking-wider font-mono">
                      Option 1: Pay to Mobile Number or UPI ID
                    </h3>
                    <span className="text-[10px] text-teal-accent font-semibold">
                      ★ Recommended for PhonePe &amp; Google Pay (Zero Decline Risk)
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3.5 rounded-xl bg-navy-deep/60 border border-navy-border/60 text-xs font-mono space-y-2">
                <div className="flex items-center gap-2 text-brand-white">
                  <span className="w-4 h-4 rounded-full bg-teal-accent text-bg-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>In PhonePe / GPay: Tap <strong>&quot;To Mobile Number&quot;</strong> (or <strong>&quot;To UPI ID&quot;</strong>)</span>
                </div>
                <div className="flex items-center gap-2 text-brand-white">
                  <span className="w-4 h-4 rounded-full bg-teal-accent text-bg-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>Enter <strong>9490298994</strong> (Verify Name: <strong>Pilli Maruthi Sai Teja</strong>)</span>
                </div>
                <div className="flex items-center gap-2 text-brand-white">
                  <span className="w-4 h-4 rounded-full bg-teal-accent text-bg-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>Pay <strong>₹{amount}</strong> (Add Note: <strong>{transactionNote}</strong>)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Mobile Number Copy Card */}
                <div className="p-3.5 rounded-xl bg-bg-primary border border-navy-border flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono text-brand-dim block">PhonePe / GPay Mobile</span>
                    <span className="font-mono text-sm font-bold text-brand-white">{upiPhone}</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyMobileNumber}
                    className="px-3 py-1.5 rounded-lg bg-teal-accent/15 hover:bg-teal-accent/25 text-teal-accent text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 border border-teal-accent/30"
                  >
                    {copiedPhone ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-status-green" />
                        <span className="text-status-green">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Mobile</span>
                      </>
                    )}
                  </button>
                </div>

                {/* UPI ID Copy Card */}
                <div className="p-3.5 rounded-xl bg-bg-primary border border-navy-border flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono text-brand-dim block">Official UPI ID</span>
                    <span className="font-mono text-xs font-bold text-teal-accent truncate max-w-[140px] block">{upiId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    className="px-3 py-1.5 rounded-lg bg-teal-accent/15 hover:bg-teal-accent/25 text-teal-accent text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 border border-teal-accent/30"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-status-green" />
                        <span className="text-status-green">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy UPI ID</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Note Copy Card */}
              <div className="p-3 rounded-xl bg-bg-primary/80 border border-navy-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-mono text-brand-dim block">Transaction Message / Note</span>
                  <span className="font-mono text-xs font-medium text-brand-white">{transactionNote}</span>
                </div>
                <button
                  type="button"
                  onClick={copyNote}
                  className="px-2.5 py-1 rounded bg-bg-secondary hover:bg-navy-deep text-brand-muted hover:text-brand-white text-[11px] font-mono transition-colors flex items-center gap-1 border border-navy-border"
                >
                  {copiedNote ? <Check className="w-3 h-3 text-status-green" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedNote ? "Copied" : "Copy Note"}</span>
                </button>
              </div>
            </div>

            {/* OPTION 2: SCAN DYNAMIC QR (Desktop Camera OR Mobile Gallery Scanner) */}
            <div className="p-6 rounded-2xl bg-bg-secondary/60 border border-navy-border/60 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-accent/20 text-orange-accent flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-brand-white uppercase tracking-wider font-mono">
                    Option 2: Scan Dynamic UPI QR Code
                  </h3>
                  <span className="text-[10px] text-brand-muted">
                    Scan via Camera (Desktop/Laptop) or Download to Gallery (Same Mobile)
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-teal-accent/40">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`UPI QR Code to pay ₹${amount} to ${upiId}`}
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-xs font-mono text-brand-muted">
                      Generating dynamic QR...
                    </div>
                  )}
                </div>

                {/* Mobile Download QR button */}
                <div className="w-full max-w-sm space-y-2">
                  <button
                    type="button"
                    onClick={downloadQrCode}
                    className="w-full py-2.5 px-4 rounded-xl bg-navy-deep hover:bg-teal-accent/20 border border-teal-accent/30 text-teal-accent text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download QR for PhonePe / GPay Scanner</span>
                  </button>
                  <p className="text-[10px] text-center text-brand-dim font-mono">
                    📱 In PhonePe / GPay: Tap Scanner icon → Tap Gallery/Photo icon → Select this QR image.
                  </p>
                </div>
              </div>
            </div>

            {/* OPTION 3: ONE-TAP APP LAUNCHERS */}
            <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-navy-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-brand-dim font-bold">
                  Option 3: Launch Installed UPI Apps
                </span>
                <span className="text-[10px] text-brand-dim">(Google Pay, Paytm, BHIM)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                <a
                  href={gpayUri}
                  className="py-2.5 px-3 rounded-xl bg-bg-primary hover:bg-navy-deep border border-navy-border text-brand-white text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google Pay</span>
                </a>
                <a
                  href={paytmUri}
                  className="py-2.5 px-3 rounded-xl bg-bg-primary hover:bg-navy-deep border border-navy-border text-brand-white text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Paytm</span>
                </a>
                <a
                  href={upiUri}
                  className="py-2.5 px-3 rounded-xl bg-bg-primary hover:bg-navy-deep border border-navy-border text-brand-white text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Other UPI Apps</span>
                </a>
              </div>
            </div>
          </div>

          {/* STEP 2: ENTER 12-DIGIT UTR NUMBER */}
          <form onSubmit={handleSubmitUtr} className="space-y-4 pt-4 border-t border-navy-border/60">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-accent uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-teal-accent text-bg-primary flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Submit 12-Digit UPI Ref / UTR Number</span>
            </div>

            <p className="text-xs text-brand-muted">
              Once your payment is complete, enter the 12-digit transaction/UTR number from your UPI receipt to activate your team credentials.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-brand-white">
                12-Digit UPI Reference Number (UTR) <span className="text-teal-accent">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={12}
                value={utrNumber}
                onChange={(e) => {
                  setUtrNumber(e.target.value.replace(/\D/g, ""));
                  setUtrError(null);
                }}
                placeholder="e.g. 512165830063"
                className="w-full px-4 py-3 rounded-xl bg-bg-secondary border border-navy-border text-sm font-mono text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-teal-accent tracking-widest text-center"
              />
              <div className="flex items-center justify-between text-[11px] text-brand-dim">
                <span>Must be exactly 12 digits from your UPI transaction receipt</span>
                <span className="font-mono text-teal-accent">{utrNumber.length}/12</span>
              </div>
            </div>

            {utrError && (
              <div className="p-3 rounded-xl bg-status-red/15 border border-status-red/40 text-status-red text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{utrError}</span>
              </div>
            )}

            {/* Where to find UTR help drawer */}
            <div className="rounded-xl bg-bg-secondary/40 border border-navy-border/50 p-3 text-xs space-y-2">
              <button
                type="button"
                onClick={() => setShowUtrHelp(!showUtrHelp)}
                className="w-full flex items-center justify-between text-brand-muted hover:text-teal-accent transition-colors font-mono text-[11px]"
              >
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Where do I find the 12-digit UTR in my UPI app?</span>
                </span>
                {showUtrHelp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showUtrHelp && (
                <div className="pt-2 border-t border-navy-border/40 space-y-1.5 text-[11px] text-brand-dim font-mono animate-fade-in">
                  <p>• <span className="text-brand-white font-semibold">Google Pay:</span> Open transaction details → look for <span className="text-teal-accent">UPI transaction ID</span> (12 digits).</p>
                  <p>• <span className="text-brand-white font-semibold">PhonePe:</span> Open payment receipt → look for <span className="text-teal-accent">UTR</span> under Transfer Details.</p>
                  <p>• <span className="text-brand-white font-semibold">Paytm:</span> Open transaction → look for <span className="text-teal-accent">UPI Ref No</span>.</p>
                  <p>• <span className="text-brand-white font-semibold">BHIM:</span> Look for <span className="text-teal-accent">Transaction ID / UTR</span>.</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submittingUtr || utrNumber.length !== 12}
              className="w-full py-4 rounded-xl bg-gradient-signature text-bg-primary font-display font-bold text-sm shadow-glow hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submittingUtr ? (
                <>
                  <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Transaction...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify UTR & Activate Team Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-[11px] text-brand-dim flex items-center justify-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-status-green" />
              Verified IEEE Vardhaman Student Branch · Direct Settlement
            </span>
          </div>
        </div>
      ) : (
        /* SUCCESS CONFIRMATION & CREDENTIALS RECEIPT */
        <div className="rounded-3xl bg-bg-card border border-status-green/40 p-6 sm:p-10 space-y-8 shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-status-green/20 border border-status-green/40 flex items-center justify-center text-status-green mx-auto shadow-glow">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-white">
              Registration Confirmed!
            </h1>
            <p className="text-xs text-brand-muted font-mono">
              Receipt No: <span className="text-teal-accent">{receiptData?.receiptNumber}</span>
            </p>
          </div>

          {/* Credentials Card */}
          <div className="p-6 rounded-2xl bg-bg-secondary border border-teal-accent/30 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-border/60 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-teal-accent">
                <Terminal className="w-4 h-4" />
                <span>Your Official Team Credentials</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyTeamCode}
                  className="flex items-center gap-1 text-[11px] font-mono text-brand-muted hover:text-brand-white px-2 py-1 rounded bg-bg-primary border border-navy-border"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-status-green" />
                      <span className="text-status-green">Copied Code</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Team ID</span>
                    </>
                  )}
                </button>
                <button
                  onClick={copyDefaultPass}
                  className="flex items-center gap-1 text-[11px] font-mono text-brand-muted hover:text-brand-white px-2 py-1 rounded bg-bg-primary border border-navy-border"
                >
                  {copiedPass ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-status-green" />
                      <span className="text-status-green">Copied Pass</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Password</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-bg-primary border border-navy-border">
                <span className="text-brand-dim text-[10px] block uppercase">Team ID</span>
                <span className="text-sm font-bold text-brand-white">{receiptData?.teamCode || teamCode}</span>
              </div>
              <div className="p-3 rounded-lg bg-bg-primary border border-navy-border">
                <span className="text-brand-dim text-[10px] block uppercase">Team Name</span>
                <span className="text-sm font-bold text-teal-accent">{receiptData?.teamName || team?.teamName}</span>
              </div>
              <div className="p-3 rounded-lg bg-bg-primary border border-navy-border">
                <span className="text-brand-dim text-[10px] block uppercase">Default Password</span>
                <span className="text-sm font-bold text-brand-white">Forge#{(receiptData?.teamCode || teamCode).split("-")[2] || "2026"}</span>
              </div>
              <div className="p-3 rounded-lg bg-bg-primary border border-navy-border">
                <span className="text-brand-dim text-[10px] block uppercase">UPI Reference / UTR</span>
                <span className="text-xs text-status-green font-mono truncate block">
                  {receiptData?.paymentId || utrNumber || "512165830063"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-brand-muted leading-relaxed">
              Your registration has been officially confirmed and activated by{" "}
              <span className="text-brand-white font-semibold">IEEE Vardhaman Student Branch</span>. Keep your
              Team ID and Password safe to access your team dashboard and starter materials.
            </p>
          </div>

          {/* Navigation CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/dashboard"
              className="w-full py-3.5 rounded-xl bg-gradient-signature text-bg-primary font-display font-bold text-sm shadow-glow text-center hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <span>Go to Team Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/leaderboard"
              className="w-full py-3.5 rounded-xl bg-bg-secondary hover:bg-navy-deep border border-navy-border text-brand-white text-xs font-mono text-center transition-colors"
            >
              View Standings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto py-24 text-center">
          <div className="w-8 h-8 border-2 border-teal-accent border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
