import fs from "fs";
import path from "path";
import crypto from "crypto";

const IS_VERCEL = process.env.VERCEL === "1" || (process.env.NODE_ENV === "production" && process.platform === "linux");
const SEED_FILE = path.join(process.cwd(), "data", "optiforge_db.json");
const DATA_DIR = IS_VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "optiforge_db.json");

export interface UserRecord {
  id: string;
  username: string;
  password: string;
  name: string;
  role: "ADMIN" | "JUDGE" | "TEAM";
  assignedDomainId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberRecord {
  id: string;
  teamId: string;
  name: string;
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
  domainId?: string | null;
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
  technique: string;
  difficulty: string;
  description: string;
  statementMarkdown: string;
  starterNotebookUrl?: string | null;
  benchmarkType: string;
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

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    if (fs.existsSync(SEED_FILE)) {
      try {
        const seedRaw = fs.readFileSync(SEED_FILE, "utf8");
        fs.writeFileSync(DB_FILE, seedRaw, "utf8");
        return JSON.parse(seedRaw) as DatabaseSchema;
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
    return JSON.parse(raw) as DatabaseSchema;
  } catch {
    const fallback: DatabaseSchema = {
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
    fs.writeFileSync(DB_FILE, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
}

function saveDb(data: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tempFile, DB_FILE);
}

export const db = {
  // Users
  user: {
    findUnique: async ({ where }: { where: { username?: string; id?: string } }) => {
      const data = ensureDbFile();
      return data.users.find((u) => (where.username && u.username === where.username) || (where.id && u.id === where.id)) || null;
    },
    findMany: async (filter?: { where?: Partial<UserRecord> }) => {
      const data = ensureDbFile();
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
      const data = ensureDbFile();
      const existingIdx = data.users.findIndex((u) => u.username === where.username);
      const now = new Date().toISOString();

      if (existingIdx >= 0) {
        data.users[existingIdx] = {
          ...data.users[existingIdx],
          ...update,
          updatedAt: now,
        };
        saveDb(data);
        return data.users[existingIdx];
      } else {
        const newUser: UserRecord = {
          id: crypto.randomUUID(),
          ...create,
          createdAt: now,
          updatedAt: now,
        };
        data.users.push(newUser);
        saveDb(data);
        return newUser;
      }
    },
  },

  // Teams
  team: {
    findUnique: async ({ where }: { where: { id?: string; teamCode?: string; leaderEmail?: string } }) => {
      const data = ensureDbFile();
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
      const data = ensureDbFile();
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
      const data = ensureDbFile();
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

      saveDb(data);
      const track = data.problemTracks.find((tr) => tr.id === newTeam.domainId) || null;
      return { ...newTeam, members: createdMembers, track };
    },
    update: async ({ where, data: updates }: { where: { id?: string; teamCode?: string }; data: Partial<TeamRecord> }) => {
      const data = ensureDbFile();
      const idx = data.teams.findIndex(
        (t) => (where.id && t.id === where.id) || (where.teamCode && t.teamCode === where.teamCode)
      );
      if (idx === -1) throw new Error("Team not found");

      data.teams[idx] = {
        ...data.teams[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveDb(data);

      const team = data.teams[idx];
      const members = data.teamMembers.filter((m) => m.teamId === team.id);
      const track = data.problemTracks.find((tr) => tr.id === team.domainId) || null;
      return { ...team, members, track };
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
      const data = ensureDbFile();
      const idx = data.teams.findIndex((t) => t.teamCode === where.teamCode);
      if (idx >= 0) {
        data.teams[idx] = { ...data.teams[idx], ...update, updatedAt: new Date().toISOString() };
        saveDb(data);
        return data.teams[idx];
      } else {
        return db.team.create({ data: create });
      }
    },
  },

  // Problem Tracks
  problemTrack: {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const data = ensureDbFile();
      return data.problemTracks.find((t) => t.id === where.id) || null;
    },
    findMany: async () => {
      const data = ensureDbFile();
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
      const data = ensureDbFile();
      const idx = data.problemTracks.findIndex((t) => t.id === where.id);
      const now = new Date().toISOString();

      if (idx >= 0) {
        data.problemTracks[idx] = {
          ...data.problemTracks[idx],
          ...update,
          updatedAt: now,
        };
        saveDb(data);
        return data.problemTracks[idx];
      } else {
        data.problemTracks.push({ ...create, createdAt: now, updatedAt: now });
        saveDb(data);
        return create;
      }
    },
    update: async ({ where, data: updates }: { where: { id: string }; data: Partial<ProblemTrackRecord> }) => {
      const data = ensureDbFile();
      const idx = data.problemTracks.findIndex((t) => t.id === where.id);
      if (idx === -1) throw new Error("Track not found");
      data.problemTracks[idx] = {
        ...data.problemTracks[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveDb(data);
      return data.problemTracks[idx];
    },
  },

  // Submissions
  submission: {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const data = ensureDbFile();
      return data.submissions.find((s) => s.id === where.id) || null;
    },
    findMany: async (filter?: {
      where?: { teamId?: string; status?: string; similarityFlag?: boolean };
      orderBy?: { submittedAt?: "asc" | "desc" };
    }) => {
      const data = ensureDbFile();
      let res = data.submissions;
      if (filter?.where) {
        res = res.filter((s) => {
          if (filter.where!.teamId && s.teamId !== filter.where!.teamId) return false;
          if (filter.where!.status && s.status !== filter.where!.status) return false;
          if (filter.where!.similarityFlag !== undefined && s.similarityFlag !== filter.where!.similarityFlag) return false;
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
      const data = ensureDbFile();
      const sub: SubmissionRecord = {
        id: subData.id || crypto.randomUUID(),
        teamId: subData.teamId,
        attemptNumber: subData.attemptNumber,
        filename: subData.filename,
        codeContent: subData.codeContent,
        approachNotes: subData.approachNotes || null,
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
      };
      data.submissions.push(sub);
      saveDb(data);
      return sub;
    },
    update: async ({ where, data: updates }: { where: { id: string }; data: Partial<SubmissionRecord> }) => {
      const data = ensureDbFile();
      const idx = data.submissions.findIndex((s) => s.id === where.id);
      if (idx === -1) throw new Error("Submission not found");
      data.submissions[idx] = {
        ...data.submissions[idx],
        ...updates,
      };
      saveDb(data);
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
      const data = ensureDbFile();
      const idx = data.submissions.findIndex((s) => s.id === where.id);
      if (idx >= 0) {
        data.submissions[idx] = { ...data.submissions[idx], ...update };
        saveDb(data);
        return data.submissions[idx];
      } else {
        return db.submission.create({ data: create });
      }
    },
  },

  // Judge Evaluations
  judgeEvaluation: {
    findMany: async (filter?: { where?: { judgeId?: string; teamId?: string; submissionId?: string } }) => {
      const data = ensureDbFile();
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
      const data = ensureDbFile();
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
        saveDb(data);
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
        saveDb(data);
        return evalRecord;
      }
    },
  },

  // Announcements
  announcement: {
    findMany: async (filter?: { where?: { isActive?: boolean } }) => {
      const data = ensureDbFile();
      let res = data.announcements;
      if (filter?.where?.isActive !== undefined) {
        res = res.filter((a) => a.isActive === filter.where!.isActive);
      }
      return res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    create: async ({ data: annData }: { data: Omit<AnnouncementRecord, "id" | "createdAt"> }) => {
      const data = ensureDbFile();
      const ann: AnnouncementRecord = {
        id: crypto.randomUUID(),
        ...annData,
        createdAt: new Date().toISOString(),
      };
      data.announcements.unshift(ann);
      saveDb(data);
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
      const data = ensureDbFile();
      const idx = data.announcements.findIndex((a) => a.id === where.id);
      if (idx >= 0) {
        data.announcements[idx] = { ...data.announcements[idx], ...update };
        saveDb(data);
        return data.announcements[idx];
      } else {
        data.announcements.push({ id: create.id, ...create, createdAt: new Date().toISOString() });
        saveDb(data);
        return create;
      }
    },
  },

  // System Settings
  systemSetting: {
    get: async (key: string, defaultValue = ""): Promise<string> => {
      const data = ensureDbFile();
      const s = data.systemSettings.find((item) => item.key === key);
      return s ? s.value : defaultValue;
    },
    set: async (key: string, value: string, description?: string) => {
      const data = ensureDbFile();
      const idx = data.systemSettings.findIndex((item) => item.key === key);
      const now = new Date().toISOString();
      if (idx >= 0) {
        data.systemSettings[idx].value = value;
        data.systemSettings[idx].updatedAt = now;
        if (description) data.systemSettings[idx].description = description;
      } else {
        data.systemSettings.push({ key, value, description: description || null, updatedAt: now });
      }
      saveDb(data);
    },
    findMany: async () => {
      const data = ensureDbFile();
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
      const data = ensureDbFile();
      const idx = data.systemSettings.findIndex((item) => item.key === where.key);
      const now = new Date().toISOString();
      if (idx >= 0) {
        data.systemSettings[idx] = { ...data.systemSettings[idx], ...update, updatedAt: now };
      } else {
        data.systemSettings.push({ ...create, updatedAt: now });
      }
      saveDb(data);
    },
  },

  // Audit Logs
  auditLog: {
    create: async ({
      data: logData,
    }: {
      data: { action: string; performedBy: string; details: string; reason?: string };
    }) => {
      const data = ensureDbFile();
      const log: AuditLogRecord = {
        id: crypto.randomUUID(),
        action: logData.action,
        performedBy: logData.performedBy,
        details: logData.details,
        reason: logData.reason || null,
        createdAt: new Date().toISOString(),
      };
      data.auditLogs.unshift(log);
      saveDb(data);
      return log;
    },
    findMany: async () => {
      const data = ensureDbFile();
      return data.auditLogs;
    },
  },
};
