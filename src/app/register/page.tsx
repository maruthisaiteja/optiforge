"use client";

import React, { useState } from "react";
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

export default function RegisterPage() {
  const router = useRouter();

  const [teamName, setTeamName] = useState("");
  const [selectedProblem, setSelectedProblem] = useState("p1-hospital-scheduling");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 6 Official Problem Statements
  const problemStatements = [
    {
      id: "p1-hospital-scheduling",
      code: "P1",
      title: "Hospital Staff Scheduling with Fatigue-Aware Optimization",
      technique: "Genetic Algorithm + Fuzzy Fatigue Model",
      society: "IEEE EMBS × IEEE CIS",
      focus: "ICU shift coverage & nurse fatigue minimization under non-linear operational constraints",
    },
    {
      id: "p2-drone-delivery",
      code: "P2",
      title: "Drone-Based Emergency Medical Supply Delivery",
      technique: "Ant Colony Optimization + Genetic Algorithm",
      society: "IEEE EMBS × IEEE CIS",
      focus: "3D urban pathing, dynamic no-fly zones & non-linear battery discharge limits",
    },
    {
      id: "p3-emergency-hospital",
      code: "P3",
      title: "Emergency Hospital Destination Selection Under Dynamic Capacity",
      technique: "Fuzzy Logic + Particle Swarm Optimization",
      society: "IEEE EMBS × IEEE CIS",
      focus: "Multi-hospital surge balancing, ambulance diversion & real-time congestion routing",
    },
    {
      id: "p4-blood-inventory",
      code: "P4",
      title: "Hospital Blood Inventory & Compatibility-Aware Allocation",
      technique: "Genetic Algorithm / Particle Swarm Optimization",
      society: "IEEE EMBS × IEEE CIS",
      focus: "Perishable cold-chain logistics, multi-depot emergency demand & shelf-life degradation",
    },
    {
      id: "p5-search-and-rescue",
      code: "P5",
      flagship: true,
      title: "Multi-Robot Search-and-Rescue Area Coverage",
      technique: "Distributed Swarm (PSO / ACO / Multi-Agent GA)",
      society: "IEEE EMBS × IEEE CIS",
      focus: "Probabilistic heat-signature map, collapsing corridors & communication dropouts",
    },
    {
      id: "p6-fuzzy-triage",
      code: "P6",
      title: "Fuzzy Emergency-Room Triage with Adaptive Rule Optimization",
      technique: "Fuzzy Expert System + Genetic Algorithm",
      society: "IEEE EMBS × IEEE CIS",
      focus: "Clinical priority ranking under vital sign noise & critical ICU bed constraints",
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
    setMembers(updated);
  };

  const totalFee = members.length * 50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!teamName.trim()) {
      setErrorMsg("Please provide a team name.");
      return;
    }

    if (!selectedProblem) {
      setErrorMsg("Please select one problem statement from the 6 available tracks.");
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
      if (!m.phone.trim() || m.phone.trim().replace(/\\D/g, "").length !== 10) {
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
          Assemble your squad (2 to 4 members). Fee is ₹50 per participant.
        </p>
      </div>

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

        {/* Section 3: Problem Statement Selection (1 of 6) */}
        <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-navy-border/60 pb-4">
            <div className="w-9 h-9 rounded-xl bg-navy-deep flex items-center justify-center text-teal-accent">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-brand-white">
                Choose Problem Statement
              </h3>
              <p className="text-xs text-brand-muted">
                Select 1 of the 6 official problem statements your team will solve during the competition.
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
                  (₹50 × {members.length} participants)
                </span>
              </div>
              <p className="text-[11px] text-brand-muted mt-1">
                Payable to:{" "}
                <span className="text-brand-white font-medium">IEEE Vardhaman Student Branch</span>
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-status-green bg-status-green/10 border border-status-green/30 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Verified Razorpay Integration</span>
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
