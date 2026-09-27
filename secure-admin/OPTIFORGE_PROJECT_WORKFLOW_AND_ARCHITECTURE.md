# OptiForge 2026 - Project Workflow and Architecture

## A. PROJECT OVERVIEW
**Project Purpose:** OptiForge 2026 is a competitive coding and optimization algorithm design hackathon organized by IEEE EMBS × IEEE CIS. It challenges participants to solve advanced biomedical and computational intelligence problems.

**Pages and Routes:**
- `/` - Landing Page
- `/register` - Team Registration
- `/payment` - Payment Processing & Verification
- `/login` - Authentication for Teams, Judges, and Admins
- `/dashboard` - Team Dashboard (Submissions, problem statements)
- `/admin` - Admin Console (Management, score overrides, tournament stage)
- `/judge` - Judge Panel (Review submissions, provide manual scores)
- `/leaderboard` - Global Leaderboard
- `/certificate` - Certificate Generation

**User Types:** 
1. **ADMIN:** Lead organizers with full system control.
2. **JUDGE:** Domain experts assigned to evaluate specific tracks.
3. **TEAM:** Participating hackathon teams consisting of members and a leader.
4. **PUBLIC VISITOR:** Unauthenticated users viewing public pages.

**Core Functionality:**
Team registration, online/offline payment processing, problem track distribution, code submission, automated scoring engine, manual judge evaluation via viva questions, real-time leaderboard, and certificate generation.

---

## B. USER ROLES

### 1. Admin
- **Login Method:** Standard login with username/password via `/login`.
- **Permissions:** Full system access. Can mark payments as paid, disqualify teams, assign domains, override scores, toggle system settings, advance tournament stages, broadcast announcements, trigger manual rescores, reset passwords, and delete teams.
- **Accessible Pages:** `/admin`
- **Readable/Writable Data:** Full read/write access to all database entities.

### 2. Judge
- **Login Method:** Standard login with username/password via `/login`.
- **Permissions:** Evaluate team submissions for their assigned domain using a specific rubric (Code Quality, Algorithmic Reasoning, Result Interpretation, Innovation).
- **Accessible Pages:** `/judge`
- **Readable/Writable Data:** Can read team submissions and profiles for their assigned track. Can write `JudgeEvaluationRecord` entries.

### 3. Team Leader / Member
- **Login Method:** Login using `teamCode` (e.g., OPT-26-XXXX) and password via `/login`.
- **Permissions:** View problem statements, submit code files, view automated execution results and scores, and generate certificates.
- **Accessible Pages:** `/dashboard`, `/payment`, `/certificate`
- **Readable/Writable Data:** Can read their own `TeamRecord`, `TeamMemberRecord`, and assigned `ProblemTrackRecord`. Can write `SubmissionRecord`.

### 4. Public Visitor
- **Login Method:** N/A
- **Permissions:** View public information.
- **Accessible Pages:** `/`, `/register`, `/leaderboard` (if visible).
- **Readable/Writable Data:** Can read active announcements and public leaderboard data. Can write via registration.

---

## C. COMPLETE USER WORKFLOW
1. **Visitor:** Arrives at the landing page.
2. **Registration:** Navigates to `/register` and creates a team, adding member details and preferences.
3. **Team Creation:** System generates a `teamCode` and initial team record.
4. **Payment:** Team leader pays the registration fee (Razorpay or manual UPI).
5. **Confirmation:** Admin marks payment as `CONFIRMED` or system auto-verifies.
6. **Dashboard:** Team logs into `/dashboard` to view their assigned domain.
7. **Submission:** Team uploads their code and notes for automated evaluation.
8. **Evaluation:** Code is auto-scored (efficiency, solution quality, etc.) and recorded.
9. **Judge Review:** Judge conducts viva using auto-generated questions and logs manual score in `/judge`.
10. **Admin Management:** Admin oversees stages, handles disputes, and monitors audit logs.
11. **Results:** Final combined score updates the `/leaderboard` and participants can claim certificates at `/certificate`.

---

## D. SYSTEM ARCHITECTURE
- **Frontend/Framework:** Next.js 14 (App Router) with React 18.
- **Language:** TypeScript.
- **Database:** Custom local JSON file-backed DB (`optiforge_db.json`) with live synchronous replication to Neon Postgres (via `@neondatabase/serverless`).
- **Authentication:** Custom JWT-based session management coupled with `bcryptjs` for password hashing.
- **Styling:** Tailwind CSS, `framer-motion` for animations, `lucide-react` for icons.
- **Deployment:** Vercel (Production environment auto-detected via `IS_VERCEL`).
- **Code Execution:** Code sandbox evaluation (Judge0 CE).
- **Certificates:** Canvas-based dynamic certificate generation (`canvas-confetti` included for UI effects).

---

## E. DATABASE ARCHITECTURE
All data structures are typed via `DatabaseSchema`.

1. **`users` (UserRecord):** System users (Admin/Judge).
   - *Fields:* `id`, `username`, `password` (hashed), `role`, `assignedDomainId`.
2. **`teams` (TeamRecord):** Participant teams.
   - *Fields:* `teamCode`, `password` (hashed), `paymentStatus`, `bestScore`, `finalCombinedScore`, `domainId`.
3. **`teamMembers` (TeamMemberRecord):** Individual participants linked to a team.
   - *Fields:* `name`, `rollNumber`, `email`, `teamId`.
4. **`problemTracks` (ProblemTrackRecord):** Domain statements and constraints.
   - *Fields:* `name`, `technique`, `coreChallenge`, `hardConstraints`, `hiddenShiftAttempt2`.
5. **`submissions` (SubmissionRecord):** Team code uploads.
   - *Fields:* `codeContent`, `status`, `autoScore`, `runtimeMs`, `isLivePatch`.
6. **`judgeEvaluations` (JudgeEvaluationRecord):** Manual scoring by judges.
   - *Fields:* `judgeId`, `submissionId`, `teamId`, `totalJudgeScore`, `notes`.
7. **`announcements` (AnnouncementRecord):** System broadcasts.
   - *Fields:* `title`, `message`, `type`.
8. **`systemSettings` (SystemSettingRecord):** Config flags.
   - *Fields:* `key`, `value` (e.g., active_stage, leaderboard_frozen).
9. **`auditLogs` (AuditLogRecord):** Immutable logs of admin actions.
   - *Fields:* `action`, `performedBy`, `details`, `reason`.

---

## F. SECURITY ARCHITECTURE
- **JWT Session Management:** Stateless sessions using signed JWT tokens stored securely in `optiforge_session` cookies.
- **Password Hashing:** All passwords (users and teams) are hashed using `bcrypt` (10 rounds) before persistence.
- **Role-based Access Control (RBAC):** Strict server-side enforcement using `getServerSession()` in all secure API routes. Client-side auth checks are secondary.
- **Audit Logging:** Every critical action (score override, deletion, password reset, payment confirmation) is recorded in the `auditLogs` table.
- **No Plaintext Secrets:** Documentation and code repository rely on environment variables (`JWT_SECRET`, database URIs).
- **Code Sandbox Isolation:** Submitted code runs in an isolated sandbox environment to prevent RCE (Remote Code Execution) on the host.

---

## G. API / BACKEND ARCHITECTURE
- **`POST /api/admin/actions`:** Admin utility route. Requires ADMIN role. Handles `MARK_PAID`, `OVERRIDE_SCORE`, `DELETE_TEAM`, `RESET_TEAM_PASSWORD`, `RESET_JUDGE_PASSWORD`, etc.
- **`GET /api/admin/overview`:** Retrieves platform statistics for the admin dashboard.
- **`POST /api/registration`:** Handles new team sign-ups. Validates limits and creates team/member records.
- **`POST /api/auth/login`:** Authenticates users and teams, issues JWT cookie.
- **`GET /api/judge`:** Returns the submission queue and assigned tracks for the logged-in judge.
- **`POST /api/judge`:** Submits a manual `JudgeEvaluationRecord`.
- **`GET /api/submissions` / `POST /api/submissions`:** Fetch team submissions or queue a new code evaluation.
- **`POST /api/payment/verify`:** Validates Razorpay signatures and updates team payment status.
- **`GET /api/payment/team-info`:** Retrieves payment status and amount for a team.
- **`GET /api/leaderboard`:** Computes and returns the ranked list of teams (if `leaderboard_visible` is true).
- **`GET /api/certificates`:** Validates team participation and issues certificate metadata.
- **`GET /api/team/profile`:** Returns full profile and track assignment for the authenticated team.

---

## H. DEPLOYMENT ARCHITECTURE
- **Hosting:** Vercel (Production CI/CD linked to Git).
- **Storage:** Ephemeral `/tmp` filesystem for JSON state, continuously synced to Neon Serverless Postgres via SQL.
- **Environment Variables Required:**
  - `DATABASE_URL` or `POSTGRES_URL`: Connection string for Neon DB.
  - `JWT_SECRET`: Used to sign session and registration tokens.
  - Razorpay credentials (if applicable for live payments).
- **Data Initialization:** Handled by `scripts/seed.js` or fallback to `data/optiforge_db.json`.
