"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Cpu,
  Terminal,
  UserCheck,
  Shield,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"TEAM" | "JUDGE" | "ADMIN">("TEAM");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
          role: activeTab,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Login failed. Please verify credentials.");
        setLoading(false);
        return;
      }

      // Route by role
      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else if (data.user.role === "JUDGE") {
        router.push("/judge");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err) {
      setErrorMsg("Network error occurred during login.");
      setLoading(false);
    }
  };

  // Demo credential autofill helpers
  const fillDemoCredentials = (role: "TEAM" | "JUDGE" | "ADMIN", id: string, pass: string) => {
    setActiveTab(role);
    setIdentifier(id);
    setPassword(pass);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-navy-deep border border-teal-accent/30 flex items-center justify-center text-teal-accent mx-auto shadow-glow">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-white">
          OptiForge Portal Access
        </h1>
        <p className="text-xs text-brand-muted">
          Sign into your team dashboard, judge queue, or admin console
        </p>
      </div>

      {/* Role Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-bg-secondary border border-navy-border/60 text-xs font-mono">
        <button
          type="button"
          onClick={() => {
            setActiveTab("TEAM");
            setErrorMsg(null);
          }}
          className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "TEAM"
              ? "bg-gradient-signature text-bg-primary shadow-glow"
              : "text-brand-muted hover:text-brand-white"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Team</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("JUDGE");
            setErrorMsg(null);
          }}
          className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "JUDGE"
              ? "bg-electric-violet text-white shadow-glow-violet"
              : "text-brand-muted hover:text-brand-white"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Judge</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("ADMIN");
            setErrorMsg(null);
          }}
          className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "ADMIN"
              ? "bg-orange-accent text-white shadow-glow-orange"
              : "text-brand-muted hover:text-brand-white"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-status-red/15 border border-status-red/40 text-status-red text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-brand-white">
            {activeTab === "TEAM" ? "Team Code (e.g. OPT-26-1021)" : "Username"}
          </label>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={
              activeTab === "TEAM"
                ? "OPT-26-XXXX"
                : activeTab === "JUDGE"
                ? "judge_ga"
                : "admin"
            }
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-teal-accent font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="text-brand-white font-medium">Password</label>
            <span className="text-[11px] text-brand-dim">
              {activeTab === "TEAM" ? "Initial: Forge#XXXX" : ""}
            </span>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white focus:outline-none focus:border-teal-accent font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-signature text-bg-primary font-display font-bold text-xs shadow-glow hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to {activeTab} Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {activeTab === "TEAM" && (
          <div className="text-center pt-2 text-xs text-brand-muted">
            Haven't registered yet?{" "}
            <Link href="/register" className="text-teal-accent hover:underline font-medium">
              Register your team
            </Link>
          </div>
        )}
      </form>

      {/* Quick Demo Credentials Autofill */}
      <div className="p-4 rounded-xl bg-bg-secondary/60 border border-navy-border/60 space-y-2.5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-teal-accent font-semibold block flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          One-Click Demo Credentials (Instant Testing)
        </span>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => fillDemoCredentials("TEAM", "OPT-26-1021", "team@optiforge")}
            className="p-2 rounded bg-navy-deep/60 hover:bg-teal-accent/10 border border-navy-border text-left hover:border-teal-accent text-brand-muted hover:text-brand-white transition-colors"
          >
            <span className="text-teal-accent font-bold block">Team NeuralForge</span>
            <span>OPT-26-1021</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemoCredentials("JUDGE", "judge_ga", "judge@optiforge")}
            className="p-2 rounded bg-navy-deep/60 hover:bg-electric-violet/20 border border-navy-border text-left hover:border-electric-violet text-brand-muted hover:text-brand-white transition-colors"
          >
            <span className="text-electric-violet font-bold block">GA Expert Judge</span>
            <span>judge_ga</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemoCredentials("JUDGE", "judge_pso", "judge@optiforge")}
            className="p-2 rounded bg-navy-deep/60 hover:bg-electric-violet/20 border border-navy-border text-left hover:border-electric-violet text-brand-muted hover:text-brand-white transition-colors"
          >
            <span className="text-electric-violet font-bold block">PSO Expert Judge</span>
            <span>judge_pso</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemoCredentials("ADMIN", "admin", "admin@optiforge2026")}
            className="p-2 rounded bg-navy-deep/60 hover:bg-orange-accent/20 border border-navy-border text-left hover:border-orange-accent text-brand-muted hover:text-brand-white transition-colors"
          >
            <span className="text-orange-accent font-bold block">Lead Organizer</span>
            <span>admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
