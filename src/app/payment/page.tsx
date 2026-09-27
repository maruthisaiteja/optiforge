"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import QRCode from "qrcode";
import {
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  ArrowRight,
  AlertCircle,
  QrCode,
  Terminal,
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

  // Dynamic QR Code Data URL
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "9490298994@axl";
  const upiPhone = process.env.NEXT_PUBLIC_UPI_PHONE || "9490298994";
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || "Pilli Maruthi Sai Teja";
  const amount = team?.paymentAmount || 200;
  const transactionNote = `OptiForge ${teamCode || "Team"}`;
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

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
        <div className="rounded-3xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Header: Amount & Team Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-border/60 pb-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-teal-accent font-semibold block">
                Registration Fee
              </span>
              <div className="font-display font-black text-3xl sm:text-4xl text-brand-white mt-1">
                ₹{amount}
              </div>
              <span className="text-xs text-brand-muted">
                ₹50 × {team?.membersCount || 3} members · {team?.trackName || "OptiForge 2026"}
              </span>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-dim block">
                Team Code
              </span>
              <span className="font-mono text-lg font-bold text-teal-accent">{teamCode}</span>
              {team?.teamName && (
                <div className="text-xs text-brand-white font-medium mt-0.5">{team.teamName}</div>
              )}
            </div>
          </div>

          {/* Unified Payment Center: QR Code & Transfer Details in a Single Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-6 rounded-2xl bg-bg-secondary/70 border border-navy-border/60">
            {/* Dynamic QR Code */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-teal-accent/30">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`UPI QR Code for ₹${amount}`}
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center text-xs font-mono text-brand-muted">
                    Generating QR...
                  </div>
                )}
              </div>
              <span className="text-[11px] font-mono text-brand-dim text-center">
                Scan via any UPI App
              </span>
            </div>

            {/* Direct Details with Copy Buttons */}
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-bg-primary border border-navy-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-brand-dim block">UPI ID</span>
                  <span className="text-xs font-bold text-teal-accent">{upiId}</span>
                </div>
                <button
                  type="button"
                  onClick={copyUpiId}
                  className="px-2.5 py-1 rounded-lg bg-teal-accent/15 text-teal-accent hover:bg-teal-accent/25 transition-colors flex items-center gap-1 text-[11px] font-semibold border border-teal-accent/30"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-status-green" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpi ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-bg-primary border border-navy-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-brand-dim block">Payee Name</span>
                  <span className="text-xs font-semibold text-brand-white">{upiName}</span>
                </div>
                <div className="w-5 h-5 rounded-full bg-status-green/15 text-status-green flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-bg-primary border border-navy-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-brand-dim block">PhonePe / GPay Number</span>
                  <span className="text-xs font-bold text-brand-white">{upiPhone}</span>
                </div>
                <button
                  type="button"
                  onClick={copyMobileNumber}
                  className="px-2.5 py-1 rounded-lg bg-teal-accent/15 text-teal-accent hover:bg-teal-accent/25 transition-colors flex items-center gap-1 text-[11px] font-semibold border border-teal-accent/30"
                >
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-status-green" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPhone ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-bg-primary border border-navy-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-brand-dim block">Transaction Note</span>
                  <span className="text-xs text-brand-white">{transactionNote}</span>
                </div>
                <button
                  type="button"
                  onClick={copyNote}
                  className="px-2.5 py-1 rounded-lg bg-bg-secondary text-brand-muted hover:text-brand-white transition-colors flex items-center gap-1 text-[11px] border border-navy-border"
                >
                  {copiedNote ? <Check className="w-3.5 h-3.5 text-status-green" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNote ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Single Form: 12-Digit UTR Verification */}
          <form onSubmit={handleSubmitUtr} className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-brand-white">
                  12-Digit UPI Reference Number (UTR) <span className="text-teal-accent">*</span>
                </label>
                <span className="font-mono text-[11px] text-teal-accent">{utrNumber.length}/12</span>
              </div>
              <input
                type="text"
                required
                maxLength={12}
                value={utrNumber}
                onChange={(e) => {
                  setUtrNumber(e.target.value.replace(/\D/g, ""));
                  setUtrError(null);
                }}
                placeholder="Enter 12-digit UTR from your payment receipt"
                className="w-full px-4 py-3.5 rounded-xl bg-bg-secondary border border-navy-border text-sm font-mono text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-teal-accent tracking-widest text-center"
              />
            </div>

            {utrError && (
              <div className="p-3 rounded-xl bg-status-red/15 border border-status-red/40 text-status-red text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{utrError}</span>
              </div>
            )}

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
                  <span>Confirm Payment &amp; Activate Team</span>
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
        /* ═══════════════════════════════════════════════════════
           SUCCESS — PAYMENT SUBMITTED, AWAITING ADMIN VERIFICATION
           Full inline styles for guaranteed visibility on dark bg
        ═══════════════════════════════════════════════════════ */
        <div
          className="rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl animate-fade-in relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0F1E35 0%, #0B1629 100%)",
            border: "1px solid #2FE6D680",
          }}
        >
          {/* Decorative glowing orbs */}
          <div
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, #2FE6D620 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, #7B5CFA20 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          {/* ── Header ── */}
          <div className="relative text-center space-y-3">
            <div
              className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #3ED598 0%, #2FE6D6 100%)",
                boxShadow: "0 0 40px #3ED59840",
              }}
            >
              <CheckCircle2 className="w-10 h-10" style={{ color: "#0B1629" }} />
            </div>
            <h1
              className="font-black text-2xl sm:text-3xl"
              style={{ fontFamily: "Sora, sans-serif", color: "#FFFFFF" }}
            >
              Registration Submitted!
            </h1>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono"
              style={{ backgroundColor: "#2FE6D615", border: "1px solid #2FE6D640", color: "#2FE6D6" }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ref: {receiptData?.receiptNumber || `RCP-VCE-${teamCode}`}</span>
            </div>
          </div>

          {/* ── Receipt Summary Grid ── */}
          <div
            className="relative rounded-2xl p-5 space-y-4"
            style={{ backgroundColor: "#0A1525", border: "1px solid #1E3A5F" }}
          >
            <div
              className="flex items-center gap-2 text-sm font-semibold pb-3"
              style={{ color: "#2FE6D6", borderBottom: "1px solid #1E3A5F" }}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Payment Receipt Summary</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              {[
                { label: "TEAM CODE", value: receiptData?.teamCode || teamCode, color: "#E8F4FD" },
                { label: "TEAM NAME", value: receiptData?.teamName || team?.teamName, color: "#2FE6D6" },
                { label: "AMOUNT PAID", value: `\u20B9${receiptData?.paymentAmount || team?.paymentAmount}`, color: "#3ED598" },
                { label: "UTR REFERENCE", value: receiptData?.paymentId || utrNumber, color: "#3ED598" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: "#0F1E35", border: "1px solid #1E3A5F" }}
                >
                  <span className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: "#5B7FA3" }}>
                    {item.label}
                  </span>
                  <span className="font-bold text-sm truncate block" style={{ color: item.color }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Awaiting Verification Banner ── */}
          <div
            className="relative rounded-2xl p-5 space-y-4 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #F59E0B20 0%, #D9770620 100%)",
              border: "1.5px solid #F59E0B60",
            }}
          >
            {/* Animated pulse ring */}
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative"
                style={{ backgroundColor: "#F59E0B30", border: "2px solid #F59E0B" }}
              >
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ backgroundColor: "#F59E0B30" }}
                />
                <ShieldCheck className="w-5 h-5 relative z-10" style={{ color: "#F59E0B" }} />
              </div>
              <div>
                <h3 className="font-bold text-base" style={{ color: "#FCD34D" }}>
                  Awaiting Admin Payment Verification
                </h3>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: "#FDE68A" }}>
                  Your UPI reference has been recorded. The{" "}
                  <span style={{ color: "#FCD34D", fontWeight: 700 }}>IEEE EMBS team</span> will verify your
                  payment and{" "}
                  <span style={{ color: "#FCD34D", fontWeight: 700 }}>email your login credentials</span>{" "}
                  within <span style={{ color: "#FCD34D", fontWeight: 700 }}>24 hours</span>.
                </p>
              </div>
            </div>

            <div
              className="rounded-xl p-4 space-y-2.5 text-sm"
              style={{ backgroundColor: "#00000030", border: "1px solid #F59E0B30" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg shrink-0">📧</span>
                <span style={{ color: "#FDE68A" }}>
                  Credentials will be sent to:{" "}
                  <strong style={{ color: "#FCD34D" }}>{team?.leaderEmail || "your registered email"}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg shrink-0">🔐</span>
                <span style={{ color: "#FDE68A" }}>
                  Login credentials are generated <strong style={{ color: "#FCD34D" }}>only after admin verifies</strong> your payment
                  — your account stays secure.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg shrink-0">📱</span>
                <span style={{ color: "#FDE68A" }}>
                  Urgent? WhatsApp:{" "}
                  <strong style={{ color: "#FCD34D" }}>9490298994</strong>
                </span>
              </div>
            </div>
          </div>

          {/* ── What Happens Next — Step Tracker ── */}
          <div className="space-y-4">
            <h3
              className="text-xs font-mono uppercase tracking-widest"
              style={{ color: "#5B7FA3" }}
            >
              What Happens Next
            </h3>
            <div className="space-y-3">
              {[
                {
                  step: "1",
                  text: "Admin verifies your UPI transaction (UTR) against bank records",
                  sub: "Already submitted ✓",
                  done: true,
                  color: "#3ED598",
                },
                {
                  step: "2",
                  text: "Secure login credentials are generated by the organizer",
                  sub: "Team Code + Password",
                  done: false,
                  color: "#5B7FA3",
                },
                {
                  step: "3",
                  text: "Credentials emailed to your registered leader email",
                  sub: team?.leaderEmail || "your email",
                  done: false,
                  color: "#5B7FA3",
                },
                {
                  step: "4",
                  text: "Log in to the OptiForge portal on 30 September 2026",
                  sub: "At the venue — Vardhaman College",
                  done: false,
                  color: "#5B7FA3",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-xl transition-all"
                  style={{
                    backgroundColor: item.done ? "#3ED59810" : "#0A1525",
                    border: `1px solid ${item.done ? "#3ED59840" : "#1E3A5F"}`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                    style={{
                      backgroundColor: item.done ? "#3ED598" : "#1E3A5F",
                      color: item.done ? "#0B1629" : "#5B7FA3",
                      boxShadow: item.done ? "0 0 16px #3ED59860" : "none",
                    }}
                  >
                    {item.done ? "✓" : item.step}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: item.done ? "#3ED598" : "#E8F4FD" }}>
                      {item.text}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#5B7FA3" }}>
                      {item.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Event Date Reminder ── */}
          <div
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{
              background: "linear-gradient(135deg, #7B5CFA20 0%, #2FE6D620 100%)",
              border: "1px solid #7B5CFA40",
            }}
          >
            <div className="text-3xl shrink-0">📅</div>
            <div>
              <p className="font-bold text-sm" style={{ color: "#C4B5FD" }}>
                Event Day: 30 September 2026
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#A78BFA" }}>
                Vardhaman College of Engineering · 10:00 AM onwards · Bring your team ID
              </p>
            </div>
          </div>

          {/* ── CTAs ── */}
          <div className="flex flex-col sm:flex-row items-center gap-3 relative">
            <Link
              href="/"
              className="w-full py-4 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #2FE6D6 0%, #7B5CFA 100%)",
                color: "#0B1629",
                boxShadow: "0 0 24px #2FE6D640",
              }}
            >
              <span>Return to OptiForge 2026</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/leaderboard"
              className="w-full py-4 rounded-xl font-semibold text-sm text-center transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "#0A1525",
                border: "1px solid #1E3A5F",
                color: "#8EAFD4",
              }}
            >
              View Public Leaderboard
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
