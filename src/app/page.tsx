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
  ShieldAlert,
  Download,
  Eye,
  CheckSquare,
  HelpCircle,
  Radio,
} from "lucide-react";
import CoverageMapVisualization from "@/components/CoverageMapVisualization";

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

  // Selected Problem Modal state
  const [selectedProblem, setSelectedProblem] = useState<any | null>(null);

  // Accordion FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const officialProblems = [
    {
      id: "p1-hospital-scheduling",
      num: "P1",
      title: "Hospital Staff Scheduling with Fatigue-Aware Optimization",
      shortTitle: "Hospital Staff Scheduling",
      society: "IEEE EMBS × IEEE CIS",
      difficulty: "Intermediate–Advanced",
      technique: "Genetic Algorithm + Fuzzy Fatigue Model",
      starterFile: "/starter/starter_p1_scheduling.py",
      context:
        "A hospital must schedule doctors, nurses, technicians, and support staff across a 7-day planning horizon. Each employee has availability, skills, contractual working-hour limits, shift preferences, and rest requirements.",
      coreChallenge:
        "Construct a schedule satisfying hard staffing requirements while reducing overtime and fatigue risk — modeled via continuous fuzzy inference based on consecutive shifts, night work, and cumulative workload.",
      hardConstraints: [
        "Minimum qualified staffing met across all shifts",
        "Employees cannot work overlapping shifts",
        "Minimum rest duration strictly satisfied",
        "Maximum contractual working hours not exceeded",
        "Critical departments require appropriate certified skill coverage",
      ],
      optimizationObjectives: [
        "Minimize cumulative fuzzy fatigue risk score",
        "Minimize overtime hours and penalty costs",
        "Minimize employee shift preference violations",
        "Minimize skill mismatch while preserving department coverage",
      ],
      attemptProgression: "Attempt 1: Base schedule → Attempt 2: Shift (Staff reduction) → Attempt 3: Shift (Department demand spike)",
    },
    {
      id: "p2-drone-delivery",
      num: "P2",
      title: "Drone-Based Emergency Medical Supply Delivery",
      shortTitle: "Drone Medical Delivery",
      society: "IEEE EMBS × IEEE CIS",
      difficulty: "Advanced",
      technique: "Ant Colony Optimization + Genetic Algorithm",
      starterFile: "/starter/starter_p2_drone.py",
      context:
        "A fleet of autonomous drones must deliver medicines, blood products, and emergency supplies from hospitals to remote clinics. Each drone has battery capacity, payload limit, speed, and charging requirements.",
      coreChallenge:
        "Determine which drone serves each request, delivery order, charging decisions, and return paths under strict transit-duration limits for temperature-sensitive supplies.",
      hardConstraints: [
        "Payload and battery capacities cannot be exceeded",
        "Drone range must permit safe completion or approved charging",
        "High-priority deliveries have strict non-negotiable arrival deadlines",
        "Temperature-sensitive supplies have maximum allowable transit duration",
        "Drone and charging-station resources cannot be shared by incompatible tasks",
      ],
      optimizationObjectives: [
        "Maximize on-time priority deliveries to remote medical centers",
        "Minimize total flight energy consumption and mission distance",
        "Minimize missed deadlines and priority lateness penalties",
        "Minimize thermal degradation risk for sensitive cargo",
      ],
      attemptProgression: "Attempt 1: Standard routing → Attempt 2: Shift (Adverse headwinds +25% energy) → Attempt 3: Shift (Demand surge & tight deadlines)",
    },
    {
      id: "p3-emergency-hospital",
      num: "P3",
      title: "Emergency Hospital Destination Selection Under Dynamic Capacity",
      shortTitle: "Hospital Destination Selection",
      society: "IEEE EMBS × IEEE CIS",
      difficulty: "Advanced",
      technique: "Fuzzy Logic + Particle Swarm Optimization",
      starterFile: "/starter/starter_p3_hospital.py",
      context:
        "An emergency ambulance must select a destination hospital for a critically ill patient. Candidate hospitals have variable travel times, ER queues, ICU beds, and specialist availability.",
      coreChallenge:
        "Select the hospital minimizing expected time to definitive treatment — not simply travel time — balancing dynamic queues, travel time, and specialist presence under clinical uncertainty.",
      hardConstraints: [
        "Hospital without required capability/equipment cannot be selected",
        "Predicted treatment delay and specialist availability factored in",
        "ICU or specialist capacity shifts during transport accounted for",
        "Critical patient triage levels receive highest decision priority",
        "Decisions must remain fully interpretable to clinical EMS operators",
      ],
      optimizationObjectives: [
        "Minimize expected total time to definitive medical treatment",
        "Minimize uncertainty-related risk and diversion probability",
        "Minimize inappropriate resource utilization and secondary transfers",
      ],
      attemptProgression: "Attempt 1: Base destination ranking → Attempt 2: Shift (Tier-1 ER congestion) → Attempt 3: Shift (Key specialist unavailability)",
    },
    {
      id: "p4-blood-inventory",
      num: "P4",
      title: "Hospital Blood Inventory and Compatibility-Aware Allocation",
      shortTitle: "Blood Inventory Allocation",
      society: "IEEE EMBS × IEEE CIS",
      difficulty: "Advanced",
      technique: "Genetic Algorithm / Particle Swarm Optimization",
      starterFile: "/starter/starter_p4_blood.py",
      context:
        "A hospital maintains inventories of multiple blood groups (A, B, AB, O with Rh factors) with 35–42 day shelf lives. Daily demand is uncertain, and compatible substitutions may consume universal O-negative units.",
      coreChallenge:
        "Determine procurement quantities, allocation decisions, inventory rotation, and emergency substitution policies, balancing stockout risk against expiry-related wastage.",
      hardConstraints: [
        "Blood-group biological compatibility strictly respected",
        "Expired units cannot be transfused under any circumstance",
        "Inventory levels cannot become negative",
        "Emergency demand receives absolute highest fulfillment priority",
        "Procurement capacity and delivery schedules have minimum lead times",
      ],
      optimizationObjectives: [
        "Minimize blood unit expiry and wastage across all ABO/Rh groups",
        "Minimize stockout probability and emergency shortage severity",
        "Minimize emergency procurement rush costs",
        "Preserve compatibility flexibility for rare blood groups",
      ],
      attemptProgression: "Attempt 1: Multi-day inventory policy → Attempt 2: Shift (Mass trauma emergency demand) → Attempt 3: Shift (48h supply delay)",
    },
    {
      id: "p5-search-and-rescue",
      num: "P5",
      title: "Multi-Robot Search-and-Rescue Area Coverage (Flagship Showcase)",
      shortTitle: "Multi-Robot Search & Rescue",
      society: "IEEE EMBS × IEEE CIS",
      difficulty: "Advanced (Flagship Showcase)",
      technique: "PSO / ACO / Multi-Agent Genetic Algorithm",
      starterFile: "/starter/starter_p5_sar.py",
      isFlagship: true,
      context:
        "A set of autonomous mobile robots must search an unknown disaster environment for survivors. Each robot has limited battery, sensor range, movement speed, and communication limits.",
      coreChallenge:
        "Divide the search area among robots to maximize survivor-detection probability while minimizing redundant exploration and battery consumption. When one robot detects a survivor, nearby robots dynamically replan to assist.",
      hardConstraints: [
        "Robot battery must not fall below safe return-to-base threshold",
        "Communication connectivity maintained where required",
        "Dangerous and collapsed regions carry high penalties or forbidden",
        "Robots must avoid unnecessary trajectory overlap",
        "Detected survivor triggers dynamic task reassignment and rendezvous",
      ],
      optimizationObjectives: [
        "Maximize expected survivor detection probability across high-priority zones",
        "Maximize total area coverage within battery budget",
        "Minimize redundant search overlap between robots",
        "Minimize response delay after initial survivor contact",
      ],
      attemptProgression: "Attempt 1: Swarm area search → Attempt 2: Shift (Debris collapse / corridor cutoff) → Attempt 3: Shift (Secondary zone probability shift)",
    },
    {
      id: "p6-fuzzy-triage",
      num: "P6",
      title: "Fuzzy Emergency-Room Triage with Adaptive Rule Optimization",
      shortTitle: "Fuzzy ER Triage",
      society: "IEEE EMBS × IEEE CIS",
      difficulty: "Advanced",
      technique: "Fuzzy Logic + Genetic Algorithm",
      starterFile: "/starter/starter_p6_triage.py",
      context:
        "An emergency department receives patients with varying symptoms and uncertain severity (heart rate, blood pressure, oxygen saturation, pain, consciousness).",
      coreChallenge:
        "Design an interpretable fuzzy triage system mapping patient observations to priority levels, capturing combinations of moderately abnormal values that together indicate high risk.",
      hardConstraints: [
        "Critical patients must not be assigned low-priority categories",
        "Fuzzy rules must remain clinically interpretable to medical doctors",
        "Resource allocation must respect available emergency department capacity",
        "Uncertain, noisy, or missing physiological measurements handled gracefully",
        "Avoid excessive mathematical dependence on any single vital sign",
      ],
      optimizationObjectives: [
        "Minimize critical-patient waiting time to physician assessment",
        "Minimize inappropriate under-triage and over-triage rates",
        "Minimize emergency department resource overload and queue bottlenecks",
        "Maximize stability under noisy or incomplete clinical measurements",
      ],
      attemptProgression: "Attempt 1: Rule base formulation → Attempt 2: Shift (Noisy sensor telemetry) → Attempt 3: Shift (Conflicting vitals edge cases)",
    },
  ];

  const faqs = [
    {
      q: "Who is eligible to participate in OptiForge 2026?",
      a: "OptiForge is open to all engineering, technology, and science students. Teams can have 2 to 4 members across branches (CSE, IT, ECE, AI&ML, EEE, MECH, etc.). Interdisciplinary teams are highly encouraged!",
    },
    {
      q: "Why can't this competition simply be prompted into an LLM?",
      a: "OptiForge features hidden scenario shifts injected between attempts, AST code verification for heuristic structure, a live 15–20 minute surprise patch round with zero AI allowed, and an in-person judge viva where teams must mathematically defend their algorithmic choices.",
    },
    {
      q: "What is the registration fee and how is it paid?",
      a: "The registration fee is ₹50 per participant (₹100 for 2 members, ₹150 for 3 members, ₹200 for 4 members). Payments are secured via Razorpay and verified under the official IEEE Vardhaman Student Branch entity.",
    },
    {
      q: "Do we need to build a web frontend or deploy an API?",
      a: "No! OptiForge tests pure algorithmic optimization. You upload your Python script (.py) or notebook (.ipynb). Our sandboxed engine executes it against held-out benchmark datasets and evaluates fitness, efficiency, and design.",
    },
    {
      q: "What perks and certificates do participants receive?",
      a: "All verified participants receive official E-Certificates of Participation & Excellence issued jointly by IEEE EMBS Student Chapter and IEEE CIS Local Chapter, Vardhaman College of Engineering, along with goodies and prize recognition for top teams.",
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-deep/80 border border-teal-accent/30 text-teal-accent text-xs font-mono mb-6 shadow-glow">
          <span className="w-2 h-2 rounded-full bg-teal-accent animate-pulse" />
          <span>IEEE Vardhaman Student Branch · IEEE EMBS × IEEE CIS</span>
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
          systems. Compete across 6 real-world challenges with live multi-attempt scoring, scenario shifts,
          a live surprise patch round, and expert judge defense.
        </p>

        {/* Event Schedule Pill */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-brand-white">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-secondary border border-navy-border">
            <Calendar className="w-4 h-4 text-teal-accent" />
            <span>25-09-2026</span>
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
          <a
            href="#problems"
            className="px-6 py-3.5 rounded-xl bg-bg-secondary hover:bg-navy-deep border border-navy-border hover:border-teal-accent text-brand-white font-medium text-sm transition-all flex items-center gap-2"
          >
            <FileCode className="w-4 h-4 text-teal-accent" />
            <span>Explore 6 Problem Statements</span>
          </a>
          <Link
            href="/leaderboard"
            className="px-6 py-3.5 rounded-xl bg-bg-secondary hover:bg-navy-deep border border-navy-border hover:border-electric-violet text-brand-white font-medium text-sm transition-all flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-electric-violet" />
            <span>Live Leaderboard</span>
          </Link>
        </div>
      </section>

      {/* 2. HOW IT WORKS: 8-STEP LIFECYCLE STEPPER (Directly below Hero) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-accent/10 border border-teal-accent/30 text-teal-accent text-xs font-mono">
            <Layers className="w-3.5 h-3.5" />
            <span>Complete Tournament Architecture</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-white">
            How OptiForge Works: The 8-Stage Lifecycle
          </h2>
          <p className="text-sm text-brand-muted max-w-2xl mx-auto">
            A structured competition progression testing foundational formulation, dynamic scenario adaptation,
            real-time agility, and academic defense.
          </p>
        </div>

        {/* 8-Step Grid / Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: "Stage 01",
              time: "09:00 - 09:30",
              title: "Problem Selection & Strategy",
              desc: "Teams review all 6 real-world challenges, submit track preferences, and analyze domain formulations.",
              badge: "Strategy",
            },
            {
              step: "Stage 02",
              time: "09:30 - 10:00",
              title: "Starter Code & Test Harness",
              desc: "Download official Python starter scripts, offline evaluation harness, and synthetic test datasets.",
              badge: "Distribution",
            },
            {
              step: "Stage 03",
              time: "10:00 - 11:15",
              title: "Attempt 1 — Baseline",
              desc: "Implement core heuristic algorithm for the base scenario. Immediate sandboxed auto-score on leaderboard.",
              badge: "Scored Attempt #1",
            },
            {
              step: "Stage 04",
              time: "11:30 - 12:45",
              title: "Hidden Shift #1 & Attempt 2",
              desc: "Surprise parameter perturbation injected into test suite. Adapt code and submit mandatory reflection note.",
              badge: "Scored Attempt #2",
            },
            {
              step: "Stage 05",
              time: "13:15 - 14:15",
              title: "Hidden Shift #2 & Attempt 3",
              desc: "Stress edge case injected. Final algorithm refinement for maximum convergence, efficiency, and stability.",
              badge: "Scored Attempt #3",
            },
            {
              step: "Stage 06",
              time: "14:15",
              title: "Leaderboard Freeze",
              desc: "Public rankings freeze. Teams lock their final submissions before confidential judging rounds begin.",
              badge: "Rankings Lock",
            },
            {
              step: "Stage 07",
              time: "14:30 - 15:00",
              title: "The Live Patch Round",
              desc: "15–20 minute surprise constraint window. ZERO AI ALLOWED. Tests real-time problem-solving agility.",
              badge: "Zero AI Test",
              highlight: true,
            },
            {
              step: "Stage 08",
              time: "15:00 - 16:00",
              title: "Judges' Viva Q&A & Results",
              desc: "1-on-1 viva defense before domain faculty judges. Defend representations, operators, and shift handling.",
              badge: "Expert Jury",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-5 space-y-3 transition-all ${
                item.highlight
                  ? "bg-orange-accent/10 border-2 border-orange-accent/50 shadow-glow"
                  : "bg-bg-card border border-navy-border/80 hover:border-teal-accent/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-teal-accent">{item.step}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    item.highlight
                      ? "bg-orange-accent/20 text-orange-accent border border-orange-accent/40 font-bold"
                      : "bg-bg-secondary text-brand-dim"
                  }`}
                >
                  {item.badge}
                </span>
              </div>
              <div className="font-mono text-[11px] text-brand-muted flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-electric-violet" />
                <span>{item.time}</span>
              </div>
              <h3 className="font-display font-semibold text-brand-white text-sm">{item.title}</h3>
              <p className="text-xs text-brand-muted leading-relaxed font-sans">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ANTI-SHORTCUT CALLOUT: WHY THIS CANNOT BE PROMPTED INTO A WIN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-bg-card via-bg-card to-navy-deep border border-electric-violet/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-electric-violet/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-lg bg-electric-violet/20 border border-electric-violet/40 text-electric-violet text-xs font-mono font-semibold">
              <ShieldAlert className="w-4 h-4" />
              <span>OptiForge Integrity Architecture</span>
            </div>

            <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-white">
              Why OptiForge Cannot Simply Be &quot;Prompted&quot; Into a Win
            </h2>

            <p className="text-sm text-brand-muted leading-relaxed">
              Most engineering competitions collapse when participants paste problem prompts into generic LLMs.
              OptiForge is explicitly engineered with multiple defensive architectural layers to evaluate genuine
              computational intelligence intuition and engineering skill:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-bg-secondary/70 border border-navy-border/80 space-y-1.5">
                <div className="text-xs font-display font-semibold text-teal-accent flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Hidden Scenario Shifts</span>
                </div>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Static prompt solutions break on Attempts 2 & 3 when dynamic perturbations (resource drops, surges)
                  are injected into held-out test data.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-bg-secondary/70 border border-navy-border/80 space-y-1.5">
                <div className="text-xs font-display font-semibold text-teal-accent flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mandatory Reflection Notes</span>
                </div>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Every submission after Attempt 1 requires a &quot;what changed and why&quot; note detailing parameter
                  adaptation and algorithmic defense.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-bg-secondary/70 border border-navy-border/80 space-y-1.5">
                <div className="text-xs font-display font-semibold text-orange-accent flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Stage 7 Live Patch (Zero AI)</span>
                </div>
                <p className="text-xs text-brand-muted leading-relaxed">
                  A 15–20 minute live surprise constraint with strictly ZERO AI allowed. Tests live code modification,
                  mental model clarity, and edge-case handling.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-bg-secondary/70 border border-navy-border/80 space-y-1.5">
                <div className="text-xs font-display font-semibold text-electric-violet flex items-center gap-2">
                  <Award className="w-3.5 h-3.5" />
                  <span>Stage 8 Expert Viva Defense</span>
                </div>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Faculty judges question teams on fitness functions, defuzzification math, chromosome representations,
                  and convergence graphs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PREREQUISITES: WHAT YOU GET vs. WHAT YOU BRING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-accent/10 border border-teal-accent/30 text-teal-accent text-xs font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>Level Playing Field</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-white">
            Prerequisites: What You Get vs. What You Bring
          </h2>
          <p className="text-sm text-brand-muted max-w-2xl mx-auto">
            You don&apos;t need web development or infrastructure skills. We provide the execution environment;
            you bring algorithmic intuition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Panel Left: What You Get */}
          <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-teal-accent/30 space-y-6">
            <div className="flex items-center gap-3 border-b border-navy-border/60 pb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-accent/20 border border-teal-accent/40 flex items-center justify-center text-teal-accent">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-brand-white">What You Get from OptiForge</h3>
                <p className="text-xs text-brand-muted">Pre-packaged starter kits & verification harness</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-brand-muted font-sans">
              {[
                "Modular Python starter scripts (.py) and notebooks (.ipynb) for all 6 tracks",
                "Pre-built synthetic data generators and scenario loaders",
                "Offline verification harness with identical scoring metrics",
                "Isolated sandbox execution environment with standard scientific libraries",
                "Instant multi-metric feedback (solution quality, runtime, AST design, consistency)",
                "Working baseline heuristic solution for rapid experimentation",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-accent shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Panel Right: What You Bring */}
          <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-electric-violet/30 space-y-6">
            <div className="flex items-center gap-3 border-b border-navy-border/60 pb-4">
              <div className="w-10 h-10 rounded-xl bg-electric-violet/20 border border-electric-violet/40 flex items-center justify-center text-electric-violet">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-brand-white">What You Must Bring</h3>
                <p className="text-xs text-brand-muted">Algorithmic reasoning & problem-solving ability</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-brand-muted font-sans">
              {[
                "Algorithmic formulation: choosing representation (chromosomes, particles, pheromone paths)",
                "Fitness function engineering: formulating multi-objective trade-offs and penalties",
                "Hyperparameter tuning: population size, crossover rates, inertia damping, evaporation",
                "Dynamic resilience: adapting code when hidden scenario shifts alter constraints",
                "Interpretability & defense: ability to explain choices and convergence curves during viva",
                "Teamwork & agility: rapid live patch implementation under tight 20-minute countdown",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-electric-violet shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. PROBLEM 5 FLAGSHIP SHOWCASE WITH INTERACTIVE COVERAGE MAP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-accent/10 border border-teal-accent/30 text-teal-accent text-xs font-mono">
            <Radio className="w-3.5 h-3.5" />
            <span>Flagship Interactive Arena</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-white">
            Problem 5: Multi-Robot Search & Rescue
          </h2>
          <p className="text-sm text-brand-muted max-w-xl mx-auto">
            Live interactive preview of the flagship showcase problem: swarm robotics, obstacle avoidance,
            and dynamic survivor rendezvous.
          </p>
        </div>

        {/* The interactive Coverage Map Component */}
        <CoverageMapVisualization />
      </section>

      {/* 6. ALL 6 OFFICIAL PROBLEM STATEMENTS */}
      <section id="problems" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-electric-violet/10 border border-electric-violet/30 text-electric-violet text-xs font-mono">
            <Binary className="w-3.5 h-3.5" />
            <span>Official Track Portfolio</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-white">
            6 Official Problem Statements
          </h2>
          <p className="text-sm text-brand-muted max-w-2xl mx-auto">
            All 6 challenges are engineered under IEEE EMBS × IEEE CIS guidance with standardized 7-section
            formulations and starter notebooks.
          </p>
        </div>

        {/* 6 Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {officialProblems.map((prob) => (
            <div
              key={prob.id}
              className={`rounded-2xl bg-bg-card p-6 flex flex-col justify-between space-y-5 transition-all border ${
                prob.isFlagship
                  ? "border-teal-accent/50 shadow-glow"
                  : "border-navy-border/80 hover:border-teal-accent/40"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-teal-accent/10 border border-teal-accent/30 text-teal-accent">
                    {prob.num}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-secondary text-brand-muted">
                    {prob.difficulty}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-brand-white leading-snug">
                  {prob.title}
                </h3>

                <div className="text-[11px] font-mono text-electric-violet bg-electric-violet/10 border border-electric-violet/20 px-2.5 py-1 rounded">
                  {prob.technique}
                </div>

                <p className="text-xs text-brand-muted leading-relaxed line-clamp-3">
                  {prob.coreChallenge}
                </p>

                {/* Hard Constraints Summary */}
                <div className="space-y-1.5 pt-2 border-t border-navy-border/50">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-dim block">
                    Key Constraints
                  </span>
                  <ul className="text-[11px] text-brand-muted space-y-1">
                    {prob.hardConstraints.slice(0, 2).map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5 truncate">
                        <span className="text-teal-accent">•</span>
                        <span className="truncate">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-navy-border/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedProblem(prob)}
                  className="px-3 py-2 rounded-xl bg-bg-secondary hover:bg-navy-deep border border-navy-border text-xs text-brand-white flex items-center gap-1.5 transition-colors font-medium"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-accent" />
                  <span>Full Spec</span>
                </button>
                <a
                  href={prob.starterFile}
                  download
                  className="px-3 py-2 rounded-xl bg-teal-accent/10 hover:bg-teal-accent/20 border border-teal-accent/30 text-xs text-teal-accent flex items-center gap-1.5 transition-colors font-mono"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Starter .py</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SCORING MATRIX: BROAD CATEGORIES (Strict Visibility Compliant) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-accent/10 border border-teal-accent/30 text-teal-accent text-xs font-mono">
            <Trophy className="w-3.5 h-3.5" />
            <span>Evaluation Framework</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-white">
            Hybrid Scoring Architecture
          </h2>
          <p className="text-sm text-brand-muted max-w-xl mx-auto">
            Your final standing blends instant automated sandboxed benchmarks with rigorous human viva defense.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Automated Evaluation Categories */}
          <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-navy-border/80 space-y-4">
            <div className="flex items-center gap-2 font-display font-bold text-lg text-brand-white">
              <Terminal className="w-5 h-5 text-teal-accent" />
              <span>Part I: Automated Sandbox Benchmarking</span>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              Executed instantly in an isolated runtime sandbox against held-out scenario test suites:
            </p>
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-bg-secondary/60 border border-navy-border/60">
                <div className="text-xs font-semibold text-brand-white">Solution Quality & Optimality</div>
                <div className="text-[11px] text-brand-muted mt-0.5">Objective value score relative to optimal/greedy baseline benchmarks.</div>
              </div>
              <div className="p-3 rounded-xl bg-bg-secondary/60 border border-navy-border/60">
                <div className="text-xs font-semibold text-brand-white">Execution Efficiency & Scalability</div>
                <div className="text-[11px] text-brand-muted mt-0.5">Wall-clock execution time and convergence speed per iteration.</div>
              </div>
              <div className="p-3 rounded-xl bg-bg-secondary/60 border border-navy-border/60">
                <div className="text-xs font-semibold text-brand-white">Algorithm Design Quality (AST)</div>
                <div className="text-[11px] text-brand-muted mt-0.5">Static AST inspection verifying heuristic operators, loop structures, and diversity.</div>
              </div>
              <div className="p-3 rounded-xl bg-bg-secondary/60 border border-navy-border/60">
                <div className="text-xs font-semibold text-brand-white">Multi-Attempt Consistency</div>
                <div className="text-[11px] text-brand-muted mt-0.5">Performance stability across Attempts 1, 2, and 3 under injected scenario shifts.</div>
              </div>
            </div>
          </div>

          {/* Judge Evaluation Categories */}
          <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-navy-border/80 space-y-4">
            <div className="flex items-center gap-2 font-display font-bold text-lg text-brand-white">
              <Shield className="w-5 h-5 text-electric-violet" />
              <span>Part II: Domain Faculty Jury Review</span>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              Assessed by university domain experts during Stage 8 Viva Q&A:
            </p>
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-bg-secondary/60 border border-navy-border/60">
                <div className="text-xs font-semibold text-brand-white">Code Elegance & Modularity</div>
                <div className="text-[11px] text-brand-muted mt-0.5">Readable, structured, well-commented code following clean scientific standards.</div>
              </div>
              <div className="p-3 rounded-xl bg-bg-secondary/60 border border-navy-border/60">
                <div className="text-xs font-semibold text-brand-white">Algorithmic Reasoning & Defense</div>
                <div className="text-[11px] text-brand-muted mt-0.5">Depth of justification for chosen representations, crossover/inertia rules, and live patch.</div>
              </div>
              <div className="p-3 rounded-xl bg-bg-secondary/60 border border-navy-border/60">
                <div className="text-xs font-semibold text-brand-white">Convergence & Result Interpretation</div>
                <div className="text-[11px] text-brand-muted mt-0.5">Ability to explain fitness evolution, sensitivity trade-offs, and failure modes.</div>
              </div>
              <div className="p-3 rounded-xl bg-bg-secondary/60 border border-navy-border/60">
                <div className="text-xs font-semibold text-brand-white">Adaptation to Scenario Shifts</div>
                <div className="text-[11px] text-brand-muted mt-0.5">Quality of written reflections and dynamic handling of hidden perturbations.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. RECOGNITION & PERKS (PRIZE POOL & GOODIES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-bg-card border border-navy-border/80 text-center space-y-6 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-lg bg-teal-accent/10 border border-teal-accent/30 text-teal-accent text-xs font-mono">
            <Award className="w-4 h-4" />
            <span>Perks & Recognition</span>
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-white">
            Prizes, Goodies & Participation Honors
          </h2>

          <p className="text-brand-muted text-sm max-w-xl mx-auto leading-relaxed">
            Every participating team earns verified credentials and competitive prestige.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 max-w-3xl mx-auto text-left">
            <div className="p-5 rounded-2xl bg-bg-secondary border border-navy-border space-y-2">
              <Trophy className="w-6 h-6 text-orange-accent" />
              <h4 className="font-display font-semibold text-brand-white text-sm">Prize Pool & Goodies</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Podium finishes and category awards receive official prize packages, trophies, and tech goodies.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-bg-secondary border border-navy-border space-y-2">
              <Award className="w-6 h-6 text-teal-accent" />
              <h4 className="font-display font-semibold text-brand-white text-sm">Official E-Certificates</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                All verified participants receive authenticated E-Certificates of Participation & Excellence.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-bg-secondary border border-navy-border space-y-2">
              <Users className="w-6 h-6 text-electric-violet" />
              <h4 className="font-display font-semibold text-brand-white text-sm">IEEE Student Perks</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Mentorship from IEEE faculty, networking with peers, and membership discount opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-accent/10 border border-teal-accent/30 text-teal-accent text-xs font-mono">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="font-display font-bold text-3xl text-brand-white">Need Clarification?</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-bg-card border border-navy-border/80 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-display font-semibold text-sm text-brand-white hover:text-teal-accent transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-brand-muted shrink-0 transition-transform duration-300 ${
                    openFaq === idx ? "rotate-180 text-teal-accent" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-brand-muted leading-relaxed border-t border-navy-border/40">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. MODAL: FULL 7-SECTION PROBLEM STATEMENT VIEWER */}
      {selectedProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-3xl rounded-3xl bg-bg-card border border-teal-accent/40 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[88vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedProblem(null)}
              className="absolute top-5 right-5 p-2 text-brand-muted hover:text-brand-white transition-colors"
            >
              ✕
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-0.5 rounded bg-teal-accent/10 border border-teal-accent/30 text-teal-accent font-bold">
                  {selectedProblem.num}
                </span>
                <span className="text-brand-muted">{selectedProblem.society}</span>
                <span className="text-electric-violet">· {selectedProblem.difficulty}</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-brand-white">
                {selectedProblem.title}
              </h2>
              <div className="text-xs font-mono text-teal-accent">{selectedProblem.technique}</div>
            </div>

            {/* Section 1: Real-world Context */}
            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-teal-accent font-semibold">
                1. Real-World Context
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">{selectedProblem.context}</p>
            </div>

            {/* Section 2: Core Challenge */}
            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-teal-accent font-semibold">
                2. Core Optimization Challenge
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">{selectedProblem.coreChallenge}</p>
            </div>

            {/* Section 3: Hard Constraints */}
            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-teal-accent font-semibold">
                3. Hard Constraints (Must Satisfy)
              </h4>
              <ul className="space-y-1.5 text-xs text-brand-muted">
                {selectedProblem.hardConstraints.map((c: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 4: Optimization Objectives */}
            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-teal-accent font-semibold">
                4. Optimization Objectives
              </h4>
              <ul className="space-y-1.5 text-xs text-brand-muted">
                {selectedProblem.optimizationObjectives.map((obj: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-teal-accent font-bold">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 5: Evaluation Methodology */}
            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-teal-accent font-semibold">
                5. Evaluation Methodology & Metrics
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Evaluated against synthetic multi-scenario benchmarks measuring solution quality, computational
                runtime efficiency, AST design quality, and stability under dynamic perturbations.
              </p>
            </div>

            {/* Section 6: Attempt Progression */}
            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-teal-accent font-semibold">
                6. Attempt Progression Overview
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">{selectedProblem.attemptProgression}</p>
            </div>

            {/* Section 7: Expected Team Output Checklist */}
            <div className="space-y-2 p-4 rounded-xl bg-bg-secondary/70 border border-navy-border">
              <h4 className="font-mono text-xs uppercase tracking-wider text-brand-white font-semibold">
                7. Expected Team Output Checklist (Standardized)
              </h4>
              <ul className="space-y-1.5 text-xs text-brand-muted pt-1">
                {[
                  "Algorithm implementation (submitted Python script or notebook)",
                  "Parameter configuration used, clearly stated in code comments or notes",
                  "Final objective/fitness score recorded for each attempt",
                  "Convergence or iteration evidence (logs or printouts demonstrating improvement)",
                  "Written explanation: representation, operators/rules, and CI technique rationale",
                  "A mandatory one-line 'what changed and why' note with every attempt after the first",
                ].map((chk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-teal-accent shrink-0 mt-0.5" />
                    <span>{chk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-navy-border flex items-center justify-between">
              <button
                onClick={() => setSelectedProblem(null)}
                className="px-4 py-2 rounded-xl text-xs text-brand-muted hover:text-brand-white transition-colors"
              >
                Close Spec
              </button>
              <a
                href={selectedProblem.starterFile}
                download
                className="px-5 py-2.5 rounded-xl bg-gradient-signature text-bg-primary font-semibold text-xs shadow-glow hover:brightness-110 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Official Starter Script (.py)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
