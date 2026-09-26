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
  Layers,
  Sparkles,
  Download,
  Eye,
  CheckSquare,
  Radio,
  Brain,
  Scan,
  ActivitySquare,
  Bot,
  ExternalLink,
  ShieldAlert,
  FileCode,
  Users,
} from "lucide-react";
import CoverageMapVisualization from "@/components/CoverageMapVisualization";

// Exact color tokens from https://ieee-embs-vce.vercel.app/optiforge
const $ = {
  bg: "#F8FAFC",
  white: "#FFFFFF",
  softBlue: "#F0F7FB",
  softPurple: "#F6F1F8",
  ieeeBlue: "#00629B",
  embsPurple: "#772583",
  cyan: "#12A8C4",
  navy: "#102A43",
  slate: "#52606D",
  border: "#D9E6EE",
  success: "#238B68",
  warning: "#D58A19",
  medRed: "#D84A5A",
  aiPurple: "#7657D9",
};

export default function LandingPage() {
  // Countdown to 30th September 2026 09:00 AM IST (Exact start time from live website)
  const targetTime = new Date("2026-09-30T09:00:00+05:30").getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });

  // Mouse parallax state from live website
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, nX: 0, nY: 0, hasMouse: false });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY,
        nX: (e.clientX / window.innerWidth - 0.5) * 2,
        nY: (e.clientY / window.innerHeight - 0.5) * 2,
        hasMouse: true,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, mins, secs });
      } else {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  // Selected Problem Modal state
  const [selectedProblem, setSelectedProblem] = useState<any | null>(null);

  // Official 4-Phase Schedule (J7 from live site)
  const officialSchedule = [
    {
      num: "01",
      time: "09:00–12:30",
      title: "1st Round",
      desc: "AI evaluation",
      tag: "Round 1",
      highlight: true,
    },
    {
      num: "02",
      time: "12:30–13:15",
      title: "Lunch Break",
      desc: "Networking and lunch break. Teams regroup, analyze leaderboard metrics, and adjust strategy for afternoon rounds.",
      tag: "Break",
      highlight: false,
    },
    {
      num: "03",
      time: "13:15–15:00",
      title: "2nd Round",
      desc: "AI evaluation",
      tag: "Round 2",
      highlight: true,
    },
    {
      num: "04",
      time: "15:00–16:00",
      title: "Final Panel Evaluation & Results",
      desc: "Live defense and presentation before the domain expert faculty jury, followed by felicitation and awards ceremony.",
      tag: "Panel Jury",
      highlight: false,
    },
  ];

  // 6 Official Innovation Themes (Z7 from live site)
  const innovationThemes = [
    {
      id: "theme-1-biomedical-ai",
      num: "01",
      code: "01",
      title: "Biomedical Artificial Intelligence",
      tag: "EMBS Domain",
      desc: "Develop AI and machine-learning solutions for healthcare, including disease prediction, clinical decision support, and personalized medicine.",
      accent: $.aiPurple,
      bg: "#F4F1FF",
      icon: <Brain className="w-6 h-6" />,
      difficulty: "Advanced",
      technique: "Evolutionary Neural Architecture Search & Hybrid GA-ML",
      society: "IEEE EMBS × IEEE CIS",
      starterFile: "/starter/starter_p1_scheduling.py",
      context:
        "Modern clinical workflows generate continuous multidimensional telemetry, patient records, and biomarker streams. Predictive models must accurately evaluate patient outcomes, survival risk, and treatment responsiveness under clinical uncertainty.",
      coreChallenge:
        "Engineer an interpretable diagnostic optimization pipeline combining evolutionary feature selection with fuzzy risk stratification to minimize misdiagnosis and maximize early triage accuracy.",
      hardConstraints: [
        "Patient outcome predictions must meet clinical safety and interpretability standards (>98% life-critical recall)",
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
      attemptProgression:
        "Round 1: Baseline predictive classifier → Round 2: Perturbation shift (missing markers) → Final: Jury panel defense",
    },
    {
      id: "theme-2-signals",
      num: "02",
      code: "02",
      title: "Biomedical Signals & Intelligent Systems",
      tag: "EMBS Domain",
      desc: "Apply intelligent algorithms to ECG, EEG, EMG, and PPG for signal processing, anomaly detection, and physiological monitoring.",
      accent: $.medRed,
      bg: "#FFF2F4",
      icon: <ActivitySquare className="w-6 h-6" />,
      difficulty: "Advanced",
      technique: "Fuzzy Signal Classifier + Particle Swarm Optimizer",
      society: "IEEE EMBS",
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
      attemptProgression:
        "Round 1: Clean rhythm classification → Round 2: Perturbation shift (severe EMG burst) → Final: Jury panel defense",
    },
    {
      id: "theme-3-imaging",
      num: "03",
      code: "03",
      title: "Medical Imaging & Computer Vision",
      tag: "EMBS Domain",
      desc: "Develop intelligent systems for MRI, CT, ultrasound, and histopathological image analysis, segmentation, and automated interpretation.",
      accent: $.cyan,
      bg: "#EFFBFD",
      icon: <Scan className="w-6 h-6" />,
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
      attemptProgression:
        "Round 1: High-contrast benchmark slice segmentation → Round 2: Perturbation shift (motion blur & quantum noise) → Final: Jury panel defense",
    },
    {
      id: "theme-4-ml-ai",
      num: "04",
      code: "04",
      title: "Machine Learning & Artificial Intelligence",
      tag: "CIS Domain",
      desc: "Explore machine learning, deep learning, generative AI, and intelligent algorithms for solving complex real-world problems.",
      accent: $.ieeeBlue,
      bg: $.softBlue,
      icon: <Cpu className="w-6 h-6" />,
      difficulty: "Intermediate–Advanced",
      technique: "Multi-Objective Heuristics + Deep Evolutionary Networks",
      society: "IEEE CIS",
      starterFile: "/starter/starter_p2_drone.py",
      context:
        "Intelligent systems operating in dynamic real-world environments require adaptive learning models capable of solving complex multi-modal classification, continuous regression, and generative modeling tasks.",
      coreChallenge:
        "Design a high-performance machine learning optimization model combining automated hyperparameter search with robust loss regularization to generalize across non-stationary distributions.",
      hardConstraints: [
        "Generalization bounds must hold across out-of-distribution validation sets",
        "Optimization trajectory must converge deterministically without gradient explosion",
        "Model parameter efficiency must adhere to runtime deployment budgets",
        "Decision outputs must satisfy fair calibration across heterogeneous sub-populations",
      ],
      optimizationObjectives: [
        "Maximize multi-metric validation accuracy and generalized predictive capability",
        "Minimize loss variance and over-fitting penalty across unseen held-out splits",
        "Minimize inference latency and computational overhead",
        "Maximize explainability and architectural stability",
      ],
      attemptProgression:
        "Round 1: Benchmark distribution optimization → Round 2: Perturbation shift (non-stationary dataset drift) → Final: Jury panel defense",
    },
    {
      id: "theme-5-autonomous",
      num: "05",
      code: "05",
      title: "Intelligent Systems & Autonomous Computing",
      tag: "CIS Domain",
      desc: "Develop autonomous, adaptive, and multi-agent systems capable of intelligent decision-making, learning, and real-time operation.",
      accent: $.ieeeBlue,
      bg: $.softBlue,
      icon: <Bot className="w-6 h-6" />,
      difficulty: "Advanced",
      technique: "Swarm Intelligence + Adaptive Multi-Agent Heuristics",
      society: "IEEE CIS",
      starterFile: "/starter/starter_p4_grid.py",
      context:
        "Decentralized autonomous agents operating in shared environments must coordinate navigation, resource allocation, and distributed task execution under communication constraints and unpredictable hazards.",
      coreChallenge:
        "Engineer a multi-agent autonomous decision-making engine that coordinates agent trajectories, resolves resource contention, and dynamically plans pathing under real-time environmental perturbations.",
      hardConstraints: [
        "Agents must guarantee collision-free trajectories and safe operational margins",
        "Decision latency per simulation tick must stay strictly within real-time budget",
        "Coordination protocol must operate without centralized single-point-of-failure bottlenecks",
        "Dynamic environment changes must trigger sub-second trajectory recalibration",
      ],
      optimizationObjectives: [
        "Maximize collective swarm task throughput and coverage velocity",
        "Minimize cumulative collision risk and coordination deadlocks",
        "Minimize energy consumption and path trajectory length",
        "Maximize resilience against individual agent failures or communication dropouts",
      ],
      attemptProgression:
        "Round 1: Known topology path planning → Round 2: Perturbation shift (dynamic obstacles & network drop) → Final: Jury panel defense",
    },
    {
      id: "theme-6-open-innovation",
      num: "06",
      code: "06",
      title: "Open Innovation: CIS × EMBS",
      tag: "Flagship Domain",
      desc: "An interdisciplinary track for novel solutions combining computational intelligence with biomedical engineering and healthcare challenges. Encourages innovative applications of AI, optimization, intelligent systems, vision, signals, and robotics to real-world biomedical problems.",
      accent: $.cyan,
      bg: "#EFFBFD",
      icon: <Sparkles className="w-6 h-6" />,
      flagship: true,
      difficulty: "Advanced",
      technique: "Hybrid Evolutionary-Fuzzy Frameworks",
      society: "IEEE CIS & IEEE EMBS Only",
      starterFile: "/starter/starter_p3_hospital.py",
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
      attemptProgression:
        "Round 1: Novel hybrid architecture → Round 2: Perturbation shift (adversarial stress testing) → Final: Jury panel defense",
    },
  ];

  const faqs = [
    {
      q: "Who can participate?",
      a: "Any registered student from any institution in India. A team of 2–4 members is required. No prior competition experience needed.",
    },
    {
      q: "What is the registration fee?",
      a: "₹100 per team member, payable at the venue on the day of the event.",
    },
    {
      q: "How is scoring done?",
      a: "Multi-metric scoring: automated solution quality (fitness score), runtime efficiency, AST structure analysis, and AI evaluation feedback.",
    },
    {
      q: "Do we need to build a web frontend or deploy an API?",
      a: "No! OptiForge tests pure algorithmic optimization. You submit your Python script (.py) or notebook (.ipynb). Our sandboxed engine executes it against held-out benchmark datasets.",
    },
    {
      q: "What perks and certificates do participants receive?",
      a: "All verified participants receive authenticated E-Certificates of Participation & Excellence issued jointly by IEEE EMBS Student Chapter and IEEE CIS Chapter, Vardhaman College of Engineering, along with cash prizes, trophies, and tech goodies for podium teams.",
    },
  ];

  return (
    <div
      style={{
        backgroundColor: $.bg,
        minHeight: "100vh",
        color: $.navy,
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
      className="relative"
    >
      {/* 0. DYNAMIC MOUSE-FOLLOW SPOTLIGHT FROM LIVE SITE */}
      {mousePos.hasMouse && (
        <div
          className="fixed inset-0 pointer-events-none z-50 mix-blend-soft-light transition-opacity duration-300"
          style={{
            background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.8), transparent 40%)`,
          }}
        />
      )}

      {/* AMBIENT PARALLAX BACKGROUND LAYERS */}
      <div
        className="fixed inset-0 pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePos.nX * -15}px, ${mousePos.nY * -15}px)`,
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background: `linear-gradient(135deg, ${$.bg} 0%, #EEF8FC 50%, #F7F0F9 100%)`,
          }}
        />
        <div
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply opacity-20 blur-[100px]"
          style={{ background: $.softBlue }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full mix-blend-multiply opacity-25 blur-[120px]"
          style={{ background: $.softPurple }}
        />
      </div>

      <div className="relative z-10 space-y-24 sm:space-y-32 pb-24">
        {/* 1. HERO SECTION (MATCHING LIVE SITE e9 COMPONENT) */}
        <section className="relative pt-24 sm:pt-32 pb-16 px-4 sm:px-8 max-w-[1280px] mx-auto text-center">
          <div
            className="space-y-7 transition-transform duration-700 ease-out"
            style={{
              transform: `translate(${mousePos.nX * 8}px, ${mousePos.nY * 8}px)`,
            }}
          >
            {/* Header Badge */}
            <div
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-bold shadow-sm glass-card cursor-default"
              style={{ color: $.ieeeBlue }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ background: $.embsPurple }}
              />
              <span>IEEE EMBS × IEEE CIS · Vardhaman College of Engineering</span>
            </div>

            {/* Big Sora Display Title */}
            <h1
              className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-none uppercase"
              style={{ fontFamily: "Sora, sans-serif", color: $.ieeeBlue }}
            >
              OPTIFORGE
              <br />
              <span
                className="text-5xl sm:text-6xl lg:text-7xl mt-2 block"
                style={{ color: $.embsPurple }}
              >
                2026
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-sm sm:text-base uppercase tracking-widest font-semibold"
              style={{ color: $.slate, fontFamily: "Inter, sans-serif" }}
            >
              Computational Intelligence Challenge
            </p>

            {/* Description */}
            <p
              className="max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
              style={{ color: $.slate }}
            >
              Engineer high-performance evolutionary heuristics, machine learning models, and intelligent
              systems. Compete across 6 innovation themes with live development rounds, AI evaluation,
              scenario shifts, and expert panel defense.
            </p>

            {/* Meta Pills */}
            <div
              className="flex flex-wrap items-center justify-center gap-3 text-xs"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md glass-card-subtle cursor-default"
                style={{ color: $.navy }}
              >
                <Calendar className="w-3.5 h-3.5" style={{ color: $.ieeeBlue }} />
                <span>30 September 2026</span>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md glass-card-subtle cursor-default"
                style={{ color: $.navy }}
              >
                <Clock className="w-3.5 h-3.5" style={{ color: $.embsPurple }} />
                <span>9:00 AM – 4:00 PM IST</span>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md glass-card-subtle cursor-default"
                style={{ color: $.navy }}
              >
                <MapPin className="w-3.5 h-3.5" style={{ color: $.medRed }} />
                <span>Vardhaman College of Engineering</span>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md glass-card-subtle cursor-default"
                style={{ color: $.navy }}
              >
                <Zap className="w-3.5 h-3.5" style={{ color: $.cyan }} />
                <span>₹100/member (At venue)</span>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md glass-card-subtle cursor-default"
                style={{ color: $.navy }}
              >
                <Users className="w-3.5 h-3.5" style={{ color: $.embsPurple }} />
                <span>2–4 Members</span>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md glass-card-subtle cursor-default"
                style={{ color: $.navy }}
              >
                <Trophy className="w-3.5 h-3.5" style={{ color: $.warning }} />
                <span>04 Dynamic Rounds</span>
              </div>
            </div>

            {/* Live Countdown Box (Nc from live site) */}
            <div className="max-w-md mx-auto space-y-4 pt-4">
              <p
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: $.slate, fontFamily: "Inter, sans-serif" }}
              >
                Countdown to Challenge Launch
              </p>
              <div className="flex items-center justify-center gap-3">
                <div
                  className="flex flex-col items-center rounded-2xl px-5 py-4 min-w-[76px] transition-transform hover:scale-105 hover:-translate-y-1 hover:shadow-lg glass-card"
                  style={{ borderBottom: `3px solid ${$.ieeeBlue}` }}
                >
                  <span
                    className="text-3xl font-black tabular-nums font-mono"
                    style={{ color: $.navy }}
                  >
                    {String(timeLeft.days).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: $.slate }}>
                    Days
                  </span>
                </div>

                <div
                  className="flex flex-col items-center rounded-2xl px-5 py-4 min-w-[76px] transition-transform hover:scale-105 hover:-translate-y-1 hover:shadow-lg glass-card"
                  style={{ borderBottom: `3px solid ${$.embsPurple}` }}
                >
                  <span
                    className="text-3xl font-black tabular-nums font-mono"
                    style={{ color: $.navy }}
                  >
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: $.slate }}>
                    Hours
                  </span>
                </div>

                <div
                  className="flex flex-col items-center rounded-2xl px-5 py-4 min-w-[76px] transition-transform hover:scale-105 hover:-translate-y-1 hover:shadow-lg glass-card"
                  style={{ borderBottom: `3px solid ${$.cyan}` }}
                >
                  <span
                    className="text-3xl font-black tabular-nums font-mono"
                    style={{ color: $.navy }}
                  >
                    {String(timeLeft.mins).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: $.slate }}>
                    Mins
                  </span>
                </div>

                <div
                  className="flex flex-col items-center rounded-2xl px-5 py-4 min-w-[76px] transition-transform hover:scale-105 hover:-translate-y-1 hover:shadow-lg glass-card"
                  style={{ borderBottom: `3px solid ${$.success}` }}
                >
                  <span
                    className="text-3xl font-black tabular-nums font-mono"
                    style={{ color: $.navy }}
                  >
                    {String(timeLeft.secs).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: $.slate }}>
                    Secs
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
              <Link
                href="/register"
                className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm text-white overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-lg"
                style={{ background: $.ieeeBlue }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  Register Now (₹100/member)
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-semibold transition-all hover:scale-105 hover:-translate-y-1 shadow-sm hover:shadow-md glass-card-subtle"
                style={{ color: $.ieeeBlue }}
              >
                <Trophy className="w-4 h-4" />
                <span>Live Leaderboard</span>
              </Link>

              <a
                href="#themes"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-semibold transition-all hover:scale-105 hover:-translate-y-1 shadow-sm hover:shadow-md glass-card-subtle"
                style={{ color: $.embsPurple }}
              >
                <FileCode className="w-4 h-4" />
                <span>6 Innovation Themes</span>
              </a>
            </div>
          </div>
        </section>

        {/* 2. PROBLEM DOMAINS: 6 INNOVATION THEMES (MATCHING Z7 CARDS) */}
        <section id="themes" className="py-12 max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider glass-card-subtle"
              style={{ color: $.cyan }}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>6 Innovation Themes</span>
            </div>
            <h2
              className="text-3xl sm:text-5xl font-black"
              style={{ fontFamily: "Sora, sans-serif", color: $.navy }}
            >
              Problem Domains
            </h2>
            <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: $.slate }}>
              Explore our 6 problem domains engineered for computational intelligence, algorithm design,
              and interdisciplinary healthcare innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {innovationThemes.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-3xl p-8 space-y-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden glass-card flex flex-col justify-between"
                style={{ background: $.white }}
              >
                {/* Hover gradient tint */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `linear-gradient(135deg, ${item.bg}, transparent)` }}
                />

                {/* Accent bottom bar */}
                <div
                  className="absolute inset-x-0 bottom-0 h-1 transition-colors duration-300"
                  style={{ background: item.accent }}
                />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                      style={{ background: item.bg, color: item.accent }}
                    >
                      {item.icon}
                    </div>
                    <span
                      className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider transition-colors duration-300 group-hover:bg-white"
                      style={{
                        color: item.accent,
                        background: `${item.accent}15`,
                        border: `1px solid ${item.accent}30`,
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xl font-black opacity-20"
                        style={{ fontFamily: "JetBrains Mono, monospace" }}
                      >
                        {item.num}
                      </span>
                      {item.flagship && (
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30"
                          style={{ color: $.warning }}
                        >
                          ★ Flagship
                        </span>
                      )}
                    </div>

                    <h3
                      className="font-bold text-lg leading-snug transition-colors duration-300 group-hover:text-[#00629B]"
                      style={{ color: $.navy }}
                    >
                      {item.title}
                    </h3>

                    <p className="text-sm leading-relaxed" style={{ color: $.slate }}>
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Card footer buttons */}
                <div className="relative z-10 pt-4 border-t border-ofBorder/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedProblem(item)}
                    className="px-3 py-2 rounded-xl bg-ofSoftBlue hover:bg-ofBorder/60 border border-ofBorder text-xs text-ofNavy flex items-center gap-1.5 transition-colors font-medium"
                  >
                    <Eye className="w-3.5 h-3.5 text-ieeeBlue" />
                    <span>Full Spec</span>
                  </button>
                  <a
                    href={item.starterFile}
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

        {/* 3. HACKATHON SCHEDULE (MATCHING J7 SECTION) */}
        <section className="py-12 max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider glass-card-subtle"
              style={{ color: $.embsPurple }}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </div>
            <h2
              className="text-3xl sm:text-5xl font-black"
              style={{ fontFamily: "Sora, sans-serif", color: $.navy }}
            >
              Hackathon Schedule
            </h2>
            <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: $.slate }}>
              Structured progression across development rounds, automated AI evaluation, scenario shift
              handling, and final panel evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {officialSchedule.map((item, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl p-6 space-y-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                style={
                  item.highlight
                    ? {
                        border: `1px solid ${$.embsPurple}40`,
                        background: `linear-gradient(135deg, #FFFFFF, ${$.softPurple})`,
                        boxShadow: "0 12px 40px rgba(119,37,131,0.08)",
                      }
                    : {
                        background: $.white,
                        border: `1px solid ${$.border}`,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                      }
                }
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-bold text-lg opacity-30 group-hover:opacity-60 transition-opacity"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {item.num}
                  </span>
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider"
                    style={
                      item.highlight
                        ? { background: `${$.embsPurple}15`, color: $.embsPurple }
                        : { background: $.softBlue, color: $.ieeeBlue }
                    }
                  >
                    {item.tag}
                  </span>
                </div>

                <div
                  className="flex items-center gap-2 text-xs font-semibold group-hover:scale-105 transition-transform origin-left"
                  style={{ color: $.ieeeBlue, fontFamily: "JetBrains Mono, monospace" }}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.time}</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm" style={{ color: $.navy }}>
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: $.slate }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. INTEGRITY ARCHITECTURE (EXACT LIVE SITE SECTION) */}
        <section className="py-12 max-w-[1280px] mx-auto px-4 sm:px-8">
          <div
            className="rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-2xl group transition-transform duration-700 ease-out"
            style={{
              background: `linear-gradient(135deg, #FFFFFF 0%, ${$.softBlue} 100%)`,
              border: `1px solid ${$.border}`,
              transform: `translate(${mousePos.nX * -5}px, ${mousePos.nY * -5}px)`,
            }}
          >
            <div
              className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 group-hover:scale-110 transition-transform duration-1000"
              style={{
                background: `radial-gradient(circle, ${$.ieeeBlue} 0%, transparent 70%)`,
                filter: "blur(80px)",
                transform: "translate(30%, -30%)",
              }}
            />

            <div className="relative z-10 space-y-8 max-w-4xl">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider"
                style={{ background: `${$.ieeeBlue}15`, color: $.ieeeBlue }}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Integrity Architecture</span>
              </div>

              <h2
                className="text-3xl sm:text-5xl font-black"
                style={{ fontFamily: "Sora, sans-serif", color: $.navy }}
              >
                Why OptiForge Cannot Simply Be &quot;Prompted&quot; Into a Win
              </h2>

              <p className="text-base leading-relaxed max-w-3xl" style={{ color: $.slate }}>
                Most engineering competitions collapse when participants paste problem prompts into LLMs.
                OptiForge is explicitly engineered with multiple defensive layers to evaluate genuine
                computational intelligence intuition and engineering skill.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    title: "Hidden Scenario Shifts",
                    color: $.cyan,
                    desc: "Static prompt solutions break during 2nd Development when dynamic perturbations are injected into test data.",
                  },
                  {
                    title: "AI Evaluation & Reflection",
                    color: $.aiPurple,
                    desc: "1st Development solutions undergo automated AI scoring. Teams submit reflection notes on parameter adaptation.",
                  },
                  {
                    title: "Live Patch Agility",
                    color: $.warning,
                    desc: "A surprise constraint during 2nd Development tests real-time code refactoring and mental model clarity.",
                  },
                  {
                    title: "Final Panel Defense",
                    color: $.ieeeBlue,
                    desc: "Expert faculty judges rigorously question teams on algorithmic representations and convergence.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl space-y-3 transition-all hover:-translate-y-1 hover:shadow-lg"
                    style={{ background: $.white, border: `1px solid ${$.border}` }}
                  >
                    <div className="flex items-center gap-3 font-bold" style={{ color: item.color }}>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: $.slate }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. INTERACTIVE ARENA: SWARM MOTION SIMULATION */}
        <section className="py-6 max-w-[1280px] mx-auto px-4 sm:px-8 space-y-6">
          <div className="text-center space-y-2">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono font-semibold glass-card-subtle"
              style={{ color: $.ieeeBlue }}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Interactive Arena · Swarm Robotics & Autonomous Hospital Logistics</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black"
              style={{ fontFamily: "Sora, sans-serif", color: $.navy }}
            >
              Live Swarm Motion Simulation Arena
            </h2>
            <p className="text-sm max-w-xl mx-auto" style={{ color: $.slate }}>
              Interactive preview of multi-agent swarm pathfinding, dynamic corridor obstacle clearance, and
              autonomous clinic logistics.
            </p>
          </div>

          <div
            className="p-4 sm:p-6 rounded-3xl shadow-card"
            style={{ background: $.white, border: `1px solid ${$.border}` }}
          >
            <CoverageMapVisualization />
          </div>
        </section>

        {/* 6. PRIZES, GOODIES & CERTIFICATES — Interactive Section */}
        <section id="prizes" className="py-16 max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider glass-card-subtle"
              style={{ color: $.ieeeBlue }}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Rewards & Recognition</span>
            </div>
            <h2
              className="text-3xl sm:text-5xl font-black"
              style={{ fontFamily: "Sora, sans-serif", color: $.navy }}
            >
              Prizes, Goodies &amp; Certificates
            </h2>
            <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: $.slate }}>
              Compete for cash awards, exclusive goodies, and IEEE-authenticated certificates. Every registered
              participant receives a certificate of participation.
            </p>
          </div>

          {/* Prize Podium Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            {/* 2nd Place */}
            <div
              className="rounded-3xl p-8 text-center space-y-4 transition-all hover:-translate-y-2 hover:shadow-2xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, #F0F7FB 0%, ${$.white} 100%)`,
                border: `2px solid ${$.border}`,
              }}
            >
              <div className="text-5xl">🥈</div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest font-semibold" style={{ color: $.slate }}>
                  2nd Place
                </div>
                <div className="text-4xl font-black mt-2" style={{ fontFamily: "Sora, sans-serif", color: $.ieeeBlue }}>
                  ₹5,000
                </div>
              </div>
              <div className="space-y-2 text-xs text-left" style={{ color: $.slate }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: $.success }} />
                  <span>Cash Prize ₹5,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: $.success }} />
                  <span>Tech Goodies Package</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: $.success }} />
                  <span>IEEE Winner Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: $.success }} />
                  <span>Trophy</span>
                </div>
              </div>
            </div>

            {/* 1st Place — Tallest */}
            <div
              className="rounded-3xl p-8 text-center space-y-4 transition-all hover:-translate-y-2 hover:shadow-2xl shadow-2xl relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${$.ieeeBlue} 0%, #004A75 100%)`,
                border: `2px solid ${$.ieeeBlue}`,
                transform: "translateY(-16px)",
              }}
            >
              <div className="absolute top-4 right-4">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#FFFFFF" }}
                >
                  Champion
                </span>
              </div>
              <div className="text-5xl">🥇</div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest font-semibold text-white/70">
                  1st Place
                </div>
                <div className="text-5xl font-black mt-2 text-white" style={{ fontFamily: "Sora, sans-serif" }}>
                  ₹10,000
                </div>
              </div>
              <div className="space-y-2 text-xs text-left text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                  <span>Cash Prize ₹10,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                  <span>Premium Tech Goodies</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                  <span>IEEE Champion Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                  <span>Champions Trophy + Medal</span>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div
              className="rounded-3xl p-8 text-center space-y-4 transition-all hover:-translate-y-2 hover:shadow-2xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, #FFF8F0 0%, ${$.white} 100%)`,
                border: `2px solid #F0C878`,
              }}
            >
              <div className="text-5xl">🥉</div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest font-semibold" style={{ color: $.slate }}>
                  3rd Place
                </div>
                <div className="text-4xl font-black mt-2" style={{ fontFamily: "Sora, sans-serif", color: $.warning }}>
                  ₹2,500
                </div>
              </div>
              <div className="space-y-2 text-xs text-left" style={{ color: $.slate }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: $.success }} />
                  <span>Cash Prize ₹2,500</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: $.success }} />
                  <span>Goodies Package</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: $.success }} />
                  <span>IEEE Merit Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: $.success }} />
                  <span>Trophy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Prize Pool Banner */}
          <div
            className="rounded-3xl p-8 sm:p-12 text-center space-y-4 relative overflow-hidden shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${$.embsPurple}15 0%, ${$.softBlue} 100%)`,
              border: `1px solid ${$.embsPurple}30`,
            }}
          >
            <div className="text-sm font-mono uppercase tracking-widest font-semibold" style={{ color: $.embsPurple }}>
              Total Prize Pool
            </div>
            <div className="text-6xl sm:text-7xl font-black" style={{ fontFamily: "Sora, sans-serif", color: $.navy }}>
              ₹17,500+
            </div>
            <p className="text-sm max-w-xl mx-auto" style={{ color: $.slate }}>
              Cash awards across all podium positions, plus exclusive tech goodies and IEEE-authenticated certificates for every participant.
            </p>
          </div>

          {/* Goodies & Certificates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Goodies Card */}
            <div
              className="rounded-3xl p-8 space-y-5 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
              style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${$.aiPurple}15` }}
                >
                  🎁
                </div>
                <div>
                  <h3 className="font-black text-xl" style={{ fontFamily: "Sora, sans-serif", color: $.navy }}>
                    Tech Goodies
                  </h3>
                  <p className="text-xs" style={{ color: $.slate }}>For podium teams</p>
                </div>
              </div>
              <div className="space-y-3 text-sm" style={{ color: $.slate }}>
                {[
                  "IEEE EMBS × IEEE CIS branded merchandise",
                  "Premium tech accessories and gadgets",
                  "Exclusive OptiForge 2026 commemorative kit",
                  "Goodies bag with stationery and tech items",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 shrink-0" style={{ color: $.aiPurple }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates Card */}
            <div
              className="rounded-3xl p-8 space-y-5 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
              style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${$.success}15` }}
                >
                  📜
                </div>
                <div>
                  <h3 className="font-black text-xl" style={{ fontFamily: "Sora, sans-serif", color: $.navy }}>
                    IEEE Certificates
                  </h3>
                  <p className="text-xs" style={{ color: $.slate }}>For ALL verified participants</p>
                </div>
              </div>
              <div className="space-y-3 text-sm" style={{ color: $.slate }}>
                {[
                  "E-Certificate of Participation for every registered member",
                  "Jointly issued by IEEE EMBS & IEEE CIS Chapters",
                  "Verifiable digital certificate with unique ID",
                  "Winner & Merit certificates for podium teams",
                  "Downloadable from the OptiForge portal post-event",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: $.success }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div
                className="p-3 rounded-xl text-xs font-semibold"
                style={{ backgroundColor: `${$.success}10`, color: $.success, border: `1px solid ${$.success}30` }}
              >
                Every verified participant receives a certificate — regardless of final rank!
              </div>
            </div>
          </div>
        </section>
        {/* 6. RULES & FAQ (EXACT LIVE SITE SECTION) */}
        <section className="py-12 max-w-3xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="text-center space-y-3">
            <h2
              className="text-3xl font-black"
              style={{ fontFamily: "Sora, sans-serif", color: $.navy }}
            >
              Rules & FAQ
            </h2>
            <p className="text-base" style={{ color: $.slate }}>
              Everything you need to know before registering.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-6 space-y-3 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                style={{ background: $.white, border: `1px solid ${$.border}` }}
              >
                <h4 className="font-bold text-base" style={{ color: $.navy }}>
                  {item.q}
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: $.slate }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. READY TO COMPETE CTA (MATCHING LIVE SITE BOTTOM CTA) */}
        <section className="py-16 max-w-[1280px] mx-auto px-4 sm:px-8 text-center space-y-8">
          <h2
            className="text-4xl sm:text-6xl font-black"
            style={{ fontFamily: "Sora, sans-serif", color: $.navy }}
          >
            Ready to Compete?
          </h2>
          <p className="max-w-xl mx-auto text-base leading-relaxed" style={{ color: $.slate }}>
            Register your team of 2–4 members. ₹100 per member, payable at the venue on 30 September 2026.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/register"
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-base text-white transition-all hover:scale-105 active:scale-95 shadow-lg overflow-hidden relative"
              style={{ background: $.ieeeBlue }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                Register Now (₹100/member)
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="/login"
              className="group inline-flex items-center gap-2 px-8 py-5 rounded-2xl text-base font-bold transition-all hover:scale-105 shadow-sm hover:shadow-md"
              style={{ background: $.white, border: `2px solid ${$.ieeeBlue}`, color: $.ieeeBlue }}
            >
              <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Visit OptiForge Portal</span>
            </Link>
          </div>
        </section>

        {/* 8. MODAL: FULL SPECIFICATION VIEWER */}
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
                <div className="text-xs font-mono text-ieeeBlue font-semibold">
                  {selectedProblem.technique}
                </div>
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
    </div>
  );
}
