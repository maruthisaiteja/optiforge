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
  Activity,
  Bot,
  Flame,
} from "lucide-react";
import CoverageMapVisualization from "@/components/CoverageMapVisualization";

export default function LandingPage() {
  // Countdown Timer to 30-09-2026 10:00 AM IST
  const targetDate = new Date("2026-09-30T10:00:00+05:30").getTime();
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

  // 9 Official Innovation Themes
  const innovationThemes = [
    {
      id: "theme-1-biomedical-ai",
      code: "T1",
      title: "Biomedical Artificial Intelligence",
      category: "EMBS Domain",
      domainColor: "#772583",
      difficulty: "Advanced",
      technique: "Genetic Algorithm + Fuzzy Risk Modeling",
      society: "IEEE EMBS",
      starterFile: "/starter/starter_p1_scheduling.py",
      context:
        "Modern clinical workflows generate continuous multidimensional telemetry. Predictive models must accurately evaluate patient outcomes, survival risk, and treatment responsiveness under clinical uncertainty.",
      coreChallenge:
        "Engineer an interpretable diagnostic optimization pipeline combining evolutionary feature selection with fuzzy risk stratification to minimize misdiagnosis and maximize early triage accuracy.",
      hardConstraints: [
        "Patient outcome predictions must meet clinical safety and interpretability standards",
        "Imbalanced cohort distributions must not induce class collapse or blind majority voting",
        "Feature selection bounds must prevent demographic and institutional over-parameterization",
        "Real-time inference execution budget strictly bounded for bedside deployment",
      ],
      optimizationObjectives: [
        "Maximize area under the ROC curve (AUROC) across stratified held-out cohorts",
        "Minimize false negative rate on critical, high-mortality clinical indicators",
        "Minimize feature space redundancy and sensor acquisition complexity",
        "Maximize stability under noisy or missing bedside telemetry streams",
      ],
      attemptProgression: "Attempt 1: Baseline predictive classifier → Attempt 2: Shift (Missing physiological features) → Attempt 3: Shift (Severe demographic prevalence drift)",
    },
    {
      id: "theme-2-edtech",
      code: "T2",
      title: "EdTech & Intelligent Learning Systems",
      category: "CIS Domain",
      domainColor: "#00629B",
      difficulty: "Intermediate–Advanced",
      technique: "Multi-Objective Heuristics + Fuzzy Student Modeling",
      society: "IEEE CIS",
      starterFile: "/starter/starter_p2_drone.py",
      context:
        "Intelligent tutoring platforms must guide diverse cohorts through complex STEM curricula. Each learner has varying cognitive load thresholds, mastery trajectories, attention spans, and pacing preferences.",
      coreChallenge:
        "Formulate a dynamic curriculum optimization algorithm that constructs personalized adaptive learning pathways, minimizing cognitive fatigue while maximizing concept retention and completion rates.",
      hardConstraints: [
        "Prerequisite concept dependencies must be strictly respected in all generated paths",
        "Daily cognitive load bounds must not exceed maximum learner fatigue ceilings",
        "Curriculum coverage standards must remain comprehensive across all core competencies",
        "Recommendation latency must support responsive, real-time client interaction",
      ],
      optimizationObjectives: [
        "Maximize long-term concept retention probability and mastery velocity",
        "Minimize learner drop-off risk, disengagement, and cognitive overload penalties",
        "Minimize path variance across heterogeneous cohorts without sacrificing individualization",
        "Maximize engagement balance across instructional media and practice modalities",
      ],
      attemptProgression: "Attempt 1: Linear mastery optimization → Attempt 2: Shift (Sudden drop in learner study time) → Attempt 3: Shift (Bimodal student mastery divergence)",
    },
    {
      id: "theme-3-digital-health",
      code: "T3",
      title: "Digital Health & Telemedicine",
      category: "EMBS Domain",
      domainColor: "#772583",
      difficulty: "Advanced",
      technique: "Adaptive Fuzzy Triage & Queue Dispatch",
      society: "IEEE EMBS",
      starterFile: "/starter/starter_p3_hospital.py",
      context:
        "Decentralized telemedicine networks connect rural clinics to specialized tertiary medical centers. Network bandwidth fluctuates dynamically while acute patient consultations arrive intermittently.",
      coreChallenge:
        "Design a dynamic dispatch and queue prioritization engine that matches patient urgency with specialist availability under fluctuating network bandwidth and strict escalation deadlines.",
      hardConstraints: [
        "Acute emergency consults must be dispatched within non-negotiable critical windows",
        "Specialist contractual working hours and clinical load limits cannot be exceeded",
        "Tele-consultation session bandwidth requirements must match available channel capacity",
        "Patient data privacy and sovereign encryption protocols must be strictly maintained",
      ],
      optimizationObjectives: [
        "Minimize patient waiting time to certified specialist consultation",
        "Maximize specialist utilization efficiency while preventing physician burnout",
        "Minimize emergency escalation delays for critical cardiovascular and stroke consults",
        "Maximize throughput of scheduled routine consultations across rural clusters",
      ],
      attemptProgression: "Attempt 1: Deterministic queue dispatch → Attempt 2: Shift (50% bandwidth constriction & rural surge) → Attempt 3: Shift (Specialist emergency leave spike)",
    },
    {
      id: "theme-4-neurotech",
      code: "T4",
      title: "Neurotechnology & Rehabilitation",
      category: "Flagship Interdisciplinary",
      domainColor: "#12A8C4",
      difficulty: "Advanced",
      technique: "Swarm Neuro-Decoding & Adaptive Filtering",
      society: "IEEE EMBS × CIS",
      starterFile: "/starter/starter_p4_grid.py",
      context:
        "Brain-Computer Interfaces (BCIs) and neuro-prosthetic limb controllers capture non-stationary multi-channel electroencephalogram (EEG) signals that degrade rapidly due to electrode impedance drift.",
      coreChallenge:
        "Develop an adaptive neuro-decoding algorithm using swarm intelligence to optimize spatial filtering weights and spectral feature boundaries for low-latency intent classification.",
      hardConstraints: [
        "End-to-end motor intention classification latency must strictly remain < 50 milliseconds",
        "Filter coefficients must remain bounded within stable numerical poles",
        "Classification output cannot trigger spurious prosthetic activations during rest states",
        "System must recalibrate autonomously without requiring complete user re-training",
      ],
      optimizationObjectives: [
        "Maximize motor imagery classification accuracy across multi-class limb commands",
        "Minimize classification error rate under electrode signal impedance drift",
        "Minimize computational complexity for embedded prosthetic microcontrollers",
        "Maximize user comfort and adaptation velocity during continuous rehabilitation cycles",
      ],
      attemptProgression: "Attempt 1: Stationary EEG spatial decoding → Attempt 2: Shift (Electrode impedance degradation +20% noise) → Attempt 3: Shift (Fast motor task switching)",
    },
    {
      id: "theme-5-medical-imaging",
      code: "T5",
      title: "Medical Imaging & Computer Vision",
      category: "EMBS Domain",
      domainColor: "#772583",
      difficulty: "Advanced",
      technique: "Evolutionary Segmentation & Hybrid Vision Filters",
      society: "IEEE EMBS",
      starterFile: "/starter/starter_p5_swarm.py",
      context:
        "Clinical diagnosis from MRI, CT, and histological scans is hindered by low contrast, sensor noise, and artifact occlusions. Accurate boundary delineation of pathological lesions is vital.",
      coreChallenge:
        "Engineer an evolutionary contour optimization model that adapts morphological filter parameters and active contour energy functions to extract micro-lesions in heterogeneous scans.",
      hardConstraints: [
        "Extracted lesion contours must maintain topological continuity without self-intersection",
        "Segmentations must preserve critical organ boundaries and avoid over-dilation",
        "Processing time per volumetric slice must meet operational radiological timeframes",
        "Algorithm cannot hallucinate structures not supported by raw sensor intensity data",
      ],
      optimizationObjectives: [
        "Maximize Dice Similarity Coefficient and Jaccard Index against expert clinical annotations",
        "Minimize Hausdorff Distance on complex and irregular lesion boundaries",
        "Minimize false positive artifact segmentations in low-dose CT / low-field MRI",
        "Maximize generalization stability across diverse hospital imaging protocols",
      ],
      attemptProgression: "Attempt 1: High-contrast benchmark slice segmentation → Attempt 2: Shift (Motion blur & low-dose quantum noise) → Attempt 3: Shift (Micro-lesion boundary ambiguity)",
    },
    {
      id: "theme-6-biomedical-signals",
      code: "T6",
      title: "Biomedical Signals & Intelligent Systems",
      category: "Flagship Interdisciplinary",
      domainColor: "#12A8C4",
      difficulty: "Advanced",
      technique: "Fuzzy Signal Classifier + Particle Swarm Optimizer",
      society: "IEEE EMBS × CIS",
      starterFile: "/starter/starter_p6_triage.py",
      context:
        "Continuous physiological monitoring in Intensive Care Units captures streaming ECG, EMG, and photoplethysmography (PPG) waveforms subject to severe motion artifacts and baseline wandering.",
      coreChallenge:
        "Formulate a fuzzy-evolutionary signal processing pipeline that adaptively suppresses artifacts, extracts morphological fiducial points, and flags fatal cardiac arrhythmias in real time.",
      hardConstraints: [
        "Lethal arrhythmias (ventricular fibrillation, tachycardia) must trigger alerts within 3 seconds",
        "False alarm suppression must never suppress legitimate acute cardiac distress events",
        "Digital filters must preserve QRS complex amplitudes and ST-segment elevations",
        "Memory footprint must operate within low-power wearable telemetry hardware constraints",
      ],
      optimizationObjectives: [
        "Maximize sensitivity and specificity across held-out PhysioNet arrhythmia databases",
        "Minimize false alarm fatigue index in continuous bedside telemetry monitoring",
        "Minimize R-peak detection timing jitter under severe baseline wander",
        "Maximize execution efficiency and signal-to-noise ratio improvement",
      ],
      attemptProgression: "Attempt 1: Clean rhythm classification → Attempt 2: Shift (Severe muscular EMG artifact burst) → Attempt 3: Shift (Polymorphic premature ventricular beats)",
    },
    {
      id: "theme-7-smart-healthcare-iot",
      code: "T7",
      title: "Smart Healthcare & Medical IoT",
      category: "CIS Domain",
      domainColor: "#00629B",
      difficulty: "Intermediate–Advanced",
      technique: "Constrained Energy-Routing Heuristics",
      society: "IEEE CIS",
      starterFile: "/starter/starter_p1_scheduling.py",
      context:
        "Wearable biosensor networks and hospital IoT beacons operate on minute battery budgets. Sensor telemetry must traverse wireless mesh gateways to hospital servers without loss.",
      coreChallenge:
        "Design a multi-objective swarm routing heuristic that balances node energy consumption, transmission latency, packet collision probability, and battery lifetime across the mesh.",
      hardConstraints: [
        "Emergency telemetry packets must be guaranteed delivery within strict latency deadlines",
        "Individual sensor node battery depletion cannot prematurely partition the sensor network",
        "Wireless channel duty cycle regulations must be strictly satisfied",
        "Dynamic node joins and departures must be accommodated without network reboot",
      ],
      optimizationObjectives: [
        "Maximize cumulative operational lifespan of all battery-powered sensor nodes",
        "Minimize end-to-end telemetry transmission delay for critical physiological packets",
        "Minimize packet delivery loss and wireless contention re-transmission overhead",
        "Maximize energy expenditure uniformity across all forwarding gateway nodes",
      ],
      attemptProgression: "Attempt 1: Static topology routing → Attempt 2: Shift (Gateway node battery exhaustion) → Attempt 3: Shift (High-frequency telemetry surge from ICU)",
    },
    {
      id: "theme-8-healthcare-robotics",
      code: "T8",
      title: "Healthcare Robotics & Automation",
      category: "Flagship Interdisciplinary",
      domainColor: "#12A8C4",
      difficulty: "Advanced",
      technique: "Multi-Agent Swarm Motion Planning & Obstacle Avoidance",
      society: "IEEE EMBS × CIS",
      starterFile: "/starter/starter_p5_swarm.py",
      context:
        "Autonomous mobile service robots and assistive robotic arms operate in congested hospital corridors, sterile surgical theaters, and pharmaceutical distribution cleanrooms.",
      coreChallenge:
        "Formulate a swarm robotics trajectory planner that optimizes delivery paths, avoids dynamic obstacles (gurneys, clinicians), and guarantees smooth, jerk-free kinematics.",
      hardConstraints: [
        "Robots must maintain strict safety clearance corridors around all human occupants",
        "Kinematic acceleration and jerk limits must be enforced to prevent supply spills",
        "Emergency corridors must be cleared immediately when emergency code alarms trigger",
        "Robotic battery recharge schedules must ensure 24/7 continuous facility coverage",
      ],
      optimizationObjectives: [
        "Minimize total delivery mission time for pharmaceuticals and emergency supplies",
        "Minimize trajectory length and cumulative mechanical energy expenditure",
        "Minimize hallway bottleneck congestion and dead-end agent lockouts",
        "Maximize obstacle clearance smoothness and safety margins in crowded wards",
      ],
      attemptProgression: "Attempt 1: Static corridor pathfinding → Attempt 2: Shift (Corridor closure & gurney traffic jam) → Attempt 3: Shift (Simultaneous emergency multi-ward supply dispatch)",
    },
    {
      id: "theme-9-open-innovation",
      code: "T9",
      title: "Open Innovation on (CIS and EMBS only)",
      category: "Flagship Interdisciplinary",
      domainColor: "#12A8C4",
      difficulty: "Advanced",
      technique: "Hybrid Evolutionary-Fuzzy Frameworks",
      society: "IEEE EMBS × IEEE CIS",
      starterFile: "/starter/starter_p2_drone.py",
      context:
        "The frontier of medical technology demands unconventional computational intelligence methodologies uniting biological modeling with cutting-edge algorithmic optimization.",
      coreChallenge:
        "Architect an original computational intelligence solution solving an unaddressed cross-disciplinary challenge spanning biomedical engineering and computational intelligence theory.",
      hardConstraints: [
        "Proposed algorithmic architecture must combine both EMBS and CIS core tenets",
        "Solutions must be accompanied by rigorous mathematical formulation and code harness",
        "Computational complexity must scale tractably with real-world clinical datasets",
        "All third-party scientific baselines and data sources must be credited and reproducible",
      ],
      optimizationObjectives: [
        "Maximize algorithmic novelty, cross-domain ingenuity, and mathematical elegance",
        "Maximize empirical performance gain over standard industry benchmark baselines",
        "Maximize clinical applicability and translational potential in healthcare settings",
        "Maximize computational execution efficiency and parameter sensitivity robustness",
      ],
      attemptProgression: "Attempt 1: Novel hybrid architecture → Attempt 2: Shift (Adversarial stress testing & edge cases) → Attempt 3: Shift (Multi-objective trade-off sensitivity test)",
    },
  ];

  // Official 4-Phase Schedule
  const officialSchedule = [
    {
      phase: "Phase 1 · 10:00 AM – 12:30 PM",
      title: "1st Development & AI Evaluation",
      tag: "Morning Sprint",
      badgeColor: "bg-ieeeBlue/10 text-ieeeBlue border-ieeeBlue/30",
      accentBorder: "border-ieeeBlue/40",
      bullets: [
        "10:00 AM: Problem Briefing & Official Track Release",
        "10:30 AM – 12:00 PM: 1st Development Block — Core algorithm design, heuristic modeling & optimization pipeline",
        "12:00 PM – 12:30 PM: 1st Round AI Evaluation — Automated benchmark testing, convergence scoring & AST analysis",
      ],
    },
    {
      phase: "Intermission · 12:30 PM – 01:15 PM",
      title: "Lunch Break & Networking",
      tag: "Refresh & Strategize",
      badgeColor: "bg-ofWarning/10 text-ofWarning border-ofWarning/30",
      accentBorder: "border-ofWarning/40",
      bullets: [
        "12:30 PM – 01:15 PM: Dedicated lunch break for all participating teams",
        "Review Phase 1 AI feedback and plan Phase 2 algorithmic refinements",
      ],
    },
    {
      phase: "Phase 2 · 01:15 PM – 03:00 PM",
      title: "2nd Development & Live Patch",
      tag: "Afternoon Crunch",
      badgeColor: "bg-embsPurple/10 text-embsPurple border-embsPurple/30",
      accentBorder: "border-embsPurple/40",
      highlight: true,
      bullets: [
        "01:15 PM – 02:40 PM: 2nd Development Block — Scenario shift adaptation, hyperparameter tuning & stress tests",
        "02:40 PM – 03:00 PM: The Live Patch Round — 20-minute surprise constraint perturbation (Strictly Zero AI allowed)",
      ],
    },
    {
      phase: "Phase 3 · 03:00 PM – 04:00 PM",
      title: "Final Panel Evaluation & Results",
      tag: "Grand Finale",
      badgeColor: "bg-ofCyan/10 text-ofCyan border-ofCyan/30",
      accentBorder: "border-ofCyan/40",
      bullets: [
        "03:00 PM – 03:45 PM: Final Panel Evaluation — In-person jury defense & live code execution before expert faculty",
        "03:45 PM – 04:00 PM: Award Ceremony, E-Certificate Distribution & Valedictory",
      ],
    },
  ];

  const faqs = [
    {
      q: "Who is eligible to participate in OptiForge 2026?",
      a: "OptiForge is open to all engineering, technology, and science students. Teams can have 2 to 4 members across all branches (CSE, IT, ECE, AI&ML, EEE, MECH, etc.). Interdisciplinary collaboration between CIS and EMBS domains is highly encouraged!",
    },
    {
      q: "What is the Hackathon Algorithm Design format?",
      a: "OptiForge tests pure algorithmic optimization and computational intelligence. The tournament features multi-phase development, automated AI benchmark scoring, hidden scenario shifts, an AST code design verifier, a live 20-minute surprise patch round (zero AI allowed), and an in-person faculty jury defense.",
    },
    {
      q: "What is the registration fee and how is it paid?",
      a: "The registration fee is ₹100 per participant (₹200 for 2 members, ₹300 for 3 members, ₹400 for 4 members). Payments are secured via official direct UPI & QR gateway verified under IEEE Vardhaman Student Branch entity.",
    },
    {
      q: "Do we need to build a web frontend or deploy an API?",
      a: "No! OptiForge tests pure algorithmic optimization. You upload your Python script (.py) or notebook (.ipynb). Our sandboxed engine executes it against held-out benchmark datasets and evaluates fitness, efficiency, and design.",
    },
    {
      q: "What perks and certificates do participants receive?",
      a: "All verified participants receive official E-Certificates of Participation & Excellence issued jointly by IEEE EMBS Student Chapter and IEEE CIS Local Chapter, Vardhaman College of Engineering, along with cash prizes, trophies, and tech goodies for podium teams.",
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative pt-10 sm:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow ambient background highlights */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-ieeeBlue/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-embsPurple/8 rounded-full blur-[100px] pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ofSoftBlue border border-ieeeBlue/25 text-ieeeBlue text-xs font-mono mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-ieeeBlue animate-pulse" />
          <span>IEEE Vardhaman Student Branch · IEEE EMBS × IEEE CIS</span>
        </div>

        {/* Title */}
        <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-ofNavy leading-none uppercase">
          OPTI<span className="text-ieeeBlue">FORGE</span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-signature">2026</span>
        </h1>

        <p className="mt-4 font-mono text-sm sm:text-base text-ieeeBlue uppercase tracking-widest font-bold">
          Hackathon Algorithm Design · Computational Intelligence Challenge
        </p>

        <p className="mt-6 max-w-2xl mx-auto text-sm sm:text-base text-ofSlate leading-relaxed font-sans">
          Engineer high-performance evolutionary heuristics, swarm intelligence, and fuzzy inference
          systems. Compete across 9 official innovation themes with multi-phase development, automated AI
          evaluation, live surprise patch rounds, and expert faculty panel defense.
        </p>

        {/* Event Schedule Pill */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-mono text-ofNavy">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-ofBorder shadow-sm">
            <Calendar className="w-4 h-4 text-ieeeBlue" />
            <span className="font-semibold">30-09-2026</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-ofBorder shadow-sm">
            <Clock className="w-4 h-4 text-embsPurple" />
            <span className="font-semibold">10:00 AM – 4:00 PM IST</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-ofBorder shadow-sm">
            <MapPin className="w-4 h-4 text-ofWarning" />
            <span>Vardhaman College of Engineering</span>
          </div>
        </div>

        {/* Live Countdown Timer */}
        <div className="mt-10 max-w-lg mx-auto p-5 sm:p-6 rounded-2xl bg-white border border-ofBorder shadow-card">
          <span className="text-[11px] font-mono uppercase tracking-widest text-ofSlate block mb-3 font-semibold">
            Countdown to Challenge Launch
          </span>
          <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
            <div className="p-2.5 sm:p-3 rounded-xl bg-ofSoftBlue border border-ofBorder">
              <span className="font-display font-bold text-2xl sm:text-3xl text-ofNavy block">
                {String(timeLeft.days).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-mono text-ofSlate uppercase font-semibold">Days</span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-ofSoftBlue border border-ofBorder">
              <span className="font-display font-bold text-2xl sm:text-3xl text-ofNavy block">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-mono text-ofSlate uppercase font-semibold">Hours</span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-ofSoftBlue border border-ofBorder">
              <span className="font-display font-bold text-2xl sm:text-3xl text-ofNavy block">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-mono text-ofSlate uppercase font-semibold">Mins</span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-ofSoftBlue border border-ofBorder">
              <span className="font-display font-bold text-2xl sm:text-3xl text-ieeeBlue block">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-mono text-ofSlate uppercase font-semibold">Secs</span>
            </div>
          </div>
        </div>

        {/* Hero CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="px-8 py-3.5 rounded-xl bg-gradient-signature text-white font-display font-bold text-sm shadow-bright hover:brightness-110 transition-all flex items-center gap-2 group"
          >
            <span>Register Team (₹100 / member)</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#themes"
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-ofSoftBlue border border-ofBorder hover:border-ieeeBlue text-ofNavy font-semibold text-sm transition-all flex items-center gap-2 shadow-sm"
          >
            <FileCode className="w-4 h-4 text-ieeeBlue" />
            <span>Explore 9 Innovation Themes</span>
          </a>
          <Link
            href="/leaderboard"
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-ofSoftBlue border border-ofBorder hover:border-embsPurple text-ofNavy font-semibold text-sm transition-all flex items-center gap-2 shadow-sm"
          >
            <Trophy className="w-4 h-4 text-embsPurple" />
            <span>Live Leaderboard</span>
          </Link>
        </div>
      </section>

      {/* 2. OFFICIAL HACKATHON SCHEDULE (4-PHASE LIFECYCLE) */}
      <section id="schedule" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-ieeeBlue/10 border border-ieeeBlue/30 text-ieeeBlue text-xs font-mono font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Official Event Day Timeline · 30th September 2026</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ofNavy">
            Tournament Schedule & Development Blocks
          </h2>
          <p className="text-sm text-ofSlate max-w-2xl mx-auto">
            A structured hackathon lifecycle progressing from initial heuristic development and AI automated
            scoring through scenario shift adaptations, live surprise patch rounds, and expert panel defense.
          </p>
        </div>

        {/* 4-Phase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {officialSchedule.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 flex flex-col justify-between space-y-4 transition-all bg-white border ${
                item.highlight
                  ? "border-embsPurple/50 shadow-bright ring-1 ring-embsPurple/20"
                  : "border-ofBorder hover:border-ieeeBlue/40 shadow-card"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${item.badgeColor}`}>
                    {item.tag}
                  </span>
                  {item.highlight && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-embsPurple/15 text-embsPurple uppercase">
                      Zero AI Window
                    </span>
                  )}
                </div>

                <div className="font-mono text-xs font-bold text-ieeeBlue">
                  {item.phase}
                </div>

                <h3 className="font-display font-bold text-ofNavy text-base leading-snug">
                  {item.title}
                </h3>

                <ul className="space-y-2 pt-2 border-t border-ofBorder/60 text-xs text-ofSlate">
                  {item.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-ieeeBlue font-bold mt-0.5">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ANTI-SHORTCUT CALLOUT: WHY THIS CANNOT BE PROMPTED INTO A WIN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white via-ofSoftBlue to-ofSoftPurple border border-ofBorder shadow-card relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-lg bg-embsPurple/10 border border-embsPurple/30 text-embsPurple text-xs font-mono font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>OptiForge Integrity Architecture</span>
            </div>

            <h2 className="font-display font-bold text-2xl sm:text-3xl text-ofNavy">
              Why OptiForge Cannot Simply Be &quot;Prompted&quot; Into a Win
            </h2>

            <p className="text-sm text-ofSlate leading-relaxed">
              Standard hackathons collapse when participants copy problem statements into generic LLMs.
              OptiForge 2026 is engineered with multiple defensive architectural layers to evaluate genuine
              computational intelligence intuition, mathematical reasoning, and live engineering agility:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-ofBorder shadow-sm space-y-1.5">
                <div className="text-xs font-display font-bold text-ieeeBlue flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-ieeeBlue" />
                  <span>Hidden Scenario Shifts</span>
                </div>
                <p className="text-xs text-ofSlate leading-relaxed">
                  Static prompt solutions fail on subsequent attempts when dynamic perturbations (resource drops,
                  impedance drift, queue spikes) are injected into held-out test data.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-ofBorder shadow-sm space-y-1.5">
                <div className="text-xs font-display font-bold text-ieeeBlue flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-ieeeBlue" />
                  <span>Mandatory Reflection Notes</span>
                </div>
                <p className="text-xs text-ofSlate leading-relaxed">
                  Every submission after Attempt 1 requires a &quot;what changed and why&quot; note detailing parameter
                  adaptation and mathematical defense.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-ofBorder shadow-sm space-y-1.5">
                <div className="text-xs font-display font-bold text-ofWarning flex items-center gap-2">
                  <Flame className="w-4 h-4 text-ofWarning" />
                  <span>Live Patch Round (Strictly Zero AI)</span>
                </div>
                <p className="text-xs text-ofSlate leading-relaxed">
                  A 20-minute live surprise constraint with strictly ZERO AI allowed. Evaluates real-time code
                  modification, mental model clarity, and edge-case handling.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-ofBorder shadow-sm space-y-1.5">
                <div className="text-xs font-display font-bold text-embsPurple flex items-center gap-2">
                  <Award className="w-4 h-4 text-embsPurple" />
                  <span>Final Panel Jury Defense</span>
                </div>
                <p className="text-xs text-ofSlate leading-relaxed">
                  Faculty judges question teams on fitness functions, defuzzification math, chromosome representations,
                  and convergence graphs in person.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PREREQUISITES: WHAT YOU GET vs. WHAT YOU BRING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-ieeeBlue/10 border border-ieeeBlue/30 text-ieeeBlue text-xs font-mono font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Level Playing Field</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ofNavy">
            Prerequisites: What You Get vs. What You Bring
          </h2>
          <p className="text-sm text-ofSlate max-w-2xl mx-auto">
            You don&apos;t need web development or cloud infrastructure skills. We provide the execution environment;
            you bring algorithmic intuition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Panel Left: What You Get */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-ieeeBlue/30 shadow-card space-y-6">
            <div className="flex items-center gap-3 border-b border-ofBorder pb-4">
              <div className="w-10 h-10 rounded-xl bg-ieeeBlue/10 border border-ieeeBlue/30 flex items-center justify-center text-ieeeBlue">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-ofNavy">What You Get from OptiForge</h3>
                <p className="text-xs text-ofSlate">Pre-packaged starter kits & verification harness</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-ofSlate font-sans">
              {[
                "Modular Python starter scripts (.py) and notebooks (.ipynb) for all 9 innovation themes",
                "Pre-built synthetic data generators and scenario loaders",
                "Offline verification harness with identical scoring metrics",
                "Isolated sandbox execution environment with standard scientific libraries",
                "Instant multi-metric feedback (solution quality, runtime, AST design, consistency)",
                "Working baseline heuristic solution for rapid experimentation",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-ieeeBlue shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Panel Right: What You Bring */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-embsPurple/30 shadow-card space-y-6">
            <div className="flex items-center gap-3 border-b border-ofBorder pb-4">
              <div className="w-10 h-10 rounded-xl bg-embsPurple/10 border border-embsPurple/30 flex items-center justify-center text-embsPurple">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-ofNavy">What You Must Bring</h3>
                <p className="text-xs text-ofSlate">Algorithmic reasoning & problem-solving ability</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-ofSlate font-sans">
              {[
                "Algorithmic formulation: choosing representation (chromosomes, particles, pheromone paths)",
                "Fitness function engineering: formulating multi-objective trade-offs and penalties",
                "Hyperparameter tuning: population size, crossover rates, inertia damping, evaporation",
                "Dynamic resilience: adapting code when hidden scenario shifts alter constraints",
                "Interpretability & defense: ability to explain choices and convergence curves during viva",
                "Teamwork & agility: rapid live patch implementation under tight 20-minute countdown",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-embsPurple shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE ARENA: HEALTHCARE ROBOTICS & SWARM COVERAGE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-ieeeBlue/10 border border-ieeeBlue/30 text-ieeeBlue text-xs font-mono font-semibold">
            <Radio className="w-3.5 h-3.5" />
            <span>Interactive Arena · Swarm Robotics & Autonomous Logistics</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ofNavy">
            Healthcare Robotics & Autonomous Navigation Arena
          </h2>
          <p className="text-sm text-ofSlate max-w-xl mx-auto">
            Live interactive simulation preview: multi-agent swarm coordination, dynamic hospital corridor
            obstacle avoidance, and emergency rendezvous algorithms.
          </p>
        </div>

        {/* Interactive Coverage Map Component */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white border border-ofBorder shadow-card">
          <CoverageMapVisualization />
        </div>
      </section>

      {/* 6. ALL 9 OFFICIAL INNOVATION THEMES */}
      <section id="themes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-embsPurple/10 border border-embsPurple/30 text-embsPurple text-xs font-mono font-bold">
            <Binary className="w-3.5 h-3.5" />
            <span>Official Hackathon Challenge Portfolio</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ofNavy">
            9 Official Innovation Themes
          </h2>
          <p className="text-sm text-ofSlate max-w-2xl mx-auto">
            Select 1 theme for your team. All 9 challenges are engineered under IEEE EMBS × IEEE CIS guidance
            with standardized multi-phase evaluation, benchmark harnesses, and starter scripts.
          </p>
        </div>

        {/* 9 Themes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {innovationThemes.map((prob) => (
            <div
              key={prob.id}
              className="rounded-2xl bg-white p-6 flex flex-col justify-between space-y-5 transition-all border border-ofBorder hover:border-ieeeBlue/50 shadow-card hover:shadow-bright"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-ieeeBlue/10 border border-ieeeBlue/20 text-ieeeBlue">
                    {prob.code}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ofSoftBlue text-ofSlate font-medium">
                    {prob.category}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base sm:text-lg text-ofNavy leading-snug">
                  {prob.title}
                </h3>

                <div className="text-[11px] font-mono text-embsPurple bg-embsPurple/10 border border-embsPurple/20 px-2.5 py-1 rounded font-medium">
                  {prob.technique}
                </div>

                <p className="text-xs text-ofSlate leading-relaxed line-clamp-3">
                  {prob.coreChallenge}
                </p>

                {/* Hard Constraints Summary */}
                <div className="space-y-1.5 pt-3 border-t border-ofBorder/60">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-ofSlate font-semibold block">
                    Key Constraints
                  </span>
                  <ul className="text-[11px] text-ofSlate space-y-1">
                    {prob.hardConstraints.slice(0, 2).map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5 truncate">
                        <span className="text-ieeeBlue font-bold">•</span>
                        <span className="truncate">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-ofBorder flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedProblem(prob)}
                  className="px-3 py-2 rounded-xl bg-ofSoftBlue hover:bg-ofBorder/50 border border-ofBorder text-xs text-ofNavy flex items-center gap-1.5 transition-colors font-medium"
                >
                  <Eye className="w-3.5 h-3.5 text-ieeeBlue" />
                  <span>Full Spec</span>
                </button>
                <a
                  href={prob.starterFile}
                  download
                  className="px-3 py-2 rounded-xl bg-ieeeBlue/10 hover:bg-ieeeBlue/20 border border-ieeeBlue/30 text-xs text-ieeeBlue flex items-center gap-1.5 transition-colors font-mono font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Starter .py</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SCORING MATRIX: BROAD CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-ieeeBlue/10 border border-ieeeBlue/30 text-ieeeBlue text-xs font-mono font-semibold">
            <Trophy className="w-3.5 h-3.5" />
            <span>Evaluation Framework</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ofNavy">
            Hybrid Scoring Architecture
          </h2>
          <p className="text-sm text-ofSlate max-w-xl mx-auto">
            Your final standing blends instant automated sandboxed benchmarks with rigorous human jury defense.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Automated Evaluation Categories */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-ofBorder shadow-card space-y-4">
            <div className="flex items-center gap-2 font-display font-bold text-lg text-ofNavy">
              <Terminal className="w-5 h-5 text-ieeeBlue" />
              <span>Part I: Automated Sandbox Benchmarking</span>
            </div>
            <p className="text-xs text-ofSlate leading-relaxed">
              Executed instantly in an isolated runtime sandbox against held-out scenario test suites:
            </p>
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-ofSoftBlue border border-ofBorder">
                <div className="text-xs font-bold text-ofNavy">Solution Quality & Optimality</div>
                <div className="text-[11px] text-ofSlate mt-0.5">Objective value score relative to optimal/greedy baseline benchmarks.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-ofSoftBlue border border-ofBorder">
                <div className="text-xs font-bold text-ofNavy">Execution Efficiency & Scalability</div>
                <div className="text-[11px] text-ofSlate mt-0.5">Wall-clock execution time and convergence speed per iteration.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-ofSoftBlue border border-ofBorder">
                <div className="text-xs font-bold text-ofNavy">Algorithm Design Quality (AST)</div>
                <div className="text-[11px] text-ofSlate mt-0.5">Static AST inspection verifying heuristic operators, loop structures, and diversity.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-ofSoftBlue border border-ofBorder">
                <div className="text-xs font-bold text-ofNavy">Multi-Attempt Consistency</div>
                <div className="text-[11px] text-ofSlate mt-0.5">Performance stability across Attempts 1, 2, and 3 under injected scenario shifts.</div>
              </div>
            </div>
          </div>

          {/* Judge Evaluation Categories */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-ofBorder shadow-card space-y-4">
            <div className="flex items-center gap-2 font-display font-bold text-lg text-ofNavy">
              <Shield className="w-5 h-5 text-embsPurple" />
              <span>Part II: Domain Faculty Jury Review</span>
            </div>
            <p className="text-xs text-ofSlate leading-relaxed">
              Assessed by university domain experts during Phase 3 Final Panel Evaluation:
            </p>
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-ofSoftBlue border border-ofBorder">
                <div className="text-xs font-bold text-ofNavy">Code Elegance & Modularity</div>
                <div className="text-[11px] text-ofSlate mt-0.5">Readable, structured, well-commented code following clean scientific standards.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-ofSoftBlue border border-ofBorder">
                <div className="text-xs font-bold text-ofNavy">Algorithmic Reasoning & Defense</div>
                <div className="text-[11px] text-ofSlate mt-0.5">Depth of justification for chosen representations, crossover/inertia rules, and live patch.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-ofSoftBlue border border-ofBorder">
                <div className="text-xs font-bold text-ofNavy">Convergence & Result Interpretation</div>
                <div className="text-[11px] text-ofSlate mt-0.5">Ability to explain fitness evolution, sensitivity trade-offs, and failure modes.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-ofSoftBlue border border-ofBorder">
                <div className="text-xs font-bold text-ofNavy">Adaptation to Scenario Shifts</div>
                <div className="text-[11px] text-ofSlate mt-0.5">Quality of written reflections and dynamic handling of hidden perturbations.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. RECOGNITION & PERKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-ofBorder text-center space-y-6 shadow-card relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-lg bg-ieeeBlue/10 border border-ieeeBlue/30 text-ieeeBlue text-xs font-mono font-semibold">
            <Award className="w-4 h-4" />
            <span>Perks & Recognition</span>
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ofNavy">
            Prizes, Goodies & Participation Honors
          </h2>

          <p className="text-ofSlate text-sm max-w-xl mx-auto leading-relaxed">
            Every participating team earns authenticated credentials and competitive prestige under IEEE VCE.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 max-w-3xl mx-auto text-left">
            <div className="p-5 rounded-2xl bg-ofSoftBlue border border-ofBorder space-y-2">
              <Trophy className="w-6 h-6 text-ofWarning" />
              <h4 className="font-display font-bold text-ofNavy text-sm">Prize Pool & Goodies</h4>
              <p className="text-xs text-ofSlate leading-relaxed">
                Podium finishes and category awards receive official prize packages, trophies, and tech goodies.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-ofSoftBlue border border-ofBorder space-y-2">
              <Award className="w-6 h-6 text-ieeeBlue" />
              <h4 className="font-display font-bold text-ofNavy text-sm">Official E-Certificates</h4>
              <p className="text-xs text-ofSlate leading-relaxed">
                All verified participants receive authenticated E-Certificates of Participation & Excellence.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-ofSoftBlue border border-ofBorder space-y-2">
              <Users className="w-6 h-6 text-embsPurple" />
              <h4 className="font-display font-bold text-ofNavy text-sm">IEEE Student Perks</h4>
              <p className="text-xs text-ofSlate leading-relaxed">
                Mentorship from IEEE faculty, networking with peers, and society membership opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-ieeeBlue/10 border border-ieeeBlue/30 text-ieeeBlue text-xs font-mono font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="font-display font-bold text-3xl text-ofNavy">Need Clarification?</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-white border border-ofBorder overflow-hidden shadow-sm transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-display font-bold text-sm text-ofNavy hover:text-ieeeBlue transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-ofSlate shrink-0 transition-transform duration-300 ${
                    openFaq === idx ? "rotate-180 text-ieeeBlue" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-ofSlate leading-relaxed border-t border-ofBorder">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. MODAL: FULL 7-SECTION PROBLEM STATEMENT VIEWER */}
      {selectedProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl rounded-3xl bg-white border border-ofBorder shadow-2xl p-6 sm:p-8 space-y-6 max-h-[88vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedProblem(null)}
              className="absolute top-5 right-5 p-2 text-ofSlate hover:text-ofNavy transition-colors font-bold text-lg"
            >
              ✕
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-0.5 rounded bg-ieeeBlue/10 border border-ieeeBlue/30 text-ieeeBlue font-bold">
                  {selectedProblem.code}
                </span>
                <span className="text-ofSlate font-medium">{selectedProblem.society}</span>
                <span className="text-embsPurple font-semibold">· {selectedProblem.difficulty}</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-ofNavy">
                {selectedProblem.title}
              </h2>
              <div className="text-xs font-mono text-ieeeBlue font-semibold">{selectedProblem.technique}</div>
            </div>

            {/* Section 1: Real-world Context */}
            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-ieeeBlue font-bold">
                1. Real-World Context
              </h4>
              <p className="text-xs text-ofSlate leading-relaxed">{selectedProblem.context}</p>
            </div>

            {/* Section 2: Core Challenge */}
            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-ieeeBlue font-bold">
                2. Core Optimization Challenge
              </h4>
              <p className="text-xs text-ofSlate leading-relaxed">{selectedProblem.coreChallenge}</p>
            </div>

            {/* Section 3: Hard Constraints */}
            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-ieeeBlue font-bold">
                3. Hard Constraints (Must Satisfy)
              </h4>
              <ul className="space-y-1.5 text-xs text-ofSlate">
                {selectedProblem.hardConstraints.map((c: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-ofMedRed font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 4: Optimization Objectives */}
            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-ieeeBlue font-bold">
                4. Optimization Objectives
              </h4>
              <ul className="space-y-1.5 text-xs text-ofSlate">
                {selectedProblem.optimizationObjectives.map((obj: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-ieeeBlue font-bold">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 5: Evaluation Methodology */}
            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-ieeeBlue font-bold">
                5. Evaluation Methodology & Metrics
              </h4>
              <p className="text-xs text-ofSlate leading-relaxed">
                Evaluated against synthetic multi-scenario benchmarks measuring solution quality, computational
                runtime efficiency, AST design quality, and stability under dynamic perturbations.
              </p>
            </div>

            {/* Section 6: Attempt Progression */}
            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-ieeeBlue font-bold">
                6. Attempt Progression Overview
              </h4>
              <p className="text-xs text-ofSlate leading-relaxed">{selectedProblem.attemptProgression}</p>
            </div>

            {/* Section 7: Expected Team Output Checklist */}
            <div className="space-y-2 p-4 rounded-xl bg-ofSoftBlue border border-ofBorder">
              <h4 className="font-mono text-xs uppercase tracking-wider text-ofNavy font-bold">
                7. Expected Team Output Checklist (Standardized)
              </h4>
              <ul className="space-y-1.5 text-xs text-ofSlate pt-1">
                {[
                  "Algorithm implementation (submitted Python script or notebook)",
                  "Parameter configuration used, clearly stated in code comments or notes",
                  "Final objective/fitness score recorded for each attempt",
                  "Convergence or iteration evidence (logs or printouts demonstrating improvement)",
                  "Written explanation: representation, operators/rules, and CI technique rationale",
                  "A mandatory one-line 'what changed and why' note with every attempt after the first",
                ].map((chk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-ieeeBlue shrink-0 mt-0.5" />
                    <span>{chk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-ofBorder flex items-center justify-between">
              <button
                onClick={() => setSelectedProblem(null)}
                className="px-4 py-2 rounded-xl text-xs text-ofSlate hover:text-ofNavy transition-colors font-medium"
              >
                Close Spec
              </button>
              <a
                href={selectedProblem.starterFile}
                download
                className="px-5 py-2.5 rounded-xl bg-gradient-signature text-white font-semibold text-xs shadow-bright hover:brightness-110 transition-all flex items-center gap-2"
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
