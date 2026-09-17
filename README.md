# OptiForge 2026 — Student Algorithm Design Challenge Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-teal?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A premier computational intelligence algorithm competition web platform organized by **IEEE EMBS Student Chapter × IEEE CIS Local Chapter, Vardhaman College of Engineering** under **IEEE Vardhaman Student Branch**.

---

## 🚀 Features

- **High-Impact Public Landing Page**:
  - Interactive HTML5 Canvas Swarm Intelligence particle network.
  - Real-time countdown timer to 25th September 2026, 9:00 AM IST.
  - Interactive showcases for 4 Problem Tracks (GA, PSO, ACO, Fuzzy Logic).
  - Organizer branding and collapsible FAQ accordion.

- **Dynamic Team Registration & Payment**:
  - Multi-member team roster (2 to 4 members) with validation (duplicate email prevention, 10-digit Indian phone validation).
  - Dynamic fee auto-calculation: **₹50 per participant** (₹100 for 2, ₹150 for 3, ₹200 for 4).
  - Verified payee: **"IEEE Vardhaman Student Branch"**.
  - Dual Razorpay Mode: Live/Test Razorpay Gateway + zero-friction Instant Sandbox Verification mode.
  - Generates official Team ID (`OPT-26-XXXX`) and default credentials upon payment confirmation.

- **Live Team Competition Arena**:
  - Full problem statements rendered with rich markdown typography.
  - Downloadable starter Python templates (`starter_ga.py`, `starter_pso.py`, `starter_aco.py`, `starter_fuzzy.py`).
  - Submission deadline countdown timer.
  - Strict 3-attempt ceiling with confirmation safeguard modal.
  - Score Reveal animation counting up (0 $\rightarrow$ Final Score) displaying all 4 sub-scores.
  - Submission history table with code inspection drawer.

- **Hybrid Evaluation Engine**:
  - Subprocess-isolated sandbox benchmark runner testing against held-out datasets.
  - Metrics:
    - **Solution Quality (40%)**: Optimization convergence proximity to known optimum.
    - **Computational Efficiency (25%)**: Wall-clock execution runtime in milliseconds.
    - **Algorithm Design Quality (20%)**: Static AST analysis verifying appropriate CI operators.
    - **Attempt Consistency (15%)**: Progression stability across sequential attempts.
  - Tokenized n-gram code similarity checker flagging plagiarism exceeding an 80% threshold.

- **Live Dynamic Leaderboard**:
  - Spring-physics row re-ordering (`framer-motion`) when ranks update.
  - Domain track filters (All, GA, PSO, ACO, Fuzzy Logic) and search filter.
  - Distinct neon glow highlighting for the viewing team's own row.
  - Admin Freeze mode and Private/Hidden mode.

- **Expert Judge Portal**:
  - Focused evaluation queue displaying actual registered team names.
  - Syntax-highlighted code viewer and team approach notes.
  - 4-metric rubric sliders: Code Quality (25%), Algorithmic Reasoning (35%), Result Interpretation (20%), Innovation (20%).
  - Auto-computes the combined formula: **60% Auto-Score + 40% Average Judge Score**.

- **Admin Command Center**:
  - Team roster with CSV export and financial reconciliation stats.
  - Manual payment mark-as-paid override for offline cash/UPI receipts.
  - Score override tool with mandatory audit reason logging.
  - Freeze/unfreeze and public visibility toggles.
  - Live broadcast alert banner publisher that pushes real-time banners to all team dashboards.
  - Certificate Studio.

- **Official E-Certificate Studio**:
  - High-resolution printable digital certificate under **IEEE Vardhaman Student Branch**.
  - Features participant name, team name, Team ID, domain track, issue date, and unique digital authentication hash.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS, Lucide Icons, Framer Motion
- **Database**: Zero-native-dependency file-backed repository matching Prisma ORM schema with seamless Vercel `/tmp` serverless compatibility.
- **Evaluation Runner**: Python 3.11 with sandboxed AST static analysis & deterministic benchmark test harness.
- **Payment Gateway**: Razorpay Orders API + Webhook signature verification.
- **Animation**: HTML5 Canvas Particle Swarm, Canvas Confetti.

---

## 📦 Getting Started

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd optiforge
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your configuration in `.env`:
```env
DATABASE_URL="file:./optiforge.db"
JWT_SECRET="your_secure_jwt_secret_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

NEXT_PUBLIC_EVENT_NAME="OptiForge 2026"
NEXT_PUBLIC_EVENT_DATE="2026-09-25T09:00:00+05:30"
NEXT_PUBLIC_SUBMISSION_DEADLINE="2026-09-25T16:00:00+05:30"
NEXT_PUBLIC_ORGANIZER_NAME="IEEE Vardhaman Student Branch"
NEXT_PUBLIC_ORGANIZER_SUBTITLE="IEEE EMBS Student Chapter × IEEE CIS Local Chapter, VCE"
NEXT_PUBLIC_FEE_PER_MEMBER="50"

RAZORPAY_KEY_ID="rzp_test_xxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxxxxx"
```

### 3. Seed Initial Data
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deploying to Vercel

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. In Project Settings $\rightarrow$ Environment Variables, configure the variables from `.env.example`:
   - `JWT_SECRET`: A secure random string.
   - `NEXT_PUBLIC_APP_URL`: Your Vercel production URL (e.g. `https://optiforge.vercel.app`).
   - `NEXT_PUBLIC_ORGANIZER_NAME`: `IEEE Vardhaman Student Branch`.
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Your Razorpay production or test keys.
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Your public Razorpay Key ID.
4. Click **Deploy**. Vercel will build and launch your platform.

---

## 🧪 Automated Testing & Verification

Run the comprehensive end-to-end verification script:
```bash
node scripts/verify_platform.js
```

---

## 🔒 Security Best Practices

- **Zero Hardcoded Secrets**: Secrets and keys are strictly loaded from environment variables.
- **Authentication**: JWT tokens stored in `httpOnly`, `SameSite=Lax`, secure cookies.
- **Code Execution Sandbox**: Python runner disallows hazardous modules (`os`, `subprocess`, `socket`, `open`, `exec`, `eval`) via AST static inspection and restricted namespace execution.
- **Plagiarism Detection**: AST token n-gram Jaccard coefficient flagging submissions exceeding an 80% similarity threshold.
- **Rate Limiting & Attempt Caps**: Server-side validation strictly enforces the 3-attempt ceiling.
- **Audit Trails**: All score overrides, payment confirmations, and admin actions require logged reasons.

---

## 👥 Organizers & Credits

- **Organized by**: IEEE EMBS Student Chapter × IEEE CIS Local Chapter
- **Institution**: Vardhaman College of Engineering, Hyderabad
- **Student Branch**: IEEE Vardhaman Student Branch
