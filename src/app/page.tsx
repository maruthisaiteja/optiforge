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
  Flame,
  Activity,
  HeartPulse,
  Brain,
  Scan,
  ActivitySquare,
  Wifi,
  Bot,
  ExternalLink,
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
  // Countdown to 30th September 2026 10:00 AM IST
  const targetTime = new Date("2026-09-30T10:00:00+05:30").getTime();
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

  // Accordion FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Official 4-Phase Schedule (J7 from live site)
  const officialSchedule = [
    {
      num: "01",
      time: "10:00–12:30",
      title: "1st Round (1st Development)",
      desc: "Problem briefing, track selection, core algorithm design, and automated AI benchmark evaluation.",
      tag: "Round 1",
      highlight: true,
    },
    {
      num: "02",
      time: "12:30–13:15",
      title: "Lunch Break & Networking",
      desc: "Networking and lunch break. Teams regroup, analyze leaderboard metrics, and adjust strategy for afternoon rounds.",
      tag: "Break",
      highlight: false,
    },
    {
      num: "03",
      time: "13:15–15:00",
      title: "2nd Round (2nd Development)",
      desc: "Dynamic scenario shift injection, real-time code adaptation, and the 20-minute Live Patch Round (Strictly Zero AI).",
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

  // 9 Official Innovation Themes (Z7 from live site & official spec)
  const innovationThemes = [
    {
      id: "theme-1-biomedical-ai",
      num: "01",
      code: "T1",
      title: "Biomedical Artificial Intelligence",
      tag: "EMBS Domain",
      desc: "Develop AI and machine-learning solutions for healthcare, including disease prediction, clinical decision support, and personalized medicine.",
      accent: $.aiPurple,
      bg: "#F4F1FF",
      icon: <Brain className="w-6 h-6" />,
      difficulty: "Advanced",
      technique: "Genetic Algorithm + Fuzzy Clinical Risk Modeling",
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
      num: "02",
      code: "T2",
      title: "EdTech & Intelligent Learning Systems",
      tag: "CIS Domain",
      desc: "Formulate adaptive learning platforms and curriculum optimization algorithms that dynamically personalize student mastery pathways.",
      accent: $.ieeeBlue,
      bg: $.softBlue,
      icon: <Cpu className="w-6 h-6" />,
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
      num: "03",
      code: "T3",
      title: "Digital Health & Telemedicine",
      tag: "EMBS Domain",
      desc: "Design dynamic dispatch and queue prioritization engines that match patient urgency with remote specialist availability under network fluctuations.",
      accent: $.embsPurple,
      bg: $.softPurple,
      icon: <HeartPulse className="w-6 h-6" />,
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
      num: "04",
      code: "T4",
      title: "Neurotechnology & Rehabilitation",
      tag: "EMBS × CIS",
      desc: "Develop adaptive neuro-decoding algorithms using swarm intelligence to optimize spatial filtering weights and intent classification for BCI prosthetics.",
      accent: $.cyan,
      bg: "#EFFBFD",
      icon: <Sparkles className="w-6 h-6" />,
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
      num: "05",
      code: "T5",
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
      attemptProgression: "Attempt 1: High-contrast benchmark slice segmentation → Attempt 2: Shift (Motion blur & low-dose quantum noise) → Attempt 3: Shift (Micro-lesion boundary ambiguity)",
    },
    {
      id: "theme-6-biomedical-signals",
      num: "06",
      code: "T6",
      title: "Biomedical Signals & Intelligent Systems",
      tag: "EMBS Domain",
      desc: "Apply intelligent algorithms to ECG, EEG, EMG, and PPG for signal processing, anomaly detection, and physiological monitoring.",
      accent: $.medRed,
      bg: "#FFF2F4",
      icon: <ActivitySquare className="w-6 h-6" />,
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
      num: "07",
      code: "T7",
      title: "Smart Healthcare & Medical IoT",
      tag: "CIS Domain",
      desc: "Design energy-aware swarm routing heuristics balancing transmission energy, telemetry priority, and sensor battery lifespan across wearable mesh nodes.",
      accent: $.ieeeBlue,
      bg: $.softBlue,
      icon: <Wifi className="w-6 h-6" />,
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
      num: "08",
      code: "T8",
      title: "Healthcare Robotics & Automation",
      tag: "EMBS × CIS",
      desc: "Develop autonomous, adaptive, and multi-agent systems for robotic surgery assistance, hospital corridor navigation, and contactless logistics.",
      accent: $.warning,
      bg: "#FFF9EB",
      icon: <Bot className="w-6 h-6" />,
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
      num: "09",
      code: "T9",
      title: "Open Innovation on (CIS and EMBS only)",
      tag: "Flagship Domain",
      desc: "An interdisciplinary track for novel solutions combining computational intelligence with biomedical engineering and healthcare challenges.",
      accent: $.cyan,
      bg: "#EFFBFD",
      icon: <Sparkles className="w-6 h-6" />,
      flagship: true,
      difficulty: "Advanced",
      technique: "Hybrid Evolutionary-Fuzzy Frameworks",
      society: "IEEE CIS & IEEE EMBS Only",
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

  const faqs = [
    {
      q: "Who can participate?",
      a: "Any registered student from any institution in India. A team of 2–4 members is required. No prior competition experience needed.",
    },
    {
      q: "What is the registration fee?",
      a: "₹100 per team member (₹200 for 2 members, ₹300 for 3 members, ₹400 for 4 members), payable securely online via direct UPI / QR gateway or on 30 September 2026.",
    },
    {
      q: "How is scoring done?",
      a: "Multi-metric scoring: automated solution quality (fitness score), runtime efficiency, AST structure analysis, and AI evaluation feedback combined with final jury viva defense.",
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
              Computational Intelligence Challenge · Hackathon Algorithm Design
            </p>

            {/* Description */}
            <p
              className="max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
              style={{ color: $.slate }}
            >
              Engineer high-performance evolutionary heuristics, machine learning models, and intelligent
              systems. Compete across 9 innovation themes with live development rounds, AI evaluation,
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
                <span>10:00 AM – 4:00 PM IST</span>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md glass-card-subtle cursor-default"
                style={{ color: $.navy }}
              >
                <MapPin className="w-3.5 h-3.5" style={{ color: $.medRed }} />
                <span>Vardhaman College of Engineering</span>
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
                <span>9 Innovation Themes</span>
              </a>
            </div>
          </div>
        </section>

        {/* 2. PROBLEM DOMAINS: 9 INNOVATION THEMES (MATCHING Z7 CARDS) */}
        <section id="themes" className="py-12 max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider glass-card-subtle"
              style={{ color: $.cyan }}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>9 Innovation Themes</span>
            </div>
            <h2
              className="text-3xl sm:text-5xl font-black"
              style={{ fontFamily: "Sora, sans-serif", color: $.navy }}
            >
              Problem Domains
            </h2>
            <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: $.slate }}>
              Explore our 9 problem domains engineered for computational intelligence, algorithm design,
              and interdisciplinary healthcare innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {innovationThemes.map((item, idx) => (
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
              <span>Timeline · 30 September 2026</span>
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

        {/* 5. INTERACTIVE ARENA: HEALTHCARE ROBOTICS SWARM SIMULATION */}
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
            Register your team of 2–4 members. ₹100 per member, payable on 30 September 2026.
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

        {/* 8. MODAL: FULL 7-SECTION SPECIFICATION VIEWER */}
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
