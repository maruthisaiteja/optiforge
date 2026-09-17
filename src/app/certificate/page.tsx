"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CertificateTemplate from "@/components/CertificateTemplate";
import { Award, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function CertificateViewerContent() {
  const searchParams = useSearchParams();
  const teamCode = searchParams.get("teamCode") || "";

  const [certData, setCertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamCode) {
      setLoading(false);
      return;
    }

    fetch(`/api/certificates?teamCode=${teamCode}`)
      .then((res) => res.json())
      .then((data) => {
        setCertData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [teamCode]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-teal-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-brand-muted">Generating verified digital certificates...</p>
      </div>
    );
  }

  if (!certData || certData.error) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-status-red mx-auto" />
        <h2 className="font-display font-bold text-xl text-brand-white">Certificate Not Found</h2>
        <p className="text-xs text-brand-muted">Please provide a valid registered Team ID.</p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-gradient-signature text-bg-primary font-semibold text-xs mt-2"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      <div className="flex items-center justify-between no-print border-b border-navy-border/60 pb-4">
        <Link
          href="/leaderboard"
          className="flex items-center gap-2 text-xs font-mono text-brand-muted hover:text-teal-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Leaderboard</span>
        </Link>
        <div className="text-xs font-mono text-brand-muted">
          Team: <span className="text-teal-accent font-bold">{certData.teamName}</span> (
          {certData.teamCode})
        </div>
      </div>

      {/* Render a certificate for each registered team member */}
      <div className="space-y-16">
        {(certData.members || []).map((member: any, idx: number) => (
          <div key={member.id || idx} className="space-y-3">
            <div className="text-xs font-mono text-brand-dim no-print flex items-center justify-between px-2">
              <span>Member {idx + 1} Certificate ({member.rollNumber})</span>
            </div>
            <CertificateTemplate
              recipientName={member.name}
              teamName={certData.teamName}
              teamCode={certData.teamCode}
              trackName={certData.trackName}
              rank={certData.rank}
              certificateType={certData.certificateType}
              issueDate={certData.issueDate}
              verificationCode={`${certData.verificationCode}-${idx + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto py-24 text-center">
          <div className="w-10 h-10 border-2 border-teal-accent border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <CertificateViewerContent />
    </Suspense>
  );
}
