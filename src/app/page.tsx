"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Trophy,
  Zap,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  ChevronDown,
  Terminal,
  FileCode,
  Award,
  Users,
  Binary,
} from "lucide-react";

export default function LandingPage() {
  // Countdown Timer to 25-09-2026 09:00 AM IST
  const targetDate = new Date("2026-09-25T09:00:00+05:30").getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Accordion FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Who is eligible to participate in OptiForge 2026?",
      a: "OptiForge is open to all engineering, technology, and science students. Teams can have 2 to 4 members across branches (CSE, IT, ECE, AI&ML, EEE, MECH, etc.). Interdisciplinary teams are highly encouraged!",
    },
    {
      q: "What is the 3-attempt live-scoring mechanism?",
      a: "Each team is granted strictly 3 official submission attempts. When you submit your Python script or notebook, our sandboxed engine tests it against held-out benchmark datasets, scores accuracy (40%), efficiency (25%), algorithm design quality (20%), and consistency (15%), and updates the live leaderboard. Your final attempt is additionally evaluated by expert faculty judges.",
    },
    {
      q: "What is the registration fee and how is it paid?",
      a: "The registration fee is ₹50 per participant (auto-calculated as ₹100 for 2 members, ₹150 for 3 members, or ₹200 for 4 members). Payments are secured via Razorpay and verified under the official IEEE Vardhaman Student Branch entity.",
    },
    {
      q: "Do we need to deploy our code as a web service or API?",
      a: "No! OptiForge tests pure algorithmic optimization. You only upload your clean Python script (.py) or Jupyter notebook (.ipynb). We execute it in our isolated runtime sandbox with standard scientific libraries (math, random, etc.).",
    },
    {
      q: "Will all participants receive certificates?",
      a: "Yes! All verified participants will receive official E-Certificates of Participation & Excellence issued jointly by IEEE EMBS Student Chapter and IEEE CIS Local Chapter, Vardhaman College of Engineering.",
    },
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow ambient circle */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-teal-accent/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-electric-violet/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-deep/80 border border-teal-accent/30 text-teal-accent text-xs font-mono mb-6 shadow-glow">
          <span className="w-2 h-2 rounded-full bg-teal-accent animate-pulse" />
          <span>IEEE EMBS × IEEE CIS · Vardhaman College of Engineering</span>
        </div>

        {/* Title */}
        <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-brand-white leading-none uppercase">
          OPTI<span className="text-teal-accent">FORGE</span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-signature">2026</span>
        </h1>

        <p className="mt-4 font-mono text-sm sm:text-base text-teal-accent/90 uppercase tracking-widest font-semibold">
          Student Algorithm Design Challenge · Computational Intelligence
        </p>

        <p className="mt-6 max-w-2xl mx-auto text-sm sm:text-base text-brand-muted leading-relaxed font-sans">
          Engineer high-performance evolutionary heuristics, swarm intelligence, and fuzzy inference
          systems. Compete with live 3-attempt automated sandboxed scoring and expert human judging.
        </p>

        {/* Event Schedule Pill */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-brand-white">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-secondary border border-navy-border">
            <Calendar className="w-4 h-4 text-teal-accent" />
            <span>25th September 2026</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-secondary border border-navy-border">
            <Clock className="w-4 h-4 text-electric-violet" />
            <span>9:00 AM – 4:00 PM IST</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-secondary border border-navy-border">
            <MapPin className="w-4 h-4 text-orange-accent" />
            <span>Vardhaman College of Engineering</span>
          </div>
        </div>

        {/* Live Countdown Timer */}
        <div className="mt-10 max-w-lg mx-auto p-4 sm:p-6 rounded-2xl bg-bg-secondary/70 border border-navy-border/80 backdrop-blur-md shadow-2xl">
          <span className="text-[11px] font-mono uppercase tracking-widest text-brand-muted block mb-3">
            Countdown to Challenge Launch
          </span>
          <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
            <div className="p-2 sm:p-3 rounded-xl bg-navy-deep/80 border border-navy-border">
              <span className="font-display font-bold text-2xl sm:text-3xl text-brand-white block">
                {String(timeLeft.days).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-mono text-brand-muted uppercase">Days</span>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-navy-deep/80 border border-navy-border">
              <span className="font-display font-bold text-2xl sm:text-3xl text-brand-white block">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-mono text-brand-muted uppercase">Hours</span>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-navy-deep/80 border border-navy-border">
              <span className="font-display font-bold text-2xl sm:text-3xl text-brand-white block">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-mono text-brand-muted uppercase">Mins</span>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-navy-deep/80 border border-navy-border">
              <span className="font-display font-bold text-2xl sm:text-3xl text-teal-accent block">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-mono text-brand-muted uppercase">Secs</span>
            </div>
          </div>
        </div>

        {/* Hero CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="px-8 py-3.5 rounded-xl bg-gradient-signature text-bg-primary font-display font-bold text-sm shadow-glow hover:brightness-110 transition-all flex items-center gap-2 group"
          >
            <span>Register Team (₹50 / member)</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/leaderboard"
            className="px-6 py-3.5 rounded-xl bg-bg-secondary hover:bg-navy-deep border border-navy-border hover:border-teal-accent text-brand-white font-medium text-sm transition-all flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-electric-violet" />
            <span>View Live Leaderboard</span>
          </Link>
        </div>

        {/* Organizing Units Marquee */}
        <div className="mt-16 pt-8 border-t border-navy-border/40 text-xs font-mono text-brand-muted flex flex-wrap items-center justify-center gap-6 sm:gap-12">
          <span>IEEE Vardhaman Student Branch</span>
          <span className="text-teal-accent">●</span>
          <span>IEEE EMBS Student Chapter</span>
          <span className="text-electric-violet">●</span>
          <span>IEEE CIS Local Chapter</span>
          <span className="text-orange-accent">●</span>
          <span>Vardhaman College of Engineering</span>
        </div>
      </section>

      {/* 2. ABOUT THE CHALLENGE & THE HYBRID ENGINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-accent/10 border border-teal-accent/30 text-teal-accent text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span>The Core Differentiator</span>
            </div>

            <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-white tracking-tight">
              A Hybrid Evaluation Engine Built for Real Optimization
            </h2>

            <p className="text-brand-muted text-sm sm:text-base leading-relaxed">
              OptiForge isn't a web-app hackathon where UI fluff wins. It is a true algorithmic
              arena. Teams formulate mathematical heuristics to navigate complex combinatorial and
              continuous spaces.
            </p>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-bg-card border border-navy-border/80 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-accent/20 border border-teal-accent/40 flex items-center justify-center text-teal-accent shrink-0 mt-0.5">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-brand-white text-sm">
                    Instant Deterministic Auto-Scoring (60%)
                  </h4>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                    Submissions execute inside isolated sandboxes against held-out test benchmarks.
                    Calculates solution quality (40%), efficiency (25%), AST design quality (20%),
                    and attempt consistency (15%).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-bg-card border border-navy-border/80 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-electric-violet/20 border border-electric-violet/40 flex items-center justify-center text-electric-violet shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-brand-white text-sm">
                    Expert Academic Jury Review (40%)
                  </h4>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                    Your final attempt is thoroughly reviewed by university domain experts across code
                    elegance (25%), algorithmic reasoning (35%), result interpretation (20%), and
                    innovation (20%).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Infographic Graphic */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-card border border-navy-border shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-navy-border/60 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-brand-white">
                <Cpu className="w-4 h-4 text-teal-accent" />
                <span>OptiForge Scoring Matrix Architecture</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-accent/20 text-teal-accent">
                v2026.1
              </span>
            </div>

            {/* Formula Visualization */}
            <div className="p-4 rounded-xl bg-bg-primary/80 border border-teal-accent/30 font-mono text-xs space-y-2 text-center">
              <span className="text-brand-dim text-[11px] block">FINAL RANKING FORMULA</span>
              <div className="text-sm sm:text-base font-bold text-teal-accent">
                Final Score = 0.60 × (Auto-Score) + 0.40 × (Judge-Score)
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-brand-white">
                <span>Solution Quality (Accuracy)</span>
                <span className="text-teal-accent">40%</span>
              </div>
              <div className="w-full bg-navy-deep rounded-full h-1.5">
                <div className="bg-teal-accent h-full rounded-full w-[40%]" />
              </div>

              <div className="flex justify-between items-center text-brand-white">
                <span>Execution Efficiency & Runtime</span>
                <span className="text-electric-violet">25%</span>
              </div>
              <div className="w-full bg-navy-deep rounded-full h-1.5">
                <div className="bg-electric-violet h-full rounded-full w-[25%]" />
              </div>

              <div className="flex justify-between items-center text-brand-white">
                <span>Algorithm Design Quality (AST)</span>
                <span className="text-status-green">20%</span>
              </div>
              <div className="w-full bg-navy-deep rounded-full h-1.5">
                <div className="bg-status-green h-full rounded-full w-[20%]" />
              </div>

              <div className="flex justify-between items-center text-brand-white">
                <span>Multi-Attempt Consistency</span>
                <span className="text-orange-accent">15%</span>
              </div>
              <div className="w-full bg-navy-deep rounded-full h-1.5">
                <div className="bg-orange-accent h-full rounded-full w-[15%]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM TRACKS PREVIEW */}
      <section id="tracks" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-electric-violet/10 border border-electric-violet/30 text-electric-violet text-xs font-mono">
            <Binary className="w-3.5 h-3.5" />
            <span>4 Competitive Problem Domains</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-white">
            Choose Your Computational Arena
          </h2>
          <p className="text-sm text-brand-muted max-w-xl mx-auto">
            Each track comes with starter templates, benchmark test cases, and domain evaluation metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Track 1 */}
          <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-4 hover:border-teal-accent/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-teal-accent font-bold px-2.5 py-1 rounded bg-teal-accent/10 border border-teal-accent/30">
                TRACK 01
              </span>
              <span className="text-xs font-mono text-brand-muted px-2 py-0.5 rounded bg-bg-secondary">
                Intermediate
              </span>
            </div>
            <h3 className="font-display font-bold text-xl text-brand-white group-hover:text-teal-accent transition-colors">
              Genetic Algorithms: Multi-Constraint Combinatorial Optimization
            </h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Design evolutionary operators (tournament selection, two-point crossover, adaptive
              mutation, and elitism) to maximize high-dimensional resource utilization under tight
              knapsack capacity boundaries.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-brand-dim">
              <span className="px-2 py-0.5 rounded bg-navy-deep/60">Binary Chromosomes</span>
              <span className="px-2 py-0.5 rounded bg-navy-deep/60">Roulette / Tournament</span>
              <span className="px-2 py-0.5 rounded bg-navy-deep/60">Elitism Survival</span>
            </div>
          </div>

          {/* Track 2 */}
          <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-4 hover:border-electric-violet/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-electric-violet font-bold px-2.5 py-1 rounded bg-electric-violet/10 border border-electric-violet/30">
                TRACK 02
              </span>
              <span className="text-xs font-mono text-brand-muted px-2 py-0.5 rounded bg-bg-secondary">
                Advanced
              </span>
            </div>
            <h3 className="font-display font-bold text-xl text-brand-white group-hover:text-electric-violet transition-colors">
              Particle Swarm Optimization: Continuous Non-Linear Landscapes
            </h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Navigate multi-modal, rugged surfaces (Rastrigin & Ackley benchmarks). Balance particle
              inertia weight, cognitive personal-best pull, and social swarm attraction with velocity
              clamping.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-brand-dim">
              <span className="px-2 py-0.5 rounded bg-navy-deep/60">Velocity Clamping</span>
              <span className="px-2 py-0.5 rounded bg-navy-deep/60">Inertia Damping</span>
              <span className="px-2 py-0.5 rounded bg-navy-deep/60">Global Minimum Search</span>
            </div>
          </div>

          {/* Track 3 */}
          <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-4 hover:border-orange-accent/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-orange-accent font-bold px-2.5 py-1 rounded bg-orange-accent/10 border border-orange-accent/30">
                TRACK 03
              </span>
              <span className="text-xs font-mono text-brand-muted px-2 py-0.5 rounded bg-bg-secondary">
                Advanced
              </span>
            </div>
            <h3 className="font-display font-bold text-xl text-brand-white group-hover:text-orange-accent transition-colors">
              Ant Colony Optimization: Dynamic Combinatorial Graph Routing
            </h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Formulate artificial pheromone trail dynamics (deposition, evaporation, and heuristic
              visibility) to determine minimal-cost tours through dense weighted graph topologies.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-brand-dim">
              <span className="px-2 py-0.5 rounded bg-navy-deep/60">Pheromone Evaporation</span>
              <span className="px-2 py-0.5 rounded bg-navy-deep/60">Stochastic Transition</span>
              <span className="px-2 py-0.5 rounded bg-navy-deep/60">Max-Min Ant Bounds</span>
            </div>
          </div>

          {/* Track 4 */}
          <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-4 hover:border-status-green/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-status-green font-bold px-2.5 py-1 rounded bg-status-green/10 border border-status-green/30">
                TRACK 04
              </span>
              <span className="text-xs font-mono text-brand-muted px-2 py-0.5 rounded bg-bg-secondary">
                Intermediate
              </span>
            </div>
            <h3 className="font-display font-bold text-xl text-brand-white group-hover:text-status-green transition-colors">
              Fuzzy Logic: Non-Linear Dynamic Control & Inference
            </h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Design Mamdani or Sugeno fuzzy rule bases, configure triangular and trapezoidal
              membership partitions, and implement Centroid defuzzification for dynamic feedback
              control.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-brand-dim">
              <span className="px-2 py-0.5 rounded bg-navy-deep/60">Mamdani Inference</span>
              <span className="px-2 py-0.5 rounded bg-navy-deep/60">Centroid Defuzzification</span>
              <span className="px-2 py-0.5 rounded bg-navy-deep/60">Closed-Loop Stability</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS: 5-STEP PIPELINE */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-accent/10 border border-teal-accent/30 text-teal-accent text-xs font-mono">
            <Layers className="w-3.5 h-3.5" />
            <span>Workflow & Timeline</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-white">
            From Registration to Podium
          </h2>
          <p className="text-sm text-brand-muted max-w-xl mx-auto">
            A seamless, stress-tested live tournament lifecycle designed for high-concurrency event day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              step: "01",
              title: "Register & Pay",
              desc: "Form a team of 2–4 members. Submit domain preferences and complete ₹50/member fee on Razorpay.",
              badge: "Online",
            },
            {
              step: "02",
              title: "Get Domain & Starter Code",
              desc: "Log in with your Team ID (OPT-26-XXXX). Download pre-configured starter notebook templates.",
              badge: "Portal",
            },
            {
              step: "03",
              title: "3 Live-Scored Attempts",
              desc: "Upload code updates. Instant sandbox benchmark computes accuracy, speed, and design quality.",
              badge: "Live Arena",
            },
            {
              step: "04",
              title: "Expert Human Review",
              desc: "Academic judges inspect your final attempt code, written reasoning, and optimization heuristics.",
              badge: "Faculty Jury",
            },
            {
              step: "05",
              title: "Winners & E-Certificates",
              desc: "Live leaderboard freeze lifts. Winners announced. Official verified E-Certificates issued to all.",
              badge: "Valedictory",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-bg-card border border-navy-border/80 space-y-3 flex flex-col justify-between hover:border-teal-accent/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-signature">
                    {item.step}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-deep text-brand-muted">
                    {item.badge}
                  </span>
                </div>
                <h4 className="font-display font-bold text-brand-white text-sm">{item.title}</h4>
                <p className="text-xs text-brand-muted mt-2 leading-relaxed font-sans">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PERKS & PRIZES SECTION (Strictly no numbers per user instructions) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-card border border-navy-border p-8 sm:p-12 space-y-8 text-center relative overflow-hidden">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-teal-accent font-semibold px-3.5 py-1 rounded-full bg-teal-accent/10 border border-teal-accent/30">
              Rewards, Recognition & Perks
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-brand-white">
              Exciting Prize Pool & Exclusive Goodies
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-sans">
              Compete for top honors, trophies, exclusive IEEE tech merchandise, and verified credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
            <div className="p-5 rounded-2xl bg-bg-secondary/70 border border-navy-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-accent/20 border border-orange-accent/40 flex items-center justify-center text-orange-accent">
                <Trophy className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-brand-white text-base">
                Exciting Prize Pool & Awards
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Attractive awards for top-performing teams across all 4 computational intelligence domains.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-bg-secondary/70 border border-navy-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-accent/20 border border-teal-accent/40 flex items-center justify-center text-teal-accent">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-brand-white text-base">
                Official E-Certificates
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Official E-Certificates of Participation & Excellence will be provided to all verified
                participants.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-bg-secondary/70 border border-navy-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-electric-violet/20 border border-electric-violet/40 flex items-center justify-center text-electric-violet">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-brand-white text-base">
                Exclusive IEEE Goodies
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Exclusive swag, stickers, tech goodies, and IEEE membership mentorship opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. RULES & FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="font-display font-bold text-3xl text-brand-white">Frequently Asked Questions</h2>
          <p className="text-xs text-brand-muted font-mono">
            Everything you need to know regarding registration, rules, and event day execution.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="rounded-xl border border-navy-border bg-bg-card overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-sm font-medium text-brand-white hover:text-teal-accent transition-colors"
                >
                  <span>{f.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-teal-accent shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-brand-muted leading-relaxed border-t border-navy-border/40 pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. STICKY / BOTTOM CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-bg-secondary border border-teal-accent/40 shadow-glow relative overflow-hidden space-y-6">
          <div className="space-y-2">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-white">
              Ready to Optimize the Unoptimizable?
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted max-w-lg mx-auto">
              Registration closes soon. Gather your teammates and lock in your domain track today.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-gradient-signature text-bg-primary font-display font-bold text-sm shadow-glow hover:brightness-110 transition-all flex items-center gap-2 group"
            >
              <span>Register Now (₹50 / participant)</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-xl bg-navy-deep hover:bg-navy-deep/80 border border-navy-border text-brand-white font-mono text-xs transition-colors"
            >
              Already Registered? Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
