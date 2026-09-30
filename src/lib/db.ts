import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { neon, neonConfig } from "@neondatabase/serverless";

// CRITICAL: Disable Next.js fetch caching for Neon to prevent stale DB reads
if (typeof neonConfig !== "undefined") {
  (neonConfig as any).fetchOptions = {
    cache: "no-store",
  };
}

const IS_VERCEL = process.env.VERCEL === "1" || (process.env.NODE_ENV === "production" && process.platform === "linux");
const SEED_FILE = path.join(process.cwd(), "data", "optiforge_db.json");
const DATA_DIR = IS_VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "optiforge_db.json");

export interface UserRecord {
  id: string;
  username: string;
  password: string;
  rawPassword?: string | null;
  name: string;
  role: "ADMIN" | "JUDGE" | "TEAM";
  assignedDomainId?: string | null;
  assignedVenue?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberRecord {
  id: string;
  teamId: string;
  name: string;
  collegeName?: string | null;
  rollNumber: string;
  branch: string;
  year: string;
  email: string;
  phone: string;
  tshirtSize?: string | null;
  createdAt: string;
}

export interface TeamRecord {
  id: string;
  teamCode: string; // e.g. OPT-26-8941
  teamName: string;
  leaderEmail: string;
  leaderPhone: string;
  password: string;
  rawPassword?: string | null;
  domainId?: string | null;
  venue?: "1011" | "1019" | "1020" | string | null;
  assignedJudgeId?: string | null;
  prefTrack1?: string | null;
  prefTrack2?: string | null;
  prefTrack3?: string | null;
  prefTrack4?: string | null;
  skillLevel: string;
  paymentStatus: "PENDING_PAYMENT" | "CONFIRMED" | "FAILED";
  paymentAmount: number;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  attemptsUsed: number;
  bestScore: number;
  finalJudgeScore?: number | null;
  finalCombinedScore?: number | null;
  isDisqualified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemTrackRecord {
  id: string;
  name: string;
  shortName: string;
  society: string; // IEEE EMBS × IEEE CIS
  difficulty: string; // Intermediate–Advanced or Advanced
  technique: string;
  context: string;
  coreChallenge: string;
  hardConstraints: string[];
  optimizationObjectives: string[];
  hiddenTestNote: string;
  expectedOutputChecklist: string[];
  description: string;
  statementMarkdown: string;
  starterNotebookUrl?: string | null;
  benchmarkType: string;
  // Confidential backend fields (Part E)
  hiddenShiftAttempt2?: string | null;
  hiddenShiftAttempt3?: string | null;
  livePatchSurprise?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionRecord {
  id: string;
  teamId: string;
  attemptNumber: number;
  filename: string;
  codeContent: string;
  approachNotes?: string | null;
  whatChangedNotes?: string | null; // For Attempt 2 and 3
  isLivePatch?: boolean; // For Stage 7
  status: "QUEUED" | "RUNNING" | "SCORED" | "FAILED";
  runtimeMs: number;
  solutionQuality: number;
  efficiencyScore: number;
  designQuality: number;
  consistencyScore: number;
  autoScore: number;
  isAiAssisted: boolean;
  aiExplanation?: string | null;
  executionLogs?: string | null;
  similarityScore?: number | null;
  similarityFlag: boolean;
  ipAddress?: string | null;
  submittedAt: string;

  // Hack2Skill Extended Submission & AI Evaluation Fields
  trackId?: string | null;
  problemTitle?: string | null;
  problemDescription?: string | null;
  githubUrl?: string | null;
  deployedUrl?: string | null;
  mediaUrl?: string | null;
  notebookContent?: string | null;
  codeQualityScore?: number | null;
  securityScore?: number | null;
  efficiencyMetricScore?: number | null;
  testingScore?: number | null;
  accessibilityScore?: number | null;
  domainTrackScore?: number | null;
  problemAlignmentScore?: number | null;
  aiInsights?: string[];
  metricsBreakdown?: any;
  repoStats?: any;
}

export interface JudgeEvaluationRecord {
  id: string;
  judgeId: string;
  submissionId: string;
  teamId: string;
  codeQuality: number;
  algorithmicReasoning: number;
  resultInterpretation: number;
  innovation: number;
  totalJudgeScore: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "URGENT";
  isActive: boolean;
  createdAt: string;
}

export interface SystemSettingRecord {
  key: string;
  value: string;
  description?: string | null;
  updatedAt: string;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  performedBy: string;
  details: string;
  reason?: string | null;
  createdAt: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  teams: TeamRecord[];
  teamMembers: TeamMemberRecord[];
  problemTracks: ProblemTrackRecord[];
  submissions: SubmissionRecord[];
  judgeEvaluations: JudgeEvaluationRecord[];
  announcements: AnnouncementRecord[];
  systemSettings: SystemSettingRecord[];
  auditLogs: AuditLogRecord[];
}

export function ensureTestAccount(data: DatabaseSchema): DatabaseSchema {
  if (!data || !Array.isArray(data.teams)) return data;

  const TEST_TEAM_CODE = "OPT-26-TEST";
  const TEST_TEAM_ID = "optiforge-test-team-sandbox-id";

  const existingTeam = data.teams.find((t) => t.teamCode === TEST_TEAM_CODE || t.id === TEST_TEAM_ID);
  if (!existingTeam) {
    const newTestTeam: TeamRecord = {
      id: TEST_TEAM_ID,
      teamCode: TEST_TEAM_CODE,
      teamName: "AI Evaluation Test Sandbox",
      leaderEmail: "test@optiforge.internal",
      leaderPhone: "9999999999",
      password: "$2b$10$ByPTloIj.ZwL1PQHMmCTeO6ZVeBbQEUfPeMyri7DMnuv13h8OIebm", // "Test#Forge2026"
      domainId: "theme-1-biomedical-ai",
      skillLevel: "Advanced",
      paymentStatus: "CONFIRMED",
      paymentAmount: 100,
      razorpayOrderId: "rzp_test_bypass",
      razorpayPaymentId: "TEST_UTR_VERIFIED",
      razorpaySignature: "ADMIN_VERIFIED_APPROVED",
      attemptsUsed: 0,
      bestScore: 0,
      finalJudgeScore: null,
      finalCombinedScore: null,
      isDisqualified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.teams.push(newTestTeam);

    if (Array.isArray(data.teamMembers)) {
      const existingMember = data.teamMembers.find((m) => m.teamId === TEST_TEAM_ID);
      if (!existingMember) {
        data.teamMembers.push({
          id: "optiforge-test-member-leader",
          teamId: TEST_TEAM_ID,
          name: "Test Leader (Sandbox Evaluator)",
          collegeName: "Vardhaman College of Engineering",
          rollNumber: "26TEST01",
          branch: "CSE",
          year: "3rd Year",
          email: "test@optiforge.internal",
          phone: "9999999999",
          tshirtSize: "L",
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (Array.isArray(data.users)) {
      const existingUser = data.users.find((u) => u.username === "testteam" || u.username === TEST_TEAM_CODE);
      if (!existingUser) {
        data.users.push({
          id: "optiforge-test-user-id",
          username: "testteam",
          password: "$2b$10$ByPTloIj.ZwL1PQHMmCTeO6ZVeBbQEUfPeMyri7DMnuv13h8OIebm", // "Test#Forge2026"
          name: "AI Evaluation Test Sandbox",
          role: "TEAM",
          assignedDomainId: "theme-1-biomedical-ai",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }
  return data;
}

export const DEFAULT_JUDGES = [
  { id: "judge-user-01", username: "judge1", name: "Dr. Evaluation Panel 1", assignedVenue: "1011", rawPassword: "OptiForge#Judge01!" },
  { id: "judge-user-02", username: "judge2", name: "Prof. Evaluation Panel 2", assignedVenue: "1011", rawPassword: "OptiForge#Judge02!" },
  { id: "judge-user-03", username: "judge3", name: "Dr. Evaluation Panel 3", assignedVenue: "1011", rawPassword: "OptiForge#Judge03!" },
  { id: "judge-user-04", username: "judge4", name: "Prof. Evaluation Panel 4", assignedVenue: "1019", rawPassword: "OptiForge#Judge04!" },
  { id: "judge-user-05", username: "judge5", name: "Dr. Evaluation Panel 5", assignedVenue: "1019", rawPassword: "OptiForge#Judge05!" },
  { id: "judge-user-06", username: "judge6", name: "Prof. Evaluation Panel 6", assignedVenue: "1019", rawPassword: "OptiForge#Judge06!" },
  { id: "judge-user-07", username: "judge7", name: "Dr. Evaluation Panel 7", assignedVenue: "1019", rawPassword: "OptiForge#Judge07!" },
  { id: "judge-user-08", username: "judge8", name: "Prof. Evaluation Panel 8", assignedVenue: "1020", rawPassword: "OptiForge#Judge08!" },
  { id: "judge-user-09", username: "judge9", name: "Dr. Evaluation Panel 9", assignedVenue: "1020", rawPassword: "OptiForge#Judge09!" },
  { id: "judge-user-10", username: "judge10", name: "Lead Jury Chair Panel 10", assignedVenue: "1020", rawPassword: "OptiForge#Judge10!" },
];

export function ensureJudgeAccounts(data: DatabaseSchema): DatabaseSchema {
  if (!data || !Array.isArray(data.users)) return data;

  const now = new Date().toISOString();
  for (const j of DEFAULT_JUDGES) {
    const existing = data.users.find((u) => u.username.toLowerCase() === j.username.toLowerCase());
    if (!existing) {
      const hashedPassword = bcrypt.hashSync(j.rawPassword, 10);
      data.users.push({
        id: j.id,
        username: j.username,
        password: hashedPassword,
        rawPassword: j.rawPassword,
        name: j.name,
        role: "JUDGE",
        assignedVenue: j.assignedVenue,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      existing.rawPassword = j.rawPassword;
      if (!existing.assignedVenue) existing.assignedVenue = j.assignedVenue;
      if (!existing.name) existing.name = j.name;
    }
  }
  return data;
}

export const OFFICIAL_INNOVATION_THEMES: ProblemTrackRecord[] = [
  {
    id: "theme-1-biomedical-ai",
    name: "Biomedical Artificial Intelligence",
    shortName: "01: Biomedical AI",
    society: "IEEE EMBS × IEEE CIS",
    difficulty: "Advanced",
    technique: "Evolutionary Neural Architecture Search & Hybrid GA-ML",
    context: "Clinical healthcare pipelines generate vast multi-modal patient telemetry, electronic health records, genomic biomarkers, and pathology features. Medical practitioners require explainable AI models capable of predictive risk stratification while respecting strict sensitivity constraints.",
    coreChallenge: "Design an evolutionary optimization algorithm to search high-dimensional biomedical feature spaces and optimize hybrid clinical decision boundaries, maximizing sensitivity for rare critical pathologies while minimizing false positive alerts under real-world clinical noise.",
    hardConstraints: [
      "Sensitivity for life-critical conditions must meet clinical safety minimum (>98%)",
      "Feature selection must respect clinical interpretability and causal plausibility",
      "Algorithm must output calibrated diagnostic confidence and uncertainty intervals",
      "Execution latency per patient record cannot exceed operational clinical SLA",
      "Model must not collapse under missing or asynchronously sampled clinical inputs"
    ],
    optimizationObjectives: [
      "Maximize diagnostic ROC-AUC and high-risk case recall",
      "Minimize false alarms and unnecessary clinical interventions",
      "Minimize computational complexity for edge clinical deployment",
      "Maximize stability and consistency across multi-center demographic shifts"
    ],
    hiddenTestNote: "Hidden test cases inject rare co-morbidities and 20% corrupted sensor telemetry. The model must preserve life-critical sensitivity.",
    expectedOutputChecklist: [
      "Algorithm implementation (submitted notebook/script)",
      "Parameter configuration used, clearly stated",
      "Final objective/score for each attempt",
      "Convergence or iteration evidence (a plot or log showing the algorithm improving over iterations)",
      "A short written explanation covering: representation used, operators/rules chosen, how constraints were handled, and why the selected CI technique fits this problem",
      "A one-line 'what changed and why' note with every attempt after the first"
    ],
    description: "Develop AI and machine-learning solutions for healthcare, including disease prediction, clinical decision support, and personalized medicine.",
    statementMarkdown: "### Theme 1 — Biomedical Artificial Intelligence\\n\\n**Society:** IEEE EMBS × IEEE CIS | **Track:** Advanced | **Technique:** Evolutionary Neural Architecture Search & Hybrid GA-ML\\n\\n#### Context\\nClinical healthcare pipelines generate vast multi-modal patient telemetry, electronic health records, genomic biomarkers, and pathology features. Medical practitioners require explainable AI models capable of predictive risk stratification while respecting strict sensitivity constraints.\\n\\n#### Core Challenge\\nDesign an evolutionary optimization algorithm to search high-dimensional biomedical feature spaces and optimize hybrid clinical decision boundaries, maximizing sensitivity for rare critical pathologies while minimizing false positive alerts under real-world clinical noise.",
    starterNotebookUrl: "/starter/starter_p1_scheduling.py",
    benchmarkType: "BIOMEDICAL_AI_EVOLUTIONARY",
    hiddenShiftAttempt2: "Demographic perturbation: Patient age and comorbid distributions shifted by 35% with missing laboratory markers.",
    hiddenShiftAttempt3: "Adversarial clinical noise: 20% of continuous ICU vitals perturbed with Gaussian sensor drift.",
    livePatchSurprise: "One urgent biomarker feature is rendered unavailable; algorithm must dynamically re-evaluate confidence without retraining from scratch.",
    createdAt: "2026-09-23T16:08:26.523Z",
    updatedAt: "2026-09-30T12:00:00.000Z"
  },
  {
    id: "theme-2-signals",
    name: "Biomedical Signals & Intelligent Systems",
    shortName: "02: Biomedical Signals",
    society: "IEEE EMBS",
    difficulty: "Advanced",
    technique: "Fuzzy Inference Systems + Evolutionary Signal Decomposition",
    context: "Continuous physiological monitoring in Intensive Care Units captures streaming ECG, EMG, and photoplethysmography (PPG) waveforms subject to severe motion artifacts and baseline wandering.",
    coreChallenge: "Formulate an evolutionary fuzzy system that filters non-stationary artifacts, extracts morphological signal components, and detects acute cardiac or neurological events with high fidelity and ultra-low latency.",
    hardConstraints: [
      "Real-time streaming throughput must match patient monitor sampling rates (>500 Hz)",
      "Critical cardiac events (ventricular fibrillation, asystole) must trigger alerts within 2 seconds",
      "Fuzzy membership rules must adhere to established clinical cardiology guidelines",
      "Processing pipeline must preserve morphological diagnostic peaks (QRS complexes, P waves)",
      "Filter coefficients must maintain phase linearity without introducing latency distortion"
    ],
    optimizationObjectives: [
      "Minimize ICU monitor false alarm rate by >70% while preserving 100% true event sensitivity",
      "Maximize signal-to-noise ratio (SNR) improvement across noisy leads",
      "Minimize computational footprint for wearable battery-powered cardiac patches",
      "Maximize adaptability across diverse baseline physiological variations"
    ],
    hiddenTestNote: "Hidden test cases inject severe electrosurgical cautery bursts and motion-induced baseline wandering.",
    expectedOutputChecklist: [
      "Algorithm implementation (submitted notebook/script)",
      "Parameter configuration used, clearly stated",
      "Final objective/score for each attempt",
      "Convergence or iteration evidence (a plot or log showing the algorithm improving over iterations)",
      "A short written explanation covering: representation used, operators/rules chosen, how constraints were handled, and why the selected CI technique fits this problem",
      "A one-line 'what changed and why' note with every attempt after the first"
    ],
    description: "Apply intelligent algorithms to ECG, EEG, EMG, and PPG for signal processing, anomaly detection, and physiological monitoring.",
    statementMarkdown: "### Theme 2 — Biomedical Signals & Intelligent Systems\\n\\n**Society:** IEEE EMBS | **Track:** Advanced | **Technique:** Fuzzy Inference Systems + Evolutionary Signal Decomposition\\n\\n#### Context\\nContinuous physiological monitoring in Intensive Care Units captures streaming ECG, EMG, and photoplethysmography (PPG) waveforms subject to severe motion artifacts and baseline wandering.\\n\\n#### Core Challenge\\nFormulate an evolutionary fuzzy system that filters non-stationary artifacts, extracts morphological signal components, and detects acute cardiac or neurological events with high fidelity and ultra-low latency.",
    starterNotebookUrl: "/starter/starter_p6_triage.py",
    benchmarkType: "BIOMEDICAL_SIGNALS_EVOLUTIONARY_FUZZY",
    hiddenShiftAttempt2: "Motion artifact injection: High-amplitude respiratory baseline wander superimposed on Lead II.",
    hiddenShiftAttempt3: "Ectopic beat clustering: Premature ventricular contractions (PVCs) occurring in rapid trigeminy bursts.",
    livePatchSurprise: "One lead disconnects entirely; system must reconstruct cardiac rhythm from single remaining PPG sensor.",
    createdAt: "2026-09-23T16:08:26.523Z",
    updatedAt: "2026-09-30T12:00:00.000Z"
  },
  {
    id: "theme-3-imaging",
    name: "Medical Imaging & Computer Vision",
    shortName: "03: Medical Imaging",
    society: "IEEE EMBS",
    difficulty: "Advanced",
    technique: "Genetic Algorithms + Heuristic Feature Space Search",
    context: "Clinical diagnosis from MRI, CT, and histological scans is hindered by low contrast, sensor noise, and artifact occlusions. Accurate boundary delineation of pathological lesions is vital.",
    coreChallenge: "Engineer a genetic heuristic that optimizes multi-scale feature filters, deformable contour boundaries, and spatial segmentation masks to maximize lesion detection precision under severe class imbalance and scan noise.",
    hardConstraints: [
      "False negative rate on malignant findings must remain below clinical safety limits",
      "Geometric contours must maintain anatomical boundary continuity and smoothness",
      "Volumetric reconstruction must execute within clinical emergency turnaround budgets",
      "Algorithm must demonstrate invariance to scan orientation and slice thickness variations",
      "All segmentations must generate pixel-level confidence maps for radiologist review"
    ],
    optimizationObjectives: [
      "Maximize Dice similarity coefficient and IoU on lesion target regions",
      "Minimize boundary Hausdorff distance and false positive segmentations",
      "Minimize computational runtime and peak memory usage",
      "Maximize robustness against motion blur, metallic artifacts, and low SNR"
    ],
    hiddenTestNote: "Hidden test cases introduce low-dose ultra-noisy scans and small boundary-adjacent micro-calcifications.",
    expectedOutputChecklist: [
      "Algorithm implementation (submitted notebook/script)",
      "Parameter configuration used, clearly stated",
      "Final objective/score for each attempt",
      "Convergence or iteration evidence (a plot or log showing the algorithm improving over iterations)",
      "A short written explanation covering: representation used, operators/rules chosen, how constraints were handled, and why the selected CI technique fits this problem",
      "A one-line 'what changed and why' note with every attempt after the first"
    ],
    description: "Develop intelligent systems for MRI, CT, ultrasound, and histopathological image analysis, segmentation, and automated interpretation.",
    statementMarkdown: "### Theme 3 — Medical Imaging & Computer Vision\\n\\n**Society:** IEEE EMBS | **Track:** Advanced | **Technique:** Genetic Algorithms + Heuristic Feature Space Search\\n\\n#### Context\\nClinical diagnosis from MRI, CT, and histological scans is hindered by low contrast, sensor noise, and artifact occlusions. Accurate boundary delineation of pathological lesions is vital.\\n\\n#### Core Challenge\\nEngineer a genetic heuristic that optimizes multi-scale feature filters, deformable contour boundaries, and spatial segmentation masks to maximize lesion detection precision under severe class imbalance and scan noise.",
    starterNotebookUrl: "/starter/starter_p5_swarm.py",
    benchmarkType: "MEDICAL_IMAGING_HEURISTIC_SEARCH",
    hiddenShiftAttempt2: "Low-dose scan noise: SNR reduced by 50% with metallic dental implant streak artifacts.",
    hiddenShiftAttempt3: "Micro-lesion challenge: Target pathology diameter reduced to sub-voxel resolution (<3mm).",
    livePatchSurprise: "Slice thickness increased by 4x; algorithm must infer 3D contours without volumetric slice re-interpolation.",
    createdAt: "2026-09-23T16:08:26.523Z",
    updatedAt: "2026-09-30T12:00:00.000Z"
  },
  {
    id: "theme-4-ml-ai",
    name: "Machine Learning & Artificial Intelligence",
    shortName: "04: ML & Artificial Intelligence",
    society: "IEEE CIS",
    difficulty: "Intermediate–Advanced",
    technique: "Multi-Objective Heuristics + Deep Evolutionary Networks",
    context: "Intelligent systems operating in dynamic real-world environments require adaptive learning models capable of solving complex multi-modal classification, continuous regression, and generative modeling tasks.",
    coreChallenge: "Design a high-performance machine learning optimization model combining automated hyperparameter search with robust loss regularization to generalize across non-stationary distributions.",
    hardConstraints: [
      "Generalization bounds must hold across out-of-distribution validation sets",
      "Optimization trajectory must converge deterministically without gradient explosion",
      "Model parameter efficiency must adhere to runtime deployment budgets",
      "Decision outputs must satisfy fair calibration across heterogeneous sub-populations"
    ],
    optimizationObjectives: [
      "Maximize multi-metric validation accuracy and generalized predictive capability",
      "Minimize loss variance and over-fitting penalty across unseen held-out splits",
      "Minimize inference latency and computational overhead",
      "Maximize explainability and architectural stability"
    ],
    hiddenTestNote: "Hidden scenarios test generalization across non-stationary dataset drift and noisy label corruptions.",
    expectedOutputChecklist: [
      "Algorithm implementation (submitted notebook/script)",
      "Parameter configuration used, clearly stated",
      "Final objective/score for each attempt",
      "Convergence or iteration evidence (a plot or log showing the algorithm improving over iterations)",
      "A short written explanation covering: representation used, operators/rules chosen, how constraints were handled, and why the selected CI technique fits this problem",
      "A one-line 'what changed and why' note with every attempt after the first"
    ],
    description: "Explore machine learning, deep learning, generative AI, and intelligent algorithms for solving complex real-world problems.",
    statementMarkdown: "### Theme 4 — Machine Learning & Artificial Intelligence\\n\\n**Society:** IEEE CIS | **Track:** Intermediate–Advanced | **Technique:** Multi-Objective Heuristics + Deep Evolutionary Networks\\n\\n#### Context\\nIntelligent systems operating in dynamic real-world environments require adaptive learning models capable of solving complex multi-modal classification, continuous regression, and generative modeling tasks.\\n\\n#### Core Challenge\\nDesign a high-performance machine learning optimization model combining automated hyperparameter search with robust loss regularization to generalize across non-stationary distributions.",
    starterNotebookUrl: "/starter/starter_p2_drone.py",
    benchmarkType: "EDTECH_KNOWLEDGE_SPACE_GA",
    hiddenShiftAttempt2: "Non-stationary distribution shift: 35% covariate drift injected into held-out evaluation splits.",
    hiddenShiftAttempt3: "Adversarial noise injection: Feature space perturbed with high-frequency noise bursts.",
    livePatchSurprise: "Regularization penalty doubled; model must maintain generalization without retraining from scratch.",
    createdAt: "2026-09-23T16:08:26.523Z",
    updatedAt: "2026-09-30T12:00:00.000Z"
  },
  {
    id: "theme-5-autonomous",
    name: "Intelligent Systems & Autonomous Computing",
    shortName: "05: Autonomous Systems",
    society: "IEEE CIS",
    difficulty: "Advanced",
    technique: "Swarm Intelligence + Adaptive Multi-Agent Heuristics",
    context: "Decentralized autonomous agents operating in shared environments must coordinate navigation, resource allocation, and distributed task execution under communication constraints and unpredictable hazards.",
    coreChallenge: "Engineer a multi-agent autonomous decision-making engine that coordinates agent trajectories, resolves resource contention, and dynamically plans pathing under real-time environmental perturbations.",
    hardConstraints: [
      "Agents must guarantee collision-free trajectories and safe operational margins",
      "Decision latency per simulation tick must stay strictly within real-time budget",
      "Coordination protocol must operate without centralized single-point-of-failure bottlenecks",
      "Dynamic environment changes must trigger sub-second trajectory recalibration"
    ],
    optimizationObjectives: [
      "Maximize collective swarm task throughput and coverage velocity",
      "Minimize cumulative collision risk and coordination deadlocks",
      "Minimize energy consumption and path trajectory length",
      "Maximize resilience against individual agent failures or communication dropouts"
    ],
    hiddenTestNote: "Hidden evaluation scenarios introduce corridor blockages and sudden network communication dropouts.",
    expectedOutputChecklist: [
      "Algorithm implementation (submitted notebook/script)",
      "Parameter configuration used, clearly stated",
      "Final objective/score for each attempt",
      "Convergence or iteration evidence (a plot or log showing the algorithm improving over iterations)",
      "A short written explanation covering: representation used, operators/rules chosen, how constraints were handled, and why the selected CI technique fits this problem",
      "A one-line 'what changed and why' note with every attempt after the first"
    ],
    description: "Develop autonomous, adaptive, and multi-agent systems capable of intelligent decision-making, learning, and real-time operation.",
    statementMarkdown: "### Theme 5 — Intelligent Systems & Autonomous Computing\\n\\n**Society:** IEEE CIS | **Track:** Advanced | **Technique:** Swarm Intelligence + Adaptive Multi-Agent Heuristics\\n\\n#### Context\\nDecentralized autonomous agents operating in shared environments must coordinate navigation, resource allocation, and distributed task execution under communication constraints and unpredictable hazards.\\n\\n#### Core Challenge\\nEngineer a multi-agent autonomous decision-making engine that coordinates agent trajectories, resolves resource contention, and dynamically plans pathing under real-time environmental perturbations.",
    starterNotebookUrl: "/starter/starter_p4_grid.py",
    benchmarkType: "HEALTHCARE_ROBOTICS_SWARM",
    hiddenShiftAttempt2: "Network drop: 30% of multi-agent communication links intermittently disrupted.",
    hiddenShiftAttempt3: "Corridor blockade: Primary throughput corridors obstructed by dynamic hazard objects.",
    livePatchSurprise: "Agent battery speed clamped to 50%; swarm must recalibrate rendezvous points within 15 minutes.",
    createdAt: "2026-09-23T16:08:26.523Z",
    updatedAt: "2026-09-30T12:00:00.000Z"
  },
  {
    id: "theme-6-open-innovation",
    name: "Open Innovation: CIS × EMBS",
    shortName: "06: Open Innovation",
    society: "IEEE EMBS × IEEE CIS",
    difficulty: "Advanced",
    technique: "Hybrid Computational Intelligence & Novel Metaheuristics",
    context: "The frontier of medical technology demands unconventional computational intelligence methodologies uniting biological modeling with cutting-edge algorithmic optimization.",
    coreChallenge: "Architect an original computational intelligence solution solving an unaddressed cross-disciplinary challenge spanning biomedical engineering and computational intelligence theory.",
    hardConstraints: [
      "Proposed algorithmic architecture must combine both EMBS and CIS core tenets",
      "Solutions must be accompanied by rigorous mathematical formulation and code harness",
      "Computational complexity must scale tractably with real-world clinical datasets",
      "All third-party scientific baselines and data sources must be credited and reproducible"
    ],
    optimizationObjectives: [
      "Maximize algorithmic novelty, cross-domain ingenuity, and mathematical elegance",
      "Maximize empirical performance gain over standard industry benchmark baselines",
      "Maximize clinical applicability and translational potential in healthcare settings",
      "Maximize computational execution efficiency and parameter sensitivity robustness"
    ],
    hiddenTestNote: "Judges evaluate algorithmic robustness against custom unannounced perturbation test suites.",
    expectedOutputChecklist: [
      "Algorithm implementation (submitted notebook/script)",
      "Parameter configuration used, clearly stated",
      "Final objective/score for each attempt",
      "Convergence or iteration evidence (a plot or log showing the algorithm improving over iterations)",
      "A short written explanation covering: representation used, operators/rules chosen, how constraints were handled, and why the selected CI technique fits this problem",
      "A one-line 'what changed and why' note with every attempt after the first"
    ],
    description: "An interdisciplinary track for novel solutions combining computational intelligence with biomedical engineering and healthcare challenges.",
    statementMarkdown: "### Theme 6 — Open Innovation: CIS × EMBS\\n\\n**Society:** IEEE EMBS × IEEE CIS | **Track:** Advanced | **Technique:** Hybrid Computational Intelligence & Novel Metaheuristics\\n\\n#### Context\\nThe frontier of medical technology demands unconventional computational intelligence methodologies uniting biological modeling with cutting-edge algorithmic optimization.\\n\\n#### Core Challenge\\nArchitect an original computational intelligence solution solving an unaddressed cross-disciplinary challenge spanning biomedical engineering and computational intelligence theory.",
    starterNotebookUrl: "/starter/starter_p3_hospital.py",
    benchmarkType: "OPEN_INNOVATION_CIS_EMBS",
    hiddenShiftAttempt2: "Sensor noise injection: Vital readings have random Gaussian noise and 15% missing telemetry.",
    hiddenShiftAttempt3: "Conflicting vitals: A set of high-risk edge cases present with normal blood pressure but critical hypoxia.",
    livePatchSurprise: "A patient presents with a rare combination of vitals that contradicts two rules simultaneously.",
    createdAt: "2026-09-23T16:08:26.523Z",
    updatedAt: "2026-09-30T12:00:00.000Z"
  }
];

export function ensureOfficialThemes(data: DatabaseSchema): boolean {
  if (!data || !Array.isArray(data.problemTracks)) return false;
  let modified = false;

  const trackMap = new Map<string, ProblemTrackRecord>();
  for (const t of data.problemTracks) {
    trackMap.set(t.id, t);
  }

  const updatedTracks: ProblemTrackRecord[] = [];
  for (const official of OFFICIAL_INNOVATION_THEMES) {
    const existing = trackMap.get(official.id);
    if (!existing) {
      updatedTracks.push({ ...official });
      modified = true;
    } else {
      if (
        existing.name !== official.name ||
        existing.shortName !== official.shortName ||
        existing.society !== official.society ||
        existing.technique !== official.technique ||
        existing.description !== official.description ||
        existing.statementMarkdown !== official.statementMarkdown
      ) {
        Object.assign(existing, {
          name: official.name,
          shortName: official.shortName,
          society: official.society,
          difficulty: official.difficulty,
          technique: official.technique,
          description: official.description,
          statementMarkdown: official.statementMarkdown,
          benchmarkType: official.benchmarkType,
        });
        modified = true;
      }
      updatedTracks.push(existing);
      trackMap.delete(official.id);
    }
  }

  if (data.problemTracks.length !== updatedTracks.length) {
    modified = true;
  }
  data.problemTracks = updatedTracks;

  // Preserve locked registration domains and map any legacy codes
  const validTrackIds = new Set(OFFICIAL_INNOVATION_THEMES.map((t) => t.id));
  const legacyMapping: Record<string, string> = {
    "p1-hospital-scheduling": "theme-1-biomedical-ai",
    "p2-drone-delivery": "theme-2-signals",
    "p3-emergency-hospital": "theme-3-imaging",
    "p4-blood-inventory": "theme-4-ml-ai",
    "p5-search-and-rescue": "theme-5-autonomous",
    "p6-fuzzy-triage": "theme-6-open-innovation",
  };

  if (Array.isArray(data.teams)) {
    for (const team of data.teams) {
      if (team.domainId && legacyMapping[team.domainId]) {
        team.domainId = legacyMapping[team.domainId];
        modified = true;
      }
      if (!team.domainId && team.prefTrack1 && validTrackIds.has(team.prefTrack1)) {
        team.domainId = team.prefTrack1;
        modified = true;
      }
      if (!team.domainId || !validTrackIds.has(team.domainId)) {
        team.domainId = "theme-1-biomedical-ai";
        modified = true;
      }
    }
  }

  return modified;
}

function filterTestTeams(data: DatabaseSchema): DatabaseSchema {
  // Preserve all real participant registrations and ensure test sandbox account exists
  ensureTestAccount(data);
  ensureJudgeAccounts(data);
  ensureOfficialThemes(data);
  return data;
}

let _hasTableChecked = false;
function getPostgresClient() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl || (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://"))) {
    return null;
  }
  try {
    return neon(databaseUrl, { fetchOptions: { cache: "no-store" } });
  } catch (err) {
    console.warn("[OptiForge DB] Failed to initialize Postgres client:", err);
    return null;
  }
}

async function ensureDb(): Promise<DatabaseSchema> {
  const sql = getPostgresClient();
  if (sql) {
    try {
      if (!_hasTableChecked) {
        await sql`
          CREATE TABLE IF NOT EXISTS optiforge_store (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            version INT DEFAULT 1
          );
        `;
        await sql`
          CREATE TABLE IF NOT EXISTS optiforge_submissions (
            id TEXT PRIMARY KEY,
            team_id TEXT NOT NULL,
            data JSONB NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;
        try {
          await sql`ALTER TABLE optiforge_store ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;`;
        } catch {}
        _hasTableChecked = true;
      }

      const rows = await sql`SELECT data, version FROM optiforge_store WHERE id = 'main'`;
      if (rows && rows.length > 0 && rows[0].data) {
        const parsed = rows[0].data as DatabaseSchema;
        if (Array.isArray(parsed.users) && Array.isArray(parsed.teams)) {
          Object.defineProperty(parsed, '__db_version', { value: rows[0].version || 1, enumerable: false });

          // Merge any granular submissions from optiforge_submissions table
          try {
            const subRows = await sql`SELECT id, team_id, data FROM optiforge_submissions ORDER BY created_at DESC LIMIT 1000`;
            if (subRows && subRows.length > 0) {
              if (!Array.isArray(parsed.submissions)) parsed.submissions = [];
              const existingIds = new Set(
                parsed.submissions
                  .map((s) => (s && typeof s === "object" ? s.id : null))
                  .filter(Boolean)
              );
              for (const r of subRows) {
                let subObj = r.data;
                if (typeof subObj === "string") {
                  try {
                    subObj = JSON.parse(subObj);
                  } catch {
                    subObj = null;
                  }
                }
                if (subObj && typeof subObj === "object") {
                  const subId = subObj.id || r.id;
                  if (subId && !existingIds.has(subId)) {
                    if (!subObj.id) subObj.id = subId;
                    if (!subObj.teamId && r.team_id) subObj.teamId = r.team_id;
                    parsed.submissions.push(subObj);
                    existingIds.add(subId);
                  }
                }
              }
            }
          } catch (mergeErr) {
            console.warn("[OptiForge DB] Notice: optiforge_submissions merge:", mergeErr);
          }

          // Clean & sanitize parsed.submissions ensuring all elements are objects with id and teamId
          if (Array.isArray(parsed.submissions)) {
            parsed.submissions = parsed.submissions
              .map((s: any) => {
                if (typeof s === "string") {
                  try { return JSON.parse(s); } catch { return null; }
                }
                return s;
              })
              .filter((s: any) => s && typeof s === "object" && s.id);
          }

          const themesMigrated = ensureOfficialThemes(parsed);
          if (themesMigrated) {
            try {
              await sql`
                UPDATE optiforge_store
                SET data = ${JSON.stringify(parsed)}, updated_at = NOW(), version = version + 1
                WHERE id = 'main';
              `;
            } catch (syncErr) {
              console.warn("[OptiForge DB] Failed to auto-persist updated themes to Postgres:", syncErr);
            }
          }

          try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf8");
          } catch {}
          return filterTestTeams(parsed);
        }
      } else {
        // If the table is completely empty (first time setup on Postgres), let it fall back
        console.warn("[OptiForge DB] Postgres is connected but no data found. Falling back to seed.");
      }
    } catch (err: any) {
      if (
        err?.message?.includes("Dynamic server usage") ||
        err?.digest === "DYNAMIC_SERVER_USAGE" ||
        err?.cause?.message?.includes("Dynamic server usage")
      ) {
        throw err;
      }
      console.error("[OptiForge DB] FATAL: Postgres read failed! Halting to prevent data wipe.", err);
      // Critical: If Postgres fails, DO NOT fall back to local seed file because saveDb will overwrite the real DB.
      throw new Error("Database connection failed. Please try again.");
    }
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    if (fs.existsSync(SEED_FILE)) {
      try {
        const seedRaw = fs.readFileSync(SEED_FILE, "utf8");
        fs.writeFileSync(DB_FILE, seedRaw, "utf8");
        const parsed = JSON.parse(seedRaw) as DatabaseSchema;
        if (sql) {
          try {
            await sql`
              INSERT INTO optiforge_store (id, data, updated_at)
              VALUES ('main', ${JSON.stringify(parsed)}, NOW())
              ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
            `;
          } catch {}
        }
        return filterTestTeams(parsed);
      } catch {}
    }
    const initial: DatabaseSchema = {
      users: [],
      teams: [],
      teamMembers: [],
      problemTracks: [],
      submissions: [],
      judgeEvaluations: [],
      announcements: [],
      systemSettings: [],
      auditLogs: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (sql) {
      sql`
        INSERT INTO optiforge_store (id, data, updated_at)
        VALUES ('main', ${JSON.stringify(parsed)}, NOW())
        ON CONFLICT (id) DO NOTHING;
      `.catch(() => {});
    }
    return filterTestTeams(parsed);
  } catch {
    if (fs.existsSync(SEED_FILE)) {
      try {
        const seedRaw = fs.readFileSync(SEED_FILE, "utf8");
        fs.writeFileSync(DB_FILE, seedRaw, "utf8");
        return filterTestTeams(JSON.parse(seedRaw) as DatabaseSchema);
      } catch {}
    }
    return {
      users: [],
      teams: [],
      teamMembers: [],
      problemTracks: [],
      submissions: [],
      judgeEvaluations: [],
      announcements: [],
      systemSettings: [],
      auditLogs: [],
    };
  }
}

let _dbQueue = Promise.resolve();
export async function withDbLock<T>(action: () => Promise<T>): Promise<T> {
  const next = _dbQueue.then(action, action);
  _dbQueue = next.then(() => {}, () => {});
  return next;
}

async function saveDb(data: DatabaseSchema): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.warn("[OptiForge DB] Local disk write error:", err);
  }

  const sql = getPostgresClient();
  if (sql) {
    try {
      if (!_hasTableChecked) {
        await sql`
          CREATE TABLE IF NOT EXISTS optiforge_store (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;
        await sql`
          CREATE TABLE IF NOT EXISTS optiforge_submissions (
            id TEXT PRIMARY KEY,
            team_id TEXT NOT NULL,
            data JSONB NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;
        _hasTableChecked = true;
      }

      const dbVersion = (data as any).__db_version;
      let res;
      
      if (dbVersion !== undefined) {
        res = await sql`
          UPDATE optiforge_store
          SET data = ${JSON.stringify(data)}, updated_at = NOW(), version = version + 1
          WHERE id = 'main' AND version = ${dbVersion}
          RETURNING id
        `;
      } else {
        res = await sql`
          INSERT INTO optiforge_store (id, data, updated_at, version)
          VALUES ('main', ${JSON.stringify(data)}, NOW(), 1)
          ON CONFLICT (id) DO UPDATE SET
            data = EXCLUDED.data,
            updated_at = NOW(),
            version = optiforge_store.version + 1
          RETURNING id
        `;
      }

      if (dbVersion !== undefined && res.length === 0) {
        throw new Error("ConcurrentModificationException: The database was modified by another request. Please try again.");
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("ConcurrentModificationException")) {
        throw err; // Bubble up OCC errors so callers can retry or fail gracefully
      }
      console.error("[OptiForge DB] Postgres persistence write error:", err);
    }
  }
}

export const db = {
  // Users
  user: {
    findUnique: async ({ where }: { where: { username?: string; id?: string } }) => {
      const data = await ensureDb();
      return data.users.find((u) => (where.username && u.username.toLowerCase() === where.username.toLowerCase()) || (where.id && u.id === where.id)) || null;
    },
    findMany: async (filter?: { where?: Partial<UserRecord> }) => {
      const data = await ensureDb();
      if (!filter?.where) return data.users;
      return data.users.filter((u) => {
        return Object.entries(filter.where!).every(([k, v]) => (u as any)[k] === v);
      });
    },
    upsert: async ({
      where,
      update,
      create,
    }: {
      where: { username: string };
      update: Partial<UserRecord>;
      create: Omit<UserRecord, "id" | "createdAt" | "updatedAt">;
    }) => {
      const data = await ensureDb();
      const existingIdx = data.users.findIndex((u) => u.username === where.username);
      const now = new Date().toISOString();

      if (existingIdx >= 0) {
        data.users[existingIdx] = {
          ...data.users[existingIdx],
          ...update,
          updatedAt: now,
        };
        await saveDb(data);
        return data.users[existingIdx];
      } else {
        const newUser: UserRecord = {
          id: crypto.randomUUID(),
          ...create,
          createdAt: now,
          updatedAt: now,
        };
        data.users.push(newUser);
        await saveDb(data);
        return newUser;
      }
    },
  },

  // Teams
  team: {
    findUnique: async ({ where }: { where: { id?: string; teamCode?: string; leaderEmail?: string } }) => {
      const data = await ensureDb();
      const team = data.teams.find(
        (t) =>
          (where.id && t.id === where.id) ||
          (where.teamCode && t.teamCode === where.teamCode) ||
          (where.leaderEmail && t.leaderEmail.toLowerCase() === where.leaderEmail.toLowerCase())
      );
      if (!team) return null;
      const members = data.teamMembers.filter((m) => m.teamId === team.id);
      const track = data.problemTracks.find((tr) => tr.id === team.domainId) || null;
      return { ...team, members, track };
    },
    findMany: async (filter?: {
      where?: Partial<TeamRecord>;
      orderBy?: { bestScore?: "asc" | "desc"; createdAt?: "asc" | "desc" };
    }) => {
      const data = await ensureDb();
      let res = data.teams;
      if (filter?.where) {
        res = res.filter((t) => {
          return Object.entries(filter.where!).every(([k, v]) => (t as any)[k] === v);
        });
      }

      // Attach members and track
      const mapped = res.map((t) => ({
        ...t,
        members: data.teamMembers.filter((m) => m.teamId === t.id),
        track: data.problemTracks.find((tr) => tr.id === t.domainId) || null,
      }));

      if (filter?.orderBy?.bestScore) {
        mapped.sort((a, b) => {
          const scoreA = a.finalCombinedScore ?? a.bestScore;
          const scoreB = b.finalCombinedScore ?? b.bestScore;
          return filter.orderBy!.bestScore === "desc" ? scoreB - scoreA : scoreA - scoreB;
        });
      }

      return mapped;
    },
    create: async ({
      data: teamData,
    }: {
      data: Omit<TeamRecord, "id" | "createdAt" | "updatedAt"> & {
        members?: { create: Omit<TeamMemberRecord, "id" | "teamId" | "createdAt">[] };
      };
    }) => {
      let attempts = 0;
      const maxAttempts = 6;
      while (attempts < maxAttempts) {
        try {
          const data = await ensureDb();
          const now = new Date().toISOString();
          const teamId = crypto.randomUUID();

          const newTeam: TeamRecord = {
            id: teamId,
            teamCode: teamData.teamCode,
            teamName: teamData.teamName,
            leaderEmail: teamData.leaderEmail,
            leaderPhone: teamData.leaderPhone,
            password: teamData.password,
            domainId: teamData.domainId || null,
            prefTrack1: teamData.prefTrack1 || null,
            prefTrack2: teamData.prefTrack2 || null,
            prefTrack3: teamData.prefTrack3 || null,
            prefTrack4: teamData.prefTrack4 || null,
            skillLevel: teamData.skillLevel || "Intermediate",
            paymentStatus: teamData.paymentStatus || "PENDING_PAYMENT",
            paymentAmount: teamData.paymentAmount || 100,
            razorpayOrderId: teamData.razorpayOrderId || null,
            razorpayPaymentId: teamData.razorpayPaymentId || null,
            razorpaySignature: teamData.razorpaySignature || null,
            attemptsUsed: teamData.attemptsUsed || 0,
            bestScore: teamData.bestScore || 0,
            finalJudgeScore: teamData.finalJudgeScore || null,
            finalCombinedScore: teamData.finalCombinedScore || null,
            venue: (teamData as any).venue || null,
            assignedJudgeId: (teamData as any).assignedJudgeId || null,
            rawPassword: (teamData as any).rawPassword || null,
            isDisqualified: teamData.isDisqualified || false,
            createdAt: now,
            updatedAt: now,
          };

          data.teams.push(newTeam);

          const createdMembers: TeamMemberRecord[] = [];
          if (teamData.members?.create) {
            for (const m of teamData.members.create) {
              const mem: TeamMemberRecord = {
                id: crypto.randomUUID(),
                teamId,
                name: m.name,
                collegeName: (m as any).collegeName || null,
                rollNumber: m.rollNumber,
                branch: m.branch,
                year: m.year,
                email: m.email,
                phone: m.phone,
                tshirtSize: m.tshirtSize || null,
                createdAt: now,
              };
              data.teamMembers.push(mem);
              createdMembers.push(mem);
            }
          }

          await saveDb(data);
          const track = data.problemTracks.find((tr) => tr.id === newTeam.domainId) || null;
          return { ...newTeam, members: createdMembers, track };
        } catch (err: any) {
          attempts++;
          if (attempts < maxAttempts && err?.message?.includes("ConcurrentModificationException")) {
            await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 120) + 40 * attempts));
            continue;
          }
          throw err;
        }
      }
      throw new Error("ConcurrentModificationException: Maximum database write retries exceeded.");
    },
    update: async ({ where, data: updates }: { where: { id?: string; teamCode?: string }; data: Partial<TeamRecord> }) => {
      let attempts = 0;
      const maxAttempts = 6;
      while (attempts < maxAttempts) {
        try {
          const data = await ensureDb();
          const idx = data.teams.findIndex(
            (t) => (where.id && t.id === where.id) || (where.teamCode && t.teamCode === where.teamCode)
          );
          if (idx === -1) throw new Error("Team not found");

          data.teams[idx] = {
            ...data.teams[idx],
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          await saveDb(data);

          const team = data.teams[idx];
          const members = data.teamMembers.filter((m) => m.teamId === team.id);
          const track = data.problemTracks.find((tr) => tr.id === team.domainId) || null;
          return { ...team, members, track };
        } catch (err: any) {
          attempts++;
          if (attempts < maxAttempts && err?.message?.includes("ConcurrentModificationException")) {
            await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 120) + 40 * attempts));
            continue;
          }
          throw err;
        }
      }
      throw new Error("ConcurrentModificationException: Maximum database update retries exceeded.");
    },
    upsert: async ({
      where,
      update,
      create,
    }: {
      where: { teamCode: string };
      update: Partial<TeamRecord>;
      create: any;
    }) => {
      const data = await ensureDb();
      const idx = data.teams.findIndex((t) => t.teamCode === where.teamCode);
      if (idx >= 0) {
        data.teams[idx] = { ...data.teams[idx], ...update, updatedAt: new Date().toISOString() };
        await saveDb(data);
        return data.teams[idx];
      } else {
        return db.team.create({ data: create });
      }
    },
    delete: async ({ where }: { where: { id?: string; teamCode?: string } }): Promise<{
      deletedTeam: TeamRecord;
      deletedMembersCount: number;
      deletedSubmissionsCount: number;
      deletedEvaluationsCount: number;
    }> => {
      return withDbLock(async () => {
        const data = await ensureDb();
        const idx = data.teams.findIndex(
          (t) => (where.id && t.id === where.id) || (where.teamCode && t.teamCode === where.teamCode)
        );
        if (idx === -1) throw new Error("Team not found");

        const deletedTeam = { ...data.teams[idx] };
        const teamId = deletedTeam.id;

        // Remove team record
        data.teams.splice(idx, 1);

        // Remove associated team members
        const membersBefore = data.teamMembers.length;
        data.teamMembers = data.teamMembers.filter((m) => m.teamId !== teamId);
        const deletedMembersCount = membersBefore - data.teamMembers.length;

        // Remove associated submissions
        const subsBefore = data.submissions.length;
        data.submissions = data.submissions.filter((s) => s.teamId !== teamId);
        const deletedSubmissionsCount = subsBefore - data.submissions.length;

        // Remove associated judge evaluations
        const evalsBefore = data.judgeEvaluations.length;
        data.judgeEvaluations = data.judgeEvaluations.filter((e) => e.teamId !== teamId);
        const deletedEvaluationsCount = evalsBefore - data.judgeEvaluations.length;

        await saveDb(data);

        return {
          deletedTeam,
          deletedMembersCount,
          deletedSubmissionsCount,
          deletedEvaluationsCount,
        };
      });
    },
  },

  // Problem Tracks
  problemTrack: {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const data = await ensureDb();
      return data.problemTracks.find((t) => t.id === where.id) || null;
    },
    findMany: async () => {
      const data = await ensureDb();
      return data.problemTracks;
    },
    upsert: async ({
      where,
      update,
      create,
    }: {
      where: { id: string };
      update: Partial<ProblemTrackRecord>;
      create: ProblemTrackRecord;
    }) => {
      const data = await ensureDb();
      const idx = data.problemTracks.findIndex((t) => t.id === where.id);
      const now = new Date().toISOString();

      if (idx >= 0) {
        data.problemTracks[idx] = {
          ...data.problemTracks[idx],
          ...update,
          updatedAt: now,
        };
        await saveDb(data);
        return data.problemTracks[idx];
      } else {
        data.problemTracks.push({ ...create, createdAt: now, updatedAt: now });
        await saveDb(data);
        return create;
      }
    },
    update: async ({ where, data: updates }: { where: { id: string }; data: Partial<ProblemTrackRecord> }) => {
      const data = await ensureDb();
      const idx = data.problemTracks.findIndex((t) => t.id === where.id);
      if (idx === -1) throw new Error("Track not found");
      data.problemTracks[idx] = {
        ...data.problemTracks[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await saveDb(data);
      return data.problemTracks[idx];
    },
  },

  // Submissions
  submission: {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const data = await ensureDb();
      return data.submissions.find((s) => s.id === where.id) || null;
    },
    findMany: async (filter?: {
      where?: { teamId?: string; status?: string; similarityFlag?: boolean; isLivePatch?: boolean; attemptNumber?: number };
      orderBy?: { submittedAt?: "asc" | "desc" };
    }) => {
      const data = await ensureDb();
      let res = data.submissions;
      if (filter?.where) {
        const targetTeamId = filter.where.teamId;
        const matchingTeam = targetTeamId
          ? data.teams.find((t) => t.id === targetTeamId || t.teamCode?.toUpperCase() === targetTeamId.toUpperCase())
          : null;
        const validTeamIds = new Set<string>();
        if (targetTeamId) {
          validTeamIds.add(targetTeamId);
          validTeamIds.add(targetTeamId.toUpperCase());
        }
        if (matchingTeam) {
          if (matchingTeam.id) {
            validTeamIds.add(matchingTeam.id);
          }
          if (matchingTeam.teamCode) {
            validTeamIds.add(matchingTeam.teamCode);
            validTeamIds.add(matchingTeam.teamCode.toUpperCase());
          }
        }

        res = res.filter((s) => {
          if (!s || typeof s !== "object") return false;
          if (targetTeamId) {
            const sTeamId = s.teamId || "";
            if (!validTeamIds.has(sTeamId) && !validTeamIds.has(sTeamId.toUpperCase())) return false;
          }
          if (filter.where!.status && s.status !== filter.where!.status) return false;
          if (filter.where!.similarityFlag !== undefined && s.similarityFlag !== filter.where!.similarityFlag) return false;
          if (filter.where!.isLivePatch !== undefined && s.isLivePatch !== filter.where!.isLivePatch) return false;
          if (filter.where!.attemptNumber !== undefined && s.attemptNumber !== filter.where!.attemptNumber) return false;
          return true;
        });
      }
      if (filter?.orderBy?.submittedAt) {
        res.sort((a, b) => {
          const tA = new Date(a.submittedAt).getTime();
          const tB = new Date(b.submittedAt).getTime();
          return filter.orderBy!.submittedAt === "desc" ? tB - tA : tA - tB;
        });
      }
      return res;
    },
    create: async ({
      data: subData,
    }: {
      data: Omit<SubmissionRecord, "id" | "submittedAt"> & { id?: string };
    }) => {
      return withDbLock(async () => {
        const data = await ensureDb();
        const sub: SubmissionRecord = {
          id: subData.id || crypto.randomUUID(),
          teamId: subData.teamId,
          attemptNumber: subData.attemptNumber,
          filename: subData.filename,
          codeContent: subData.codeContent,
          approachNotes: subData.approachNotes || null,
          whatChangedNotes: subData.whatChangedNotes || null,
          isLivePatch: subData.isLivePatch || false,
          status: subData.status || "SCORED",
          runtimeMs: subData.runtimeMs || 0,
          solutionQuality: subData.solutionQuality || 0,
          efficiencyScore: subData.efficiencyScore || 0,
          designQuality: subData.designQuality || 0,
          consistencyScore: subData.consistencyScore || 0,
          autoScore: subData.autoScore || 0,
          isAiAssisted: subData.isAiAssisted ?? true,
          aiExplanation: subData.aiExplanation || null,
          executionLogs: subData.executionLogs || null,
          similarityScore: subData.similarityScore || 0,
          similarityFlag: subData.similarityFlag || false,
          ipAddress: subData.ipAddress || null,
          submittedAt: new Date().toISOString(),

          // Hack2Skill Extended Submission & AI Evaluation Fields
          trackId: subData.trackId || null,
          problemTitle: subData.problemTitle || null,
          problemDescription: subData.problemDescription || null,
          githubUrl: subData.githubUrl || null,
          deployedUrl: subData.deployedUrl || null,
          mediaUrl: subData.mediaUrl || null,
          notebookContent: subData.notebookContent || null,
          codeQualityScore: subData.codeQualityScore ?? null,
          securityScore: subData.securityScore ?? null,
          efficiencyMetricScore: subData.efficiencyMetricScore ?? null,
          testingScore: subData.testingScore ?? null,
          accessibilityScore: subData.accessibilityScore ?? null,
          domainTrackScore: subData.domainTrackScore ?? null,
          problemAlignmentScore: subData.problemAlignmentScore ?? null,
          aiInsights: subData.aiInsights || [],
          metricsBreakdown: subData.metricsBreakdown || null,
          repoStats: subData.repoStats || null,
        };
        data.submissions.push(sub);
        await saveDb(data);

        // Atomic row-level insert to optiforge_submissions in Postgres
        const sql = getPostgresClient();
        if (sql) {
          try {
            await sql`
              INSERT INTO optiforge_submissions (id, team_id, data, created_at)
              VALUES (${sub.id}, ${sub.teamId}, ${JSON.stringify(sub)}, NOW())
              ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;
            `;
          } catch (err) {
            console.warn("[OptiForge DB] Postgres granular submission insert error:", err);
          }
        }

        return sub;
      });
    },
    update: async ({ where, data: updates }: { where: { id: string }; data: Partial<SubmissionRecord> }) => {
      const data = await ensureDb();
      const idx = data.submissions.findIndex((s) => s.id === where.id);
      if (idx === -1) throw new Error("Submission not found");
      data.submissions[idx] = {
        ...data.submissions[idx],
        ...updates,
      };
      await saveDb(data);
      return data.submissions[idx];
    },
    upsert: async ({
      where,
      update,
      create,
    }: {
      where: { id: string };
      update: Partial<SubmissionRecord>;
      create: any;
    }) => {
      const data = await ensureDb();
      const idx = data.submissions.findIndex((s) => s.id === where.id);
      if (idx >= 0) {
        data.submissions[idx] = { ...data.submissions[idx], ...update };
        await saveDb(data);
        return data.submissions[idx];
      } else {
        return db.submission.create({ data: create });
      }
    },
  },

  // Judge Evaluations
  judgeEvaluation: {
    findMany: async (filter?: { where?: { judgeId?: string; teamId?: string; submissionId?: string } }) => {
      const data = await ensureDb();
      let res = data.judgeEvaluations;
      if (filter?.where) {
        res = res.filter((e) => {
          if (filter.where!.judgeId && e.judgeId !== filter.where!.judgeId) return false;
          if (filter.where!.teamId && e.teamId !== filter.where!.teamId) return false;
          if (filter.where!.submissionId && e.submissionId !== filter.where!.submissionId) return false;
          return true;
        });
      }
      return res;
    },
    upsert: async ({
      where,
      update,
      create,
    }: {
      where: { judgeId_submissionId?: { judgeId: string; submissionId: string } };
      update: Partial<JudgeEvaluationRecord>;
      create: Omit<JudgeEvaluationRecord, "id" | "createdAt" | "updatedAt">;
    }) => {
      const data = await ensureDb();
      const judgeId = where.judgeId_submissionId?.judgeId || create.judgeId;
      const submissionId = where.judgeId_submissionId?.submissionId || create.submissionId;

      const idx = data.judgeEvaluations.findIndex((e) => e.judgeId === judgeId && e.submissionId === submissionId);
      const now = new Date().toISOString();

      if (idx >= 0) {
        data.judgeEvaluations[idx] = {
          ...data.judgeEvaluations[idx],
          ...update,
          updatedAt: now,
        };
        await saveDb(data);
        return data.judgeEvaluations[idx];
      } else {
        const evalRecord: JudgeEvaluationRecord = {
          id: crypto.randomUUID(),
          judgeId,
          submissionId,
          teamId: create.teamId,
          codeQuality: create.codeQuality,
          algorithmicReasoning: create.algorithmicReasoning,
          resultInterpretation: create.resultInterpretation,
          innovation: create.innovation,
          totalJudgeScore: create.totalJudgeScore,
          notes: create.notes || null,
          createdAt: now,
          updatedAt: now,
        };
        data.judgeEvaluations.push(evalRecord);
        await saveDb(data);
        return evalRecord;
      }
    },
  },

  // Announcements
  announcement: {
    findMany: async (filter?: { where?: { isActive?: boolean } }) => {
      const data = await ensureDb();
      let res = data.announcements;
      if (filter?.where?.isActive !== undefined) {
        res = res.filter((a) => a.isActive === filter.where!.isActive);
      }
      return res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    create: async ({ data: annData }: { data: Omit<AnnouncementRecord, "id" | "createdAt"> }) => {
      const data = await ensureDb();
      const ann: AnnouncementRecord = {
        id: crypto.randomUUID(),
        ...annData,
        createdAt: new Date().toISOString(),
      };
      data.announcements.unshift(ann);
      await saveDb(data);
      return ann;
    },
    upsert: async ({
      where,
      update,
      create,
    }: {
      where: { id: string };
      update: Partial<AnnouncementRecord>;
      create: any;
    }) => {
      const data = await ensureDb();
      const idx = data.announcements.findIndex((a) => a.id === where.id);
      if (idx >= 0) {
        data.announcements[idx] = { ...data.announcements[idx], ...update };
        await saveDb(data);
        return data.announcements[idx];
      } else {
        data.announcements.push({ id: create.id, ...create, createdAt: new Date().toISOString() });
        await saveDb(data);
        return create;
      }
    },
  },

  // System Settings
  systemSetting: {
    get: async (key: string, defaultValue = ""): Promise<string> => {
      const data = await ensureDb();
      const s = data.systemSettings.find((item) => item.key === key);
      return s ? s.value : defaultValue;
    },
    set: async (key: string, value: string, description?: string) => {
      const data = await ensureDb();
      const idx = data.systemSettings.findIndex((item) => item.key === key);
      const now = new Date().toISOString();
      if (idx >= 0) {
        data.systemSettings[idx].value = value;
        data.systemSettings[idx].updatedAt = now;
        if (description) data.systemSettings[idx].description = description;
      } else {
        data.systemSettings.push({ key, value, description: description || null, updatedAt: now });
      }
      await saveDb(data);
    },
    findMany: async () => {
      const data = await ensureDb();
      return data.systemSettings;
    },
    upsert: async ({
      where,
      update,
      create,
    }: {
      where: { key: string };
      update: Partial<SystemSettingRecord>;
      create: SystemSettingRecord;
    }) => {
      const data = await ensureDb();
      const idx = data.systemSettings.findIndex((item) => item.key === where.key);
      const now = new Date().toISOString();
      if (idx >= 0) {
        data.systemSettings[idx] = { ...data.systemSettings[idx], ...update, updatedAt: now };
      } else {
        data.systemSettings.push({ ...create, updatedAt: now });
      }
      await saveDb(data);
    },
  },

  // Audit Logs
  auditLog: {
    create: async ({
      data: logData,
    }: {
      data: { action: string; performedBy: string; details: string; reason?: string };
    }) => {
      const data = await ensureDb();
      const log: AuditLogRecord = {
        id: crypto.randomUUID(),
        action: logData.action,
        performedBy: logData.performedBy,
        details: logData.details,
        reason: logData.reason || null,
        createdAt: new Date().toISOString(),
      };
      data.auditLogs.unshift(log);
      await saveDb(data);
      return log;
    },
    findMany: async () => {
      const data = await ensureDb();
      return data.auditLogs;
    },
    findManyForTeam: async (teamIdentifier: string) => {
      const data = await ensureDb();
      const cleanIdent = (teamIdentifier || "").trim();
      const team = data.teams.find(
        (t) =>
          t.id === cleanIdent ||
          (t.teamCode && t.teamCode.toUpperCase() === cleanIdent.toUpperCase()) ||
          (t.leaderEmail && t.leaderEmail.toLowerCase() === cleanIdent.toLowerCase())
      );
      const teamCode = team?.teamCode || cleanIdent;
      const teamId = team?.id || cleanIdent;
      const teamName = team?.teamName || "";
      const leaderEmail = team?.leaderEmail || "";

      // 1. Logs explicitly referencing the team in performedBy or details
      const directLogs = (data.auditLogs || []).filter((l) => {
        if (!l) return false;
        const performed = (l.performedBy || "").toUpperCase();
        const details = l.details || "";
        const detailsUpper = details.toUpperCase();

        if (teamCode && (performed === teamCode.toUpperCase() || detailsUpper.includes(teamCode.toUpperCase()))) {
          return true;
        }
        if (teamId && (l.performedBy === teamId || details.includes(teamId))) {
          return true;
        }
        if (leaderEmail && (performed === leaderEmail.toUpperCase() || detailsUpper.includes(leaderEmail.toUpperCase()))) {
          return true;
        }
        if (teamName && details.toLowerCase().includes(teamName.toLowerCase())) {
          return true;
        }
        return false;
      });

      // 2. Synthesize submission evaluation audit logs from team submissions if not already present in directLogs
      const teamSubmissions = (data.submissions || []).filter((s) => {
        if (!s) return false;
        return (
          s.teamId === teamId ||
          (teamCode && s.teamId?.toUpperCase() === teamCode.toUpperCase())
        );
      });

      const synthesizedLogs: AuditLogRecord[] = [];
      for (const sub of teamSubmissions) {
        const attemptLabel = sub.isLivePatch ? "Stage 7 Live Patch" : `Attempt ${sub.attemptNumber}/3`;
        const autoScore = Number(sub.autoScore || 0).toFixed(2);
        const simScore = Number(sub.similarityScore || 0).toFixed(1);

        const alreadyLogged = directLogs.some(
          (l) =>
            l.action?.includes("SUBMISSION") &&
            (l.details?.includes(`Attempt ${sub.attemptNumber}`) || l.details?.includes(sub.id))
        );

        if (!alreadyLogged) {
          synthesizedLogs.push({
            id: `sub-audit-${sub.id}`,
            action: sub.isLivePatch ? "LIVE_PATCH_EVALUATED" : "SUBMISSION_EVALUATED",
            performedBy: teamCode,
            details: `Team ${teamName || teamCode} evaluated: ${attemptLabel}. Auto-Score: ${autoScore}/100. Plagiarism: ${simScore}%. Autonomous AST and security hygiene audited.`,
            reason: `Autonomous AI Evaluation Engine (Score: ${autoScore})`,
            createdAt: sub.submittedAt || new Date().toISOString(),
          });
        }
      }

      // Merge and sort newest first
      const combined = [...directLogs, ...synthesizedLogs];
      return combined.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
  },
};
