"use client";

import React, { useRef } from "react";
import { Award, ShieldCheck, Printer, Download, Cpu, Sparkles } from "lucide-react";

interface CertificateProps {
  recipientName: string;
  teamName: string;
  teamCode: string;
  trackName: string;
  rank?: number | null;
  certificateType?: "PARTICIPATION" | "EXCELLENCE" | "MERIT";
  issueDate?: string;
  verificationCode?: string;
}

export default function CertificateTemplate({
  recipientName,
  teamName,
  teamCode,
  trackName,
  rank,
  certificateType = "PARTICIPATION",
  issueDate = "25th September 2026",
  verificationCode = "OPT26-VCE-CERT-AUTH",
}: CertificateProps) {
  const certRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between no-print px-2">
        <span className="text-xs font-mono text-brand-muted">
          Official IEEE EMBS × IEEE CIS Digital Credential
        </span>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-navy-deep hover:bg-teal-accent/20 border border-teal-accent/30 text-teal-accent text-xs font-mono transition-all shadow-glow"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Certificate Canvas */}
      <div
        ref={certRef}
        className="relative bg-[#0c101d] text-white border-8 border-[#1f2a63] rounded-3xl p-10 sm:p-14 shadow-2xl overflow-hidden print:m-0 print:border-4 print:shadow-none"
        style={{ minHeight: "560px", width: "100%" }}
      >
        {/* Decorative corner ornaments */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-teal-accent rounded-tl-2xl m-4" />
        <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-electric-violet rounded-tr-2xl m-4" />
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-electric-violet rounded-bl-2xl m-4" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-teal-accent rounded-br-2xl m-4" />

        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* Header Logos & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-navy-deep border border-teal-accent flex items-center justify-center text-teal-accent shadow-glow">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h2 className="font-display font-black text-2xl tracking-wider text-white">
                OPTIFORGE <span className="text-teal-accent">2026</span>
              </h2>
              <p className="text-[11px] font-mono tracking-wide text-brand-muted">
                IEEE Vardhaman Student Branch · EMBS & CIS Chapters
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-teal-accent font-semibold px-4 py-1 rounded-full bg-teal-accent/10 border border-teal-accent/30">
              {certificateType === "EXCELLENCE"
                ? "Certificate of Excellence"
                : certificateType === "MERIT"
                ? "Certificate of Merit"
                : "Certificate of Participation"}
            </span>
            <p className="text-xs text-brand-muted mt-2">
              This is officially awarded in recognition of outstanding algorithm design to
            </p>
          </div>

          {/* Recipient Name */}
          <div className="border-b-2 border-teal-accent/40 pb-2 px-12">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-accent via-white to-electric-violet tracking-wide">
              {recipientName}
            </h1>
          </div>

          {/* Details */}
          <p className="max-w-xl text-xs sm:text-sm text-brand-muted leading-relaxed font-sans">
            of Team <span className="text-white font-semibold">{teamName}</span> (ID:{" "}
            <span className="font-mono text-teal-accent font-bold">{teamCode}</span>) for successfully
            architecting, optimizing, and benchmark-validating solutions in the{" "}
            <span className="text-white font-semibold">{trackName}</span> at{" "}
            <span className="text-teal-accent font-medium">OptiForge 2026</span>, organized by the IEEE
            EMBS Student Chapter in collaboration with IEEE CIS Local Chapter at Vardhaman College of
            Engineering.
            {rank && rank <= 3 && (
              <span className="block mt-2 font-display text-electric-violet font-bold text-sm">
                Rank Achieved: Top {rank} Place
              </span>
            )}
          </p>

          {/* Badges & Meta */}
          <div className="w-full pt-8 flex flex-col sm:flex-row items-center justify-between border-t border-navy-border/60 gap-4 text-xs font-mono text-brand-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-status-green" />
              <span>Verified Digital Credential</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-brand-dim block">VERIFICATION ID</span>
              <span className="text-teal-accent">{verificationCode}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-electric-violet" />
              <span>Issued: {issueDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
