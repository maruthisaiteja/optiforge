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
} from "lucide-react";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const teamCode = searchParams.get("teamCode") || "";

  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // UTR Form State
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState<string | null>(null);
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [showUtrHelp, setShowUtrHelp] = useState(false);

  // Dynamic QR Code Data URL
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "9490298994@axl";
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || "Maruthi Sai Teja";
  const amount = team?.paymentAmount || 150;
  const transactionNote = `OptiForge ${teamCode}`;
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  useEffect(() => {
    if (!teamCode) {
      setLoading(false);
      return;
    }

    // Fetch team info
    fetch(`/api/admin/overview`)
      .then((res) => (res.ok ? res.json() : null))
      .then((ov) => {
        if (ov?.teams) {
          const found = ov.teams.find((t: any) => t.teamCode === teamCode);
          if (found) {
            setTeam(found);
            if (found.paymentStatus === "CONFIRMED") {
              setPaidSuccess(true);
              setReceiptData({
                teamCode: found.teamCode,
                teamName: found.teamName,
                paymentAmount: found.paymentAmount,
                paymentId: found.razorpayPaymentId || "pay_prior_confirmed",
                receiptNumber: `RCP-VCE-${found.teamCode}`,
                organizer: "IEEE Vardhaman Student Branch",
              });
            }
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [teamCode]);

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

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const copyTeamCode = () => {
    navigator.clipboard.writeText(receiptData?.teamCode || teamCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSubmitUtr = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUtrError(null);

    const cleanUtr = utrNumber.replace(/\D/g, "");
    if (cleanUtr.length !== 12) {
      setUtrError("Please enter the complete 12-digit UPI Reference (UTR) Number from your payment details.");
      return;
    }

    setSubmittingUtr(true);

    try {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamCode,
          utrNumber: cleanUtr,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setUtrError(data.error || "Verification failed. Please double-check your UTR number.");
        setSubmittingUtr(false);
        return;
      }

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

  const handleInstantSandbox = async () => {
    setSubmittingUtr(true);
    setUtrError(null);

    try {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamCode,
          isSimulated: true,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setUtrError(data.error || "Sandbox verification failed.");
        setSubmittingUtr(false);
        return;
      }

      setPaidSuccess(true);
      setReceiptData(data);
      setSubmittingUtr(false);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.55 },
        colors: ["#2FE6D6", "#7B5CFA", "#3ED598"],
      });
    } catch {
      setUtrError("Network error during sandbox verification.");
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
                  (₹50 × {team?.members?.length || 3} members · OptiForge 2026)
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
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg-secondary/70 border border-navy-border/50">
                <span className="text-brand-muted">Payee Name:</span>
                <span className="font-semibold text-brand-white">{upiName}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg-secondary/70 border border-navy-border/50">
                <span className="text-brand-muted">UPI ID:</span>
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

          {/* STEP 1: PAYMENT OPTIONS (Mobile Intent & Desktop QR) */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-accent uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-teal-accent text-bg-primary flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Make the UPI Payment</span>
            </div>

            {/* Mobile One-Tap Payment Button */}
            <div className="block sm:hidden space-y-2">
              <a
                href={upiUri}
                className="w-full py-4 px-4 rounded-xl bg-gradient-signature text-bg-primary font-display font-bold text-sm shadow-glow hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Pay ₹{amount} via Any UPI App</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-[11px] text-center text-brand-muted">
                Tap to launch Google Pay, PhonePe, Paytm, or BHIM directly with pre-filled amount.
              </p>
            </div>

            {/* Desktop Dynamic QR Code Display */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-bg-secondary/60 border border-navy-border/60 space-y-4">
              <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-teal-accent/40">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`UPI QR Code to pay ₹${amount} to ${upiId}`}
                    className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center text-xs font-mono text-brand-muted">
                    Generating dynamic QR...
                  </div>
                )}
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs font-medium text-brand-white">
                  Scan this QR code using <span className="text-teal-accent font-semibold">Google Pay, PhonePe, Paytm, or BHIM</span>
                </p>
                <p className="text-[11px] font-mono text-brand-dim">
                  Transaction Note: <span className="text-teal-accent">{transactionNote}</span>
                </p>
              </div>

              {/* Mobile intent button also available on desktop for laptops with UPI apps */}
              <div className="hidden sm:block">
                <a
                  href={upiUri}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-deep hover:bg-teal-accent/20 border border-teal-accent/30 text-teal-accent text-xs font-mono transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Click to Pay Directly on this Device</span>
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
              Once your payment is successful, enter the 12-digit transaction/UTR number to instantly unlock your team dashboard.
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
                placeholder="e.g. 426189341029"
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
                  <p>• <span className="text-brand-white font-semibold">Google Pay:</span> Open payment details $\rightarrow$ look for <span className="text-teal-accent">UPI transaction ID</span> (12 digits).</p>
                  <p>• <span className="text-brand-white font-semibold">PhonePe:</span> Open payment receipt $\rightarrow$ look for <span className="text-teal-accent">UTR</span> under Transfer Details.</p>
                  <p>• <span className="text-brand-white font-semibold">Paytm:</span> Open transaction $\rightarrow$ look for <span className="text-teal-accent">UPI Ref No</span>.</p>
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

            {/* Instant Sandbox Simulator Button for Dev Testing */}
            <button
              type="button"
              onClick={handleInstantSandbox}
              disabled={submittingUtr}
              className="w-full py-2.5 rounded-xl bg-bg-secondary hover:bg-navy-deep border border-navy-border/60 text-brand-dim hover:text-teal-accent text-xs font-mono transition-colors text-center block"
            >
              ⚡ Instant Sandbox Verification (Zero-Friction Dev Mode)
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
              <button
                onClick={copyTeamCode}
                className="flex items-center gap-1 text-[11px] font-mono text-brand-muted hover:text-brand-white"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-status-green" />
                    <span className="text-status-green">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Team ID</span>
                  </>
                )}
              </button>
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
                <span className="text-sm font-bold text-brand-white">Forge#{teamCode.split("-")[2] || "2026"}</span>
              </div>
              <div className="p-3 rounded-lg bg-bg-primary border border-navy-border">
                <span className="text-brand-dim text-[10px] block uppercase">UPI Reference / UTR</span>
                <span className="text-xs text-status-green font-mono truncate block">
                  {receiptData?.paymentId || utrNumber || "Verified"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-brand-muted leading-relaxed">
              Your registration has been activated under <span className="text-brand-white font-semibold">Approach A (Instant Provisional Onboarding)</span>.
              Keep your Team ID and Password safe to access starter templates, scenario shifts, and the submission portal.
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
              View Live Leaderboard
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
