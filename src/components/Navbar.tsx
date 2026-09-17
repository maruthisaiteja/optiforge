"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Cpu, Trophy, Terminal, Shield, LogOut, UserCheck, Menu, X, ArrowRight } from "lucide-react";

interface UserSession {
  id: string;
  name: string;
  role: "ADMIN" | "JUDGE" | "TEAM";
  code?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setSession(data.user);
        } else {
          setSession(null);
        }
      })
      .catch(() => setSession(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-bg-primary/85 border-b border-navy-border/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-navy-deep/80 border border-teal-accent/30 flex items-center justify-center text-teal-accent shadow-glow group-hover:border-teal-accent transition-all">
            <Cpu className="w-5 h-5 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg sm:text-xl tracking-wider text-brand-white">
                OPTI<span className="text-teal-accent">FORGE</span>
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-electric-violet/20 text-electric-violet border border-electric-violet/40">
                2026
              </span>
            </div>
            <p className="text-[10px] text-brand-muted hidden sm:block">
              IEEE EMBS × IEEE CIS · VCE
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-muted">
          <Link
            href="/#tracks"
            className="hover:text-teal-accent transition-colors py-1 hover:border-b border-teal-accent"
          >
            Problem Tracks
          </Link>
          <Link
            href="/#how-it-works"
            className="hover:text-teal-accent transition-colors py-1 hover:border-b border-teal-accent"
          >
            How It Works
          </Link>
          <Link
            href="/leaderboard"
            className={`flex items-center gap-1.5 transition-colors py-1 ${
              pathname === "/leaderboard"
                ? "text-teal-accent font-semibold border-b border-teal-accent"
                : "hover:text-teal-accent"
            }`}
          >
            <Trophy className="w-4 h-4 text-electric-violet" />
            Live Leaderboard
          </Link>
          <Link
            href="/#faq"
            className="hover:text-teal-accent transition-colors py-1 hover:border-b border-teal-accent"
          >
            Rules & FAQ
          </Link>
        </nav>

        {/* Right side CTA / Auth */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              {session.role === "TEAM" && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-navy-deep/80 border border-teal-accent/40 text-teal-accent hover:bg-teal-accent/10 transition-all text-xs font-mono"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Team: {session.code || session.name}</span>
                </Link>
              )}
              {session.role === "JUDGE" && (
                <Link
                  href="/judge"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-electric-violet/20 border border-electric-violet/40 text-electric-violet hover:bg-electric-violet/30 transition-all text-xs font-mono"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Judge Portal</span>
                </Link>
              )}
              {session.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-orange-accent/20 border border-orange-accent/40 text-orange-accent hover:bg-orange-accent/30 transition-all text-xs font-mono"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Control</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 rounded-lg text-brand-muted hover:text-status-red hover:bg-bg-secondary border border-transparent hover:border-status-red/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-medium text-brand-white hover:text-teal-accent transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="relative group px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-signature text-bg-primary shadow-glow hover:brightness-110 transition-all flex items-center gap-1.5"
              >
                <span>Register Team</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-brand-muted hover:text-brand-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-brand-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-navy-border/80 bg-bg-secondary px-4 pt-3 pb-5 space-y-3">
          <Link
            href="/#tracks"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-brand-white hover:bg-navy-deep/40"
          >
            Problem Tracks
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-brand-white hover:bg-navy-deep/40"
          >
            How It Works
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-teal-accent hover:bg-navy-deep/40"
          >
            <Trophy className="w-4 h-4 text-electric-violet" />
            Live Leaderboard
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-brand-white hover:bg-navy-deep/40"
          >
            Rules & FAQ
          </Link>

          <div className="pt-4 border-t border-navy-border/50 flex flex-col gap-2">
            {session ? (
              <>
                <Link
                  href={
                    session.role === "ADMIN"
                      ? "/admin"
                      : session.role === "JUDGE"
                      ? "/judge"
                      : "/dashboard"
                  }
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 px-4 rounded-lg bg-navy-deep border border-teal-accent/30 text-teal-accent text-center font-medium text-sm"
                >
                  Go to {session.role === "ADMIN" ? "Admin" : session.role === "JUDGE" ? "Judge Portal" : "Team Dashboard"}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2 px-4 rounded-lg bg-status-red/10 border border-status-red/30 text-status-red text-center font-medium text-sm"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 px-4 rounded-lg border border-navy-border text-brand-white text-center font-medium text-sm hover:bg-navy-deep/40"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-lg bg-gradient-signature text-bg-primary text-center font-semibold text-sm shadow-glow"
                >
                  Register Team (₹50/member)
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
