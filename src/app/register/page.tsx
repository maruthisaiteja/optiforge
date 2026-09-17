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
  Sparkles,
  CreditCard,
  Layers,
  GraduationCap,
} from "lucide-react";

interface MemberForm {
  name: string;
  rollNumber: string;
  branch: string;
  year: string;
  email: string;
  phone: string;
  tshirtSize: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [teamName, setTeamName] = useState("");
  const [skillLevel, setSkillLevel] = useState("Intermediate");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Preference ranking (1st to 4th)
  const tracksList = [
    { id: "track-ga", name: "Genetic Algorithms (GA) — Combinatorial Optimization" },
    { id: "track-pso", name: "Particle Swarm Optimization (PSO) — Continuous Landscapes" },
    { id: "track-aco", name: "Ant Colony Optimization (ACO) — Graph Routing" },
    { id: "track-fuzzy", name: "Fuzzy Logic (FL) — Dynamic Control & Inference" },
  ];
  const [prefTracks, setPrefTracks] = useState<string[]>([
    "track-ga",
    "track-pso",
    "track-aco",
    "track-fuzzy",
  ]);

  // Dynamic members (2 to 4)
  const [members, setMembers] = useState<MemberForm[]>([
    {
      name: "",
      rollNumber: "",
      branch: "CSE",
      year: "3rd Year",
      email: "",
      phone: "",
      tshirtSize: "M",
    },
    {
      name: "",
      rollNumber: "",
      branch: "CSE",
      year: "3rd Year",
      email: "",
      phone: "",
      tshirtSize: "L",
    },
  ]);

  const addMember = () => {
    if (members.length < 4) {
      setMembers([
        ...members,
        {
          name: "",
          rollNumber: "",
          branch: "IT",
          year: "3rd Year",
          email: "",
          phone: "",
          tshirtSize: "M",
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

  const handlePreferenceChange = (index: number, newTrackId: string) => {
    const updated = [...prefTracks];
    const oldVal = updated[index];
    const swapIdx = updated.indexOf(newTrackId);
    if (swapIdx !== -1) {
      updated[swapIdx] = oldVal;
    }
    updated[index] = newTrackId;
    setPrefTracks(updated);
  };

  const totalFee = members.length * 50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!teamName.trim()) {
      setErrorMsg("Please provide a team name.");
      return;
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
          prefTracks,
          skillLevel,
          agreedToTerms,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to register team. Please check your inputs.");
        setLoading(false);
        return;
      }

      // Redirect to payment
      router.push(`/payment?teamCode=${data.teamCode}`);
    } catch (err) {
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

            <div className="space-y-2">
              <label className="block text-xs font-medium text-brand-white">
                Self-Assessed Skill Level
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white focus:outline-none focus:border-teal-accent"
              >
                <option value="Beginner">Beginner (Basic Python / Heuristic concepts)</option>
                <option value="Intermediate">Intermediate (Familiar with GA, PSO, or Fuzzy)</option>
                <option value="Advanced">Advanced (Extensive optimization experience)</option>
              </select>
            </div>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
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

                  <div>
                    <label className="block text-brand-muted mb-1">T-Shirt Size</label>
                    <select
                      value={m.tshirtSize}
                      onChange={(e) => updateMember(idx, "tshirtSize", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-navy-border text-brand-white focus:outline-none focus:border-teal-accent"
                    >
                      <option value="S">S (Small)</option>
                      <option value="M">M (Medium)</option>
                      <option value="L">L (Large)</option>
                      <option value="XL">XL (Extra Large)</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Domain Preference Ranking */}
        <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-navy-border/60 pb-4">
            <div className="w-9 h-9 rounded-xl bg-navy-deep flex items-center justify-center text-electric-violet">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-brand-white">
                Domain Preference Ranking
              </h3>
              <p className="text-xs text-brand-muted">
                Rank your choices from 1st to 4th. Used for domain allocation and track balancing.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[0, 1, 2, 3].map((pos) => (
              <div
                key={pos}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-bg-secondary/60 border border-navy-border/60 text-xs"
              >
                <span className="w-7 h-7 rounded-lg bg-navy-deep flex items-center justify-center font-mono font-bold text-teal-accent shrink-0">
                  #{pos + 1}
                </span>
                <select
                  value={prefTracks[pos]}
                  onChange={(e) => handlePreferenceChange(pos, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-bg-primary border border-navy-border text-brand-white focus:outline-none focus:border-teal-accent text-xs"
                >
                  {tracksList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
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
              our team's authentic work, understand the 3-attempt submission ceiling, and acknowledge
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
