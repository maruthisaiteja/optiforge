"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Terminal,
  Trophy,
  Download,
  Upload,
  Clock,
  Zap,
  Users,
  AlertTriangle,
  FileCode,
  CheckCircle2,
  Bell,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import SubmissionModal from "@/components/SubmissionModal";
import ScoreReveal from "@/components/ScoreReveal";
import CodeViewer from "@/components/CodeViewer";

export default function TeamDashboard() {
  const router = useRouter();

  const [team, setTeam] = useState<any>(null);
  const [track, setTrack] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Submission form states
  const [codeContent, setCodeContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [approachNotes, setApproachNotes] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestScoreResult, setLatestScoreResult] = useState<any>(null);
  const [viewingSubCode, setViewingSubCode] = useState<any>(null);

  // Window deadline countdown: 25-09-2026 16:00:00 IST
  const deadline = new Date("2026-09-25T16:00:00+05:30").getTime();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const loadDashboardData = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();

      if (!authData?.user || authData.user.role !== "TEAM") {
        router.push("/login");
        return;
      }

      // Fetch team and submissions
      const subRes = await fetch("/api/submissions");
      const subData = await subRes.json();
      setSubmissions(subData.submissions || []);

      // Fetch overview data for team & track
      const ovRes = await fetch("/api/admin/overview");
      if (ovRes.ok) {
        const ov = await ovRes.json();
        const currentTeam = ov.teams.find((t: any) => t.teamCode === authData.user.code);
        if (currentTeam) {
          setTeam(currentTeam);
          const currentTrack = ov.tracks.find((tr: any) => tr.id === currentTeam.domainId);
          setTrack(currentTrack);
        }
      }

      // Fetch active announcements
      const annRes = await fetch("/api/announcements");
      const annData = await annRes.json();
      setAnnouncements(annData.announcements || []);

      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = deadline - now;
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCodeContent(content);
    };
    reader.readAsText(file);
  };

  const executeSubmission = async (notes: string) => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codeContent,
          filename: fileName || "solution.py",
          approachNotes: notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Submission failed.");
        setIsSubmitting(false);
        setIsModalOpen(false);
        return;
      }

      setLatestScoreResult(data.submission);
      setIsSubmitting(false);
      setIsModalOpen(false);

      // Refresh dashboard
      loadDashboardData();
    } catch (err) {
      alert("Error submitting code.");
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-teal-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-brand-muted">Loading Team Competition Arena...</p>
      </div>
    );
  }

  const attemptsUsed = team?.attemptsUsed || 0;
  const attemptsLeft = Math.max(0, 3 - attemptsUsed);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. ANNOUNCEMENTS BROADCAST BANNER */}
      {announcements.length > 0 && (
        <div className="p-4 rounded-2xl bg-teal-accent/10 border border-teal-accent/30 flex items-center justify-between gap-4 text-xs font-mono text-teal-accent">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 animate-bounce shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider block sm:inline mr-2">
                [BROADCAST] {announcements[0].title}:
              </span>
              <span className="text-brand-white font-sans">{announcements[0].message}</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-teal-accent/20 text-teal-accent shrink-0">
            ORGANIZER ALERT
          </span>
        </div>
      )}

      {/* 2. HEADER: TEAM PROFILE & STATS HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Identity Card */}
        <div className="lg:col-span-2 rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-brand-muted mb-1">
                <span>TEAM CODE:</span>
                <span className="text-teal-accent font-bold px-2 py-0.5 rounded bg-teal-accent/10 border border-teal-accent/30">
                  {team?.teamCode}
                </span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-white">
                {team?.teamName}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/leaderboard"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bg-secondary hover:bg-navy-deep border border-navy-border text-xs font-mono text-brand-white transition-colors"
              >
                <Trophy className="w-3.5 h-3.5 text-electric-violet" />
                <span>Leaderboard</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-2 border-t border-navy-border/50">
            <div className="flex items-center gap-1.5 text-brand-muted">
              <Layers className="w-4 h-4 text-teal-accent" />
              <span>Assigned Track:</span>
              <span className="text-brand-white font-semibold">{track?.shortName || "GA Track"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-muted">
              <Users className="w-4 h-4 text-electric-violet" />
              <span>Members:</span>
              <span className="text-brand-white">{team?.members?.length || 3} Students</span>
            </div>
          </div>
        </div>

        {/* HUD: Submission Window Countdown & Attempts Meter */}
        <div className="rounded-2xl bg-gradient-card border border-navy-border p-6 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-brand-muted">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-accent" />
                Submission Deadline
              </span>
              <span className="text-brand-dim">16:00 IST</span>
            </div>
            <div className="font-display font-black text-2xl text-brand-white">
              {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m{" "}
              {String(timeLeft.seconds).padStart(2, "0")}s
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-navy-border/50">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-brand-muted">Attempts Used:</span>
              <span className="text-teal-accent font-bold">
                {attemptsUsed} of 3 ({attemptsLeft} left)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`h-2 rounded-full transition-all ${
                    num <= attemptsUsed
                      ? "bg-gradient-signature"
                      : "bg-navy-deep/80 border border-navy-border"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-mono pt-1">
            <span className="text-brand-muted">Best Auto-Score:</span>
            <span className="font-display font-black text-lg text-teal-accent">
              {team?.bestScore > 0 ? team.bestScore.toFixed(1) : "0.0"} / 100
            </span>
          </div>
        </div>
      </div>

      {/* 3. LATEST SCORE REVEAL (IF JUST SUBMITTED) */}
      {latestScoreResult && (
        <ScoreReveal
          score={latestScoreResult.autoScore}
          breakdown={{
            solutionQuality: latestScoreResult.solutionQuality,
            efficiencyScore: latestScoreResult.efficiencyScore,
            designQuality: latestScoreResult.designQuality,
            consistencyScore: latestScoreResult.consistencyScore,
          }}
          runtimeMs={latestScoreResult.runtimeMs}
          attemptNumber={latestScoreResult.attemptNumber}
          aiExplanation={latestScoreResult.aiExplanation}
          executionLogs={latestScoreResult.executionLogs}
        />
      )}

      {/* 4. PROBLEM STATEMENT & STARTER NOTEBOOK */}
      <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-border/60 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-teal-accent font-semibold px-2 py-0.5 rounded bg-teal-accent/10 border border-teal-accent/30">
              Assigned Problem Domain
            </span>
            <h2 className="font-display font-bold text-xl text-brand-white">{track?.name}</h2>
          </div>

          {track?.starterNotebookUrl && (
            <a
              href={track.starterNotebookUrl}
              download
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-signature text-bg-primary font-display font-bold text-xs shadow-glow hover:brightness-110 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Starter Code (.py)</span>
            </a>
          )}
        </div>

        {/* Statement Rich Markdown View */}
        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-brand-white/90 leading-relaxed space-y-4 font-sans whitespace-pre-wrap">
          {track?.statementMarkdown}
        </div>
      </div>

      {/* 5. SUBMISSION UPLOAD ARENA */}
      <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-navy-border/60 pb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-brand-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-teal-accent" />
              Submit Attempt {attemptsUsed < 3 ? `#${attemptsUsed + 1}` : "(Locked)"}
            </h3>
            <p className="text-xs text-brand-muted">
              Upload your clean Python script (.py) or paste your solution code directly below.
            </p>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-lg bg-bg-secondary border border-navy-border text-brand-muted">
            Attempts remaining: <span className="text-teal-accent font-bold">{attemptsLeft}</span>
          </span>
        </div>

        {attemptsLeft > 0 ? (
          <div className="space-y-4">
            {/* File Upload Dropzone */}
            <div className="p-6 rounded-xl border-2 border-dashed border-navy-border hover:border-teal-accent/60 bg-bg-secondary/40 text-center space-y-2 transition-colors">
              <FileCode className="w-8 h-8 text-teal-accent mx-auto" />
              <div className="text-xs text-brand-white font-medium">
                Choose Python File (.py) or Drag & Drop
              </div>
              <input
                type="file"
                accept=".py,.txt"
                onChange={handleFileUpload}
                className="text-xs text-brand-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-navy-deep file:text-teal-accent hover:file:bg-teal-accent/20 cursor-pointer"
              />
              {fileName && (
                <p className="text-xs font-mono text-status-green">Selected: {fileName}</p>
              )}
            </div>

            {/* Direct Code Editor Area */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="text-brand-white font-medium">Or Paste Code Directly:</label>
                <span className="text-brand-dim font-mono text-[11px]">Python 3.11</span>
              </div>
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                rows={10}
                placeholder="# Paste your optimization solution code here..."
                className="w-full px-4 py-3 rounded-xl bg-bg-secondary border border-navy-border text-xs font-mono text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-teal-accent resize-y"
              />
            </div>

            {/* Launch Modal Trigger Button */}
            <button
              type="button"
              disabled={!codeContent.trim() || isSubmitting}
              onClick={() => setIsModalOpen(true)}
              className="w-full py-4 rounded-xl bg-gradient-signature text-bg-primary font-display font-bold text-sm shadow-glow hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Upload className="w-4 h-4" />
              <span>Proceed to Submit Attempt {attemptsUsed + 1} of 3</span>
            </button>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-navy-deep/40 border border-orange-accent/40 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-orange-accent mx-auto" />
            <h4 className="font-display font-bold text-brand-white">All 3 Attempts Consumed</h4>
            <p className="text-xs text-brand-muted max-w-md mx-auto">
              Your team has utilized the maximum allotted 3 submissions. Your highest auto-score is
              locked on the leaderboard, and your final attempt is queued for human judge review.
            </p>
          </div>
        )}
      </div>

      {/* 6. SUBMISSION HISTORY TABLE */}
      <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-6 shadow-xl">
        <h3 className="font-display font-bold text-lg text-brand-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-electric-violet" />
          Submission History & Diagnostics ({submissions.length}/3)
        </h3>

        {submissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-navy-border bg-bg-secondary/70 text-brand-muted">
                  <th className="py-3 px-4">Attempt</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Runtime</th>
                  <th className="py-3 px-4 text-center">Quality (40%)</th>
                  <th className="py-3 px-4 text-center">Efficiency (25%)</th>
                  <th className="py-3 px-4 text-right">Auto-Score</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-border/40">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-navy-deep/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-teal-accent">
                      Attempt #{sub.attemptNumber}
                    </td>
                    <td className="py-3.5 px-4 text-brand-muted">
                      {new Date(sub.submittedAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-4 text-brand-white">{sub.runtimeMs} ms</td>
                    <td className="py-3.5 px-4 text-center text-teal-accent">
                      {sub.solutionQuality}
                    </td>
                    <td className="py-3.5 px-4 text-center text-electric-violet">
                      {sub.efficiencyScore}
                    </td>
                    <td className="py-3.5 px-4 text-right font-display font-bold text-brand-white">
                      {sub.autoScore.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setViewingSubCode(sub)}
                        className="px-2.5 py-1 rounded bg-navy-deep hover:bg-teal-accent/20 border border-teal-accent/30 text-teal-accent text-[11px] transition-colors"
                      >
                        Inspect Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-brand-muted py-4">No submissions made yet for this team.</p>
        )}
      </div>

      {/* Code Viewer Modal if inspecting prior submission */}
      {viewingSubCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl bg-bg-card border border-navy-border p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-navy-border/60 pb-3">
              <h4 className="font-display font-bold text-brand-white text-sm">
                Inspecting Code: Attempt #{viewingSubCode.attemptNumber} ({viewingSubCode.filename})
              </h4>
              <button
                onClick={() => setViewingSubCode(null)}
                className="text-brand-muted hover:text-brand-white text-xs font-mono px-2 py-1 rounded bg-navy-deep"
              >
                Close
              </button>
            </div>
            <CodeViewer code={viewingSubCode.codeContent} filename={viewingSubCode.filename} />
          </div>
        </div>
      )}

      {/* 7. SUBMISSION CONFIRMATION MODAL */}
      <SubmissionModal
        isOpen={isModalOpen}
        attemptNumber={attemptsUsed + 1}
        filename={fileName || "solution.py"}
        onClose={() => setIsModalOpen(false)}
        onConfirm={executeSubmission}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
