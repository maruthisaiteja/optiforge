"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Terminal, Trophy, Download, Upload, Clock, Zap, Users,
  AlertTriangle, FileCode, CheckCircle2, Bell, Sparkles, Layers,
  ArrowRight, ShieldAlert, HelpCircle, Eye, CheckSquare, ShieldCheck,
  Lock, Copy, Check, Calendar, Building, GraduationCap, ExternalLink, EyeOff, LogOut
} from "lucide-react";
import SubmissionModal from "@/components/SubmissionModal";

export default function TeamDashboard() {
  const router = useRouter();

  const [team, setTeam] = useState<any>(null);
  const [track, setTrack] = useState<any>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Copy state helpers
  const [copiedTeamId, setCopiedTeamId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Submission form states for live arena
  const [codeContent, setCodeContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLivePatchSubmit, setIsLivePatchSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestScoreResult, setLatestScoreResult] = useState<any>(null);

  const loadDashboardData = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();

      if (!authData?.user || authData.user.role !== "TEAM") {
        router.push("/login");
        return;
      }

      const subRes = await fetch("/api/submissions");
      const subData = await subRes.json();
      setSubmissions(subData.submissions || []);

      const profRes = await fetch("/api/team/profile");
      if (profRes.ok) {
        const profData = await profRes.json();
        setTeam(profData.team);
        setTrack(profData.track);
        setTournament(profData.tournament);
      }

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

  const openSubmitDialog = (isLivePatch: boolean = false) => {
    if (!codeContent.trim()) {
      alert("Please upload or paste your Python code solution first.");
      return;
    }
    setIsLivePatchSubmit(isLivePatch);
    setIsModalOpen(true);
  };

  const executeSubmission = async (approachNotes: string, whatChangedNotes: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codeContent,
          filename: fileName || (isLivePatchSubmit ? "live_patch_solution.py" : "solution.py"),
          approachNotes,
          whatChangedNotes,
          isLivePatch: isLivePatchSubmit,
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
      setCodeContent("");
      setFileName("");
      loadDashboardData();
    } catch {
      alert("Error submitting code.");
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  const copyToClipboard = (text: string, type: "id" | "pass") => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedTeamId(true);
      setTimeout(() => setCopiedTeamId(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-teal-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-brand-muted">Loading Team Dashboard...</p>
      </div>
    );
  }

  const members = team?.members || [];
  const leader = members.length > 0 ? members[0] : null;
  const defaultPass = team?.defaultPassword || \`Forge#\${team?.teamCode?.split("-")[2] || "2026"}\`;
  const totalScore = (team?.highestScore || 0) + (team?.vivaScore || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Team Header */}
      <div className="rounded-2xl bg-bg-card border border-navy-border p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-white">
              {team?.teamName || "Team"}
            </h1>
            <span className="px-3 py-1 rounded-full bg-teal-accent/10 border border-teal-accent/30 text-teal-accent text-xs font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
          </div>
          <div className="text-sm font-mono text-brand-muted flex items-center gap-4">
            <span>ID: <strong className="text-brand-white">{team?.teamCode}</strong></span>
            {leader && <span>Leader: <strong className="text-brand-white">{leader.name}</strong></span>}
          </div>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono transition-colors flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 13. Notifications area */}
          {announcements.length > 0 && (
            <div className="p-4 rounded-xl bg-teal-accent/10 border border-teal-accent/30 flex items-start gap-3 text-sm">
              <Bell className="w-5 h-5 text-teal-accent shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-teal-accent uppercase block">[BROADCAST] {announcements[0].title}</span>
                <span className="text-brand-white">{announcements[0].message}</span>
              </div>
            </div>
          )}

          {/* 12. Event Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-bg-card border border-navy-border space-y-3">
              <h3 className="font-display font-bold text-brand-white flex items-center gap-2"><Calendar className="w-4 h-4 text-teal-accent" /> Event Info</h3>
              <div className="text-sm text-brand-muted font-mono space-y-2">
                <p>Date: <span className="text-brand-white">30-09-2026</span></p>
                <p>Location: <span className="text-brand-white">Vardhaman College of Eng.</span></p>
              </div>
            </div>
            <div className="p-5 rounded-xl bg-bg-card border border-navy-border space-y-3">
              <h3 className="font-display font-bold text-brand-white flex items-center gap-2"><CheckSquare className="w-4 h-4 text-teal-accent" /> Checklist</h3>
              <ul className="text-xs text-brand-muted font-sans space-y-1">
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-status-green" /> Download Starter Kit</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-status-green" /> Setup Environment</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-status-green" /> Review Problem Statement</li>
              </ul>
            </div>
          </div>

          {/* 3 & 5. Assigned Theme & Challenge */}
          {track && (
            <div className="p-6 rounded-2xl bg-bg-card border border-navy-border space-y-4">
              <div className="flex items-center justify-between border-b border-navy-border/50 pb-3">
                <h2 className="font-display font-bold text-xl text-brand-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-accent" /> Theme: {track.name}
                </h2>
                <span className="px-2 py-1 rounded bg-teal-accent/10 border border-teal-accent/30 text-teal-accent text-xs font-mono">{track.society}</span>
              </div>
              <div className="text-sm text-brand-muted space-y-2">
                <p><strong className="text-brand-white">Context:</strong> {track.context}</p>
                <p><strong className="text-brand-white">Challenge:</strong> {track.coreChallenge}</p>
              </div>
            </div>
          )}

          {/* 4. Competition / Round Status */}
          <div className="p-5 rounded-xl bg-bg-secondary/50 border border-navy-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-orange-accent" />
              <div>
                <div className="text-xs text-brand-dim uppercase font-mono">Current Stage</div>
                <div className="text-sm font-bold text-brand-white">{tournament?.activeStage || "PRE_EVENT"}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-brand-dim uppercase font-mono">Status</div>
              <div className="text-sm font-bold text-status-green">Active</div>
            </div>
          </div>

          {/* 6. Code Submission */}
          <div className="p-6 rounded-2xl bg-bg-card border border-navy-border space-y-4">
            <h3 className="font-display font-bold text-lg text-brand-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-teal-accent" /> Code Submission
            </h3>
            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              placeholder="# Write or paste your code here..."
              rows={8}
              className="w-full p-4 rounded-xl bg-bg-secondary border border-navy-border font-mono text-sm text-brand-white focus:outline-none focus:border-teal-accent transition-colors"
            />
            <div className="flex items-center justify-between">
              <input type="file" accept=".py,.js,.cpp,.java" onChange={handleFileUpload} className="text-xs text-brand-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-bg-secondary file:text-brand-white hover:file:bg-navy-deep cursor-pointer" />
              <button
                onClick={() => openSubmitDialog(false)}
                className="px-6 py-2.5 rounded-xl bg-teal-accent text-bg-primary font-bold text-sm hover:bg-teal-accent/90 transition-colors"
              >
                Submit Code
              </button>
            </div>
          </div>

          {/* 8. Automated Evaluation & 7. Submission History */}
          <div className="p-6 rounded-2xl bg-bg-card border border-navy-border space-y-4">
            <h3 className="font-display font-bold text-lg text-brand-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-teal-accent" /> Evaluation & History
            </h3>
            
            {latestScoreResult && (
              <div className="p-4 rounded-xl bg-status-green/10 border border-status-green/30 mb-4">
                <div className="text-status-green text-sm font-bold">Latest Score: {latestScoreResult.autoScore?.toFixed(1) || 0} / 100</div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-mono">
                <thead className="text-xs text-brand-dim uppercase bg-bg-secondary/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Attempt</th>
                    <th className="px-4 py-3">File</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3 rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-brand-muted">No submissions yet</td>
                    </tr>
                  ) : (
                    submissions.map((sub: any) => (
                      <tr key={sub.id} className="border-b border-navy-border/50 hover:bg-bg-secondary/30">
                        <td className="px-4 py-3">#{sub.attemptNumber}</td>
                        <td className="px-4 py-3">{sub.filename}</td>
                        <td className="px-4 py-3 text-teal-accent font-bold">{sub.autoScore?.toFixed(1) || "-"}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded bg-status-green/10 text-status-green text-[10px]">EVALUATED</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* 10. Overall Score & 11. View Leaderboard */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-bg-card to-navy-deep border border-teal-accent/30 text-center space-y-4">
            <div className="text-brand-dim text-xs font-mono uppercase">Total Score</div>
            <div className="text-5xl font-black text-brand-white font-display">{totalScore.toFixed(1)}</div>
            <Link href="/leaderboard" className="block w-full py-3 rounded-xl bg-bg-secondary border border-teal-accent/50 text-teal-accent font-bold text-sm hover:bg-teal-accent/10 transition-colors">
              View Leaderboard
            </Link>
          </div>

          {/* 9. Judge / Viva Section */}
          <div className="p-5 rounded-2xl bg-bg-card border border-navy-border space-y-4">
            <h3 className="font-display font-bold text-brand-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-orange-accent" /> Judge / Viva
            </h3>
            <div className="space-y-3 text-sm font-mono">
              <div className="flex justify-between items-center p-3 rounded-xl bg-bg-secondary/50">
                <span className="text-brand-dim">Status</span>
                <span className={team?.vivaCompleted ? "text-status-green" : "text-orange-accent"}>
                  {team?.vivaCompleted ? "Evaluated" : "Pending"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-bg-secondary/50">
                <span className="text-brand-dim">Viva Score</span>
                <span className="text-brand-white font-bold">{team?.vivaScore || 0} / 20</span>
              </div>
              <div className="p-3 rounded-xl bg-bg-secondary/50 space-y-1">
                <span className="text-brand-dim block">Feedback</span>
                <p className="text-brand-white text-xs font-sans italic">{team?.vivaFeedback || "No feedback provided yet."}</p>
              </div>
            </div>
          </div>

          {/* 2. Team Members List */}
          <div className="p-5 rounded-2xl bg-bg-card border border-navy-border space-y-4">
            <h3 className="font-display font-bold text-brand-white flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-accent" /> Team Members
            </h3>
            <div className="space-y-2">
              {members.map((m: any, idx: number) => (
                <div key={m.id || idx} className="p-3 rounded-xl bg-bg-secondary/50 border border-navy-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-brand-white">{m.name}</span>
                    <span className="text-[10px] text-teal-accent px-2 py-0.5 rounded bg-teal-accent/10 border border-teal-accent/20">
                      {idx === 0 ? "Leader" : "Member"}
                    </span>
                  </div>
                  <div className="text-xs text-brand-muted mt-1">{m.rollNumber} • {m.branch}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 14. Account Section */}
          <div className="p-5 rounded-2xl bg-bg-card border border-navy-border space-y-4">
            <h3 className="font-display font-bold text-brand-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-accent" /> Account Details
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="p-3 rounded-xl bg-bg-secondary/50 border border-navy-border/50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-brand-dim uppercase">Team ID</div>
                  <div className="text-brand-white font-bold">{team?.teamCode}</div>
                </div>
                <button onClick={() => copyToClipboard(team?.teamCode, "id")} className="p-2 text-brand-muted hover:text-white">
                  {copiedTeamId ? <Check className="w-4 h-4 text-status-green" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-3 rounded-xl bg-bg-secondary/50 border border-navy-border/50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-brand-dim uppercase">Password</div>
                  <div className="text-brand-white font-bold">{showPassword ? defaultPass : "••••••••"}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowPassword(!showPassword)} className="p-2 text-brand-muted hover:text-white">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => copyToClipboard(defaultPass, "pass")} className="p-2 text-brand-muted hover:text-white">
                    {copiedPass ? <Check className="w-4 h-4 text-status-green" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {isModalOpen && (
        <SubmissionModal
          isOpen={isModalOpen}
          isLivePatch={isLivePatchSubmit}
          attemptNumber={(team?.attemptsUsed || 0) + 1}
          filename={fileName || (isLivePatchSubmit ? "live_patch_solution.py" : "solution.py")}
          onClose={() => setIsModalOpen(false)}
          onConfirm={executeSubmission}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
