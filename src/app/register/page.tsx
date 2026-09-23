"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  ArrowRight,
  Plus,
  Trash2,
  AlertCircle,
  CreditCard,
  Layers,
  GraduationCap,
  Check,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

interface MemberForm {
  name: string;
  collegeName: string;
  rollNumber: string;
  branch: string;
  year: string;
  email: string;
  phone: string;
}

const DRAFT_KEY = "optiforge_registration_draft_v2";
const PENDING_TEAM_KEY = "optiforge_pending_team_v1";

export default function RegisterPage() {
  const router = useRouter();

  const [teamName, setTeamName] = useState("");
  const [selectedProblem, setSelectedProblem] = useState("theme-1-biomedical-ai");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Persistence States
  const [draftRestored, setDraftRestored] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [pendingTeam, setPendingTeam] = useState<any>(null);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  // 9 Official Innovation Themes
  const problemStatements = [
    {
      id: "theme-1-biomedical-ai",
      code: "T1",
      tag: "EMBS Domain",
      title: "Biomedical Artificial Intelligence",
      technique: "Evolutionary Neural Architecture Search & Hybrid GA-ML",
      society: "IEEE EMBS × IEEE CIS",
      focus: "High-dimensional feature space search, hybrid clinical decision boundaries & rare pathology risk stratification",
      accent: "#7657D9",
      bg: "#F4F1FF",
    },
    {
      id: "theme-2-edtech",
      code: "T2",
      tag: "CIS Domain",
      title: "EdTech & Intelligent Systems",
      technique: "Genetic Algorithms + Dynamic Knowledge Space Optimization",
      society: "IEEE CIS × IEEE EMBS",
      focus: "Personalized learning trajectories, prerequisite mastery chains & spaced-repetition cognitive load balancing",
      accent: "#00629B",
      bg: "#F0F7FB",
    },
    {
      id: "theme-3-digital-health",
      code: "T3",
      tag: "EMBS Domain",
      title: "Digital Health & Telemedicine",
      technique: "Particle Swarm Optimization + Fuzzy Dynamic Priority Routing",
      society: "IEEE EMBS × IEEE CIS",
      focus: "Dynamic remote consultation routing, decentralized specialist allocation & bandwidth-constrained triage",
      accent: "#12A8C4",
      bg: "#EFFBFD",
    },
    {
      id: "theme-4-neurotech",
      code: "T4",
      tag: "EMBS Domain",
      title: "Neurotechnology & Rehabilitation",
      technique: "Swarm Intelligence + Fuzzy Adaptive Neural Decoding",
      society: "IEEE EMBS",
      focus: "Non-stationary neural intent decoding, EMG artifact filtering & jerk-free robotic rehabilitation trajectories",
      accent: "#772583",
      bg: "#F6F1F8",
    },
    {
      id: "theme-5-medical-imaging",
      code: "T5",
      tag: "EMBS Domain",
      title: "Medical Imaging & Computer Vision",
      technique: "Genetic Algorithms + Heuristic Feature Space Search",
      society: "IEEE EMBS × IEEE CIS",
      focus: "Deformable contour optimization, 3D scan reconstruction & micro-lesion segmentation under severe noise",
      accent: "#12A8C4",
      bg: "#EFFBFD",
    },
    {
      id: "theme-6-biomedical-signals",
      code: "T6",
      tag: "EMBS Domain",
      title: "Biomedical Signals & Intelligent Systems",
      technique: "Fuzzy Inference Systems + Evolutionary Signal Decomposition",
      society: "IEEE EMBS × IEEE CIS",
      focus: "Continuous multi-channel ECG/EEG/PPG telemetry, morphological feature extraction & acute arrhythmia detection",
      accent: "#D84A5A",
      bg: "#FFF2F4",
    },
    {
      id: "theme-7-smart-healthcare-iot",
      code: "T7",
      tag: "EMBS Domain",
      title: "Smart Healthcare & Medical IoT",
      technique: "Ant Colony Optimization + Energy-Aware Swarm Routing",
      society: "IEEE EMBS × IEEE CIS",
      focus: "Ultra-low power medical sensor mesh routing, vital data packet priority & hospital network lifetime extension",
      accent: "#238B68",
      bg: "#F0FAF5",
    },
    {
      id: "theme-8-healthcare-robotics",
      code: "T8",
      tag: "CIS Domain",
      title: "Healthcare Robotics & Automation",
      technique: "Distributed Swarm Intelligence + Multi-Objective GA Pathing",
      society: "IEEE EMBS × IEEE CIS",
      focus: "Multi-robot hospital corridor logistics, sterile disinfection navigation & collision-free emergency dispatch",
      accent: "#D58A19",
      bg: "#FFFDF2",
    },
    {
      id: "theme-9-open-innovation",
      code: "T9",
      tag: "Flagship Domain",
      flagship: true,
      title: "Open Innovation on (CIS and EMBS only)",
      technique: "Hybrid Computational Intelligence & Novel Metaheuristics",
      society: "IEEE CIS & IEEE EMBS Only",
      focus: "Interdisciplinary breakthrough combining computational intelligence with transformative healthcare & biomedical paradigms",
      accent: "#12A8C4",
      bg: "#EFFBFD",
    },
  ];

  // Dynamic members (2 to 4)
  const [members, setMembers] = useState<MemberForm[]>([
    {
      name: "",
      collegeName: "",
      rollNumber: "",
      branch: "CSE",
      year: "3rd Year",
      email: "",
      phone: "",
    },
    {
      name: "",
      collegeName: "",
      rollNumber: "",
      branch: "CSE",
      year: "3rd Year",
      email: "",
      phone: "",
    },
  ]);

  // Initialize and restore saved draft or pending team on client mount
  useEffect(() => {
    setIsClientLoaded(true);

    // 1. Check for active pending team
    try {
      const savedPending = localStorage.getItem(PENDING_TEAM_KEY);
      if (savedPending) {
        const parsed = JSON.parse(savedPending);
        if (parsed?.teamCode) {
          setPendingTeam(parsed);
        }
      }
    } catch {}

    // 2. Check for saved registration draft
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        const hasContent =
          (parsed.teamName && parsed.teamName.trim().length > 0) ||
          (Array.isArray(parsed.members) &&
            parsed.members.some((m: any) => m?.name?.trim() || m?.rollNumber?.trim() || m?.email?.trim()));

        if (hasContent) {
          if (parsed.teamName) setTeamName(parsed.teamName);
          if (parsed.selectedProblem) setSelectedProblem(parsed.selectedProblem);
          if (Array.isArray(parsed.members) && parsed.members.length >= 2) {
            setMembers(parsed.members);
          }
          if (typeof parsed.agreedToTerms === "boolean") {
            setAgreedToTerms(parsed.agreedToTerms);
          }
          setDraftRestored(true);
          if (parsed.updatedAt) {
            setLastSavedTime(
              new Date(parsed.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            );
          }
        }
      }
    } catch {}
  }, []);

  // Real-time debounced auto-save to localStorage
  useEffect(() => {
    if (!isClientLoaded) return;

    const hasData =
      teamName.trim() !== "" ||
      members.some((m) => m.name.trim() !== "" || m.rollNumber.trim() !== "" || m.email.trim() !== "");

    if (!hasData) return;

    const timer = setTimeout(() => {
      try {
        const payload = {
          teamName,
          selectedProblem,
          members,
          agreedToTerms,
          updatedAt: Date.now(),
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
        setLastSavedTime(
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
      } catch (err) {
        console.error("Failed to auto-save draft:", err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [teamName, selectedProblem, members, agreedToTerms, isClientLoaded]);

  const handleClearDraft = () => {
    if (window.confirm("Are you sure you want to discard your draft and start fresh? All entered team details will be cleared.")) {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      setTeamName("");
      setSelectedProblem("theme-1-biomedical-ai");
      setAgreedToTerms(false);
      setMembers([
        {
          name: "",
          collegeName: "",
          rollNumber: "",
          branch: "CSE",
          year: "3rd Year",
          email: "",
          phone: "",
        },
        {
          name: "",
          collegeName: "",
          rollNumber: "",
          branch: "CSE",
          year: "3rd Year",
          email: "",
          phone: "",
        },
      ]);
      setDraftRestored(false);
      setLastSavedTime(null);
    }
  };

  const addMember = () => {
    if (members.length < 4) {
      setMembers([
        ...members,
        {
          name: "",
          collegeName: members[0]?.collegeName || "",
          rollNumber: "",
          branch: "IT",
          year: "3rd Year",
          email: "",
          phone: "",
        },
      ]);
    }
  };

  const removeMember = (index: number) => {
    if (members.length > 2) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index: number, field: keyof MemberForm, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-propagate college name from Leader to other members if blank or unchanged
    if (index === 0 && field === "collegeName" && value.trim()) {
      for (let i = 1; i < updated.length; i++) {
        if (!updated[i].collegeName || updated[i].collegeName === members[0].collegeName) {
          updated[i].collegeName = value;
        }
      }
    }

    setMembers(updated);
  };

  const totalFee = members.length * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!teamName.trim()) {
      setErrorMsg("Please provide a team name.");
      return;
    }

    if (!selectedProblem) {
      setErrorMsg("Please select one innovation theme from the 9 available themes.");
      return;
    }

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name.trim()) {
        setErrorMsg(`Please enter Full Name for Member ${i + 1}.`);
        return;
      }
      if (!m.collegeName.trim()) {
        setErrorMsg(`Please enter College Name for Member ${i + 1}.`);
        return;
      }
      if (!m.rollNumber.trim()) {
        setErrorMsg(`Please enter College Roll Number for Member ${i + 1}.`);
        return;
      }
      if (!m.email.trim()) {
        setErrorMsg(`Please enter Email Address for Member ${i + 1}.`);
        return;
      }
      if (!m.phone.trim() || m.phone.trim().replace(/\D/g, "").length !== 10) {
        setErrorMsg(`Please enter a valid 10-digit Phone Number for Member ${i + 1}.`);
        return;
      }
    }

    if (!agreedToTerms) {
      setErrorMsg("Please accept the event code of conduct to proceed.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: teamName.trim(),
          members,
          selectedProblem,
          agreedToTerms,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to register team. Please check your inputs.");
        setLoading(false);
        return;
      }

      if (data.registrationToken) {
        try {
          sessionStorage.setItem(`optiforge_reg_${data.teamCode}`, data.registrationToken);
        } catch {}
      }

      // Save as active pending team & clear form draft
      try {
        localStorage.removeItem(DRAFT_KEY);
        localStorage.setItem(
          PENDING_TEAM_KEY,
          JSON.stringify({
            teamCode: data.teamCode,
            teamName: teamName.trim(),
            paymentAmount: data.paymentAmount || totalFee,
            token: data.registrationToken,
            assignedDomain: data.assignedDomain,
            savedAt: Date.now(),
          })
        );
      } catch {}

      // Redirect to payment with token for instant cross-container resilience
      const tokenParam = data.registrationToken ? `&token=${encodeURIComponent(data.registrationToken)}` : "";
      router.push(`/payment?teamCode=${data.teamCode}${tokenParam}`);
    } catch {
      setErrorMsg("Network error during registration. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-accent/10 border border-teal-accent/30 text-teal-accent text-xs font-mono">
          <GraduationCap className="w-4 h-4" />
          <span>Official Team Onboarding</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-brand-white">
          Register for OptiForge 2026
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted max-w-xl mx-auto">
          Assemble your squad (2 to 4 members). Fee is ₹100 per participant.
        </p>
      </div>

      {/* Pending Registration Link */}
      {pendingTeam && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 font-mono">
          <span>
            Team <strong>{pendingTeam.teamCode}</strong> ({pendingTeam.teamName}) registration is awaiting payment.
          </span>
          <Link
            href={`/payment?teamCode=${pendingTeam.teamCode}${pendingTeam.token ? `&token=${encodeURIComponent(pendingTeam.token)}` : ""}`}
            className="px-3 py-1 rounded-lg bg-amber-500 text-bg-primary font-bold hover:bg-amber-400 transition-colors ml-3 shrink-0"
          >
            Pay ₹{pendingTeam.paymentAmount || 200} →
          </Link>
        </div>
      )}

      {/* Quiet Draft Restoration Indicator */}
      {draftRestored && (
        <div className="flex items-center justify-between text-xs font-mono text-brand-dim px-1">
          <span className="flex items-center gap-1.5 text-teal-accent">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-accent" />
            <span>Draft restored</span>
          </span>
          <button
            type="button"
            onClick={handleClearDraft}
            className="text-[11px] text-brand-dim hover:text-status-red transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset form</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-status-red/15 border border-status-red/40 text-status-red text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Team Details */}
        <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-navy-border/60 pb-4">
            <div className="w-9 h-9 rounded-xl bg-navy-deep flex items-center justify-center text-teal-accent">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-brand-white">Team Information</h3>
              <p className="text-xs text-brand-muted">
                Judges and the live leaderboard will display your official team name.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-brand-white">
              Team Name <span className="text-teal-accent">*</span>
            </label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. SwarmIntelligenceVCE"
              className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-teal-accent"
            />
          </div>
        </div>

        {/* Section 2: Member Rosters (2-4) */}
        <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-border/60 pb-4">
            <div>
              <h3 className="font-display font-bold text-base text-brand-white">
                Team Roster ({members.length} Members)
              </h3>
              <p className="text-xs text-brand-muted">
                Leader is Member 1. Minimum 2, maximum 4 members required.
              </p>
            </div>

            {members.length < 4 && (
              <button
                type="button"
                onClick={addMember}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-navy-deep hover:bg-teal-accent/20 border border-teal-accent/30 text-teal-accent text-xs font-mono transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member ({members.length + 1}/4)</span>
              </button>
            )}
          </div>

          <div className="space-y-6">
            {members.map((m, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-bg-secondary/60 border border-navy-border/60 space-y-4 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal-accent flex items-center gap-2">
                    <span>Member {idx + 1}</span>
                    {idx === 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-electric-violet/20 text-electric-violet font-semibold">
                        Team Leader
                      </span>
                    )}
                  </span>

                  {members.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeMember(idx)}
                      className="p-1.5 text-brand-muted hover:text-status-red transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-brand-muted mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={m.name}
                      onChange={(e) => updateMember(idx, "name", e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-navy-border text-brand-white focus:outline-none focus:border-teal-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-brand-muted mb-1">College Name *</label>
                    <input
                      type="text"
                      required
                      value={m.collegeName}
                      onChange={(e) => updateMember(idx, "collegeName", e.target.value)}
                      placeholder="e.g. Vardhaman College of Engineering"
                      className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-navy-border text-brand-white focus:outline-none focus:border-teal-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-brand-muted mb-1">College Roll Number *</label>
                    <input
                      type="text"
                      required
                      value={m.rollNumber}
                      onChange={(e) => updateMember(idx, "rollNumber", e.target.value)}
                      placeholder="e.g. 22011A05XX"
                      className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-navy-border text-brand-white focus:outline-none focus:border-teal-accent font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-brand-muted mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={m.email}
                      onChange={(e) => updateMember(idx, "email", e.target.value)}
                      placeholder="student@vce.ac.in"
                      className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-navy-border text-brand-white focus:outline-none focus:border-teal-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-brand-muted mb-1">Phone Number (10-Digit) *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={m.phone}
                      onChange={(e) => updateMember(idx, "phone", e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-navy-border text-brand-white focus:outline-none focus:border-teal-accent font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-brand-muted mb-1">Branch & Year</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={m.branch}
                        onChange={(e) => updateMember(idx, "branch", e.target.value)}
                        className="w-full px-2 py-2 rounded-lg bg-bg-primary border border-navy-border text-brand-white focus:outline-none focus:border-teal-accent"
                      >
                        <option value="CSE">CSE</option>
                        <option value="IT">IT</option>
                        <option value="AI&ML">AI&ML</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="Other">Other</option>
                      </select>
                      <select
                        value={m.year}
                        onChange={(e) => updateMember(idx, "year", e.target.value)}
                        className="w-full px-2 py-2 rounded-lg bg-bg-primary border border-navy-border text-brand-white focus:outline-none focus:border-teal-accent"
                      >
                        <option value="1st Year">1st Yr</option>
                        <option value="2nd Year">2nd Yr</option>
                        <option value="3rd Year">3rd Yr</option>
                        <option value="4th Year">4th Yr</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Innovation Theme Selection (1 of 9) */}
        <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-navy-border/60 pb-4">
            <div className="w-9 h-9 rounded-xl bg-navy-deep flex items-center justify-center text-teal-accent">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-brand-white">
                Choose Innovation Theme
              </h3>
              <p className="text-xs text-brand-muted">
                Select 1 of the 9 official innovation themes your team will solve during the competition.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problemStatements.map((ps) => {
              const isSelected = selectedProblem === ps.id;
              return (
                <div
                  key={ps.id}
                  onClick={() => setSelectedProblem(ps.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all text-left relative flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "bg-teal-accent/10 border-teal-accent shadow-[0_0_20px_rgba(47,230,214,0.15)] ring-1 ring-teal-accent/50"
                      : "bg-bg-secondary/60 border-navy-border/60 hover:border-teal-accent/40 hover:bg-bg-secondary"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          isSelected
                            ? "bg-teal-accent text-bg-primary"
                            : "bg-navy-deep text-teal-accent border border-teal-accent/30"
                        }`}
                      >
                        {ps.code}
                      </span>
                      {ps.flagship && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-orange-accent/20 text-orange-accent border border-orange-accent/30 uppercase tracking-wide">
                          Flagship
                        </span>
                      )}
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-teal-accent bg-teal-accent text-bg-primary"
                          : "border-navy-border bg-bg-primary"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-xs sm:text-sm text-brand-white leading-snug">
                      {ps.title}
                    </h4>
                    <p className="text-[11px] text-teal-accent/90 font-mono mt-1">
                      {ps.technique}
                    </p>
                    <p className="text-[11px] text-brand-muted mt-1 line-clamp-2">
                      {ps.focus}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-navy-border/40 flex items-center justify-between text-[10px] text-brand-dim font-mono">
                    <span>{ps.society}</span>
                    <span className={isSelected ? "text-teal-accent font-semibold" : "text-brand-muted"}>
                      {isSelected ? "Selected" : "Click to select"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Dynamic Fee Summary & Terms */}
        <div className="rounded-2xl bg-gradient-card border border-navy-border p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-navy-border/60 pb-5">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-teal-accent font-semibold">
                Payment Summary
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-4xl font-black text-brand-white">
                  ₹{totalFee}
                </span>
                <span className="text-xs font-mono text-brand-muted">
                  (₹100 × {members.length} participants)
                </span>
              </div>
              <p className="text-[11px] text-brand-muted mt-1">
                Payable to:{" "}
                <span className="text-brand-white font-medium">IEEE Vardhaman Student Branch</span>
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-status-green bg-status-green/10 border border-status-green/30 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Official UPI & QR Gateway</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              required
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded bg-bg-secondary border-navy-border text-teal-accent focus:ring-0 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-brand-muted cursor-pointer leading-relaxed">
              We agree to the OptiForge 2026 Code of Conduct, confirm that all submitted code will be
              our team&apos;s authentic work, understand the 3-attempt submission ceiling, and acknowledge
              that registrations are non-refundable.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-signature text-bg-primary font-display font-bold text-sm shadow-glow hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                <span>Creating Team Record...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Payment (₹{totalFee})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
