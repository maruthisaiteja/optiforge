import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding OptiForge 2026 database...");

  // 1. System Settings
  const settings = [
    { key: "leaderboard_frozen", value: "false", description: "Freeze leaderboard updates" },
    { key: "leaderboard_visible", value: "true", description: "Public visibility of leaderboard" },
    { key: "weight_auto", value: "60", description: "Percentage weight of auto-score" },
    { key: "weight_judge", value: "40", description: "Percentage weight of manual judge score" },
    { key: "registration_open", value: "true", description: "Allow team registrations" },
    { key: "event_date", value: "30-09-2026", description: "Official event date" },
    { key: "event_time", value: "10:00 AM - 4:00 PM", description: "Official event timing" },
    { key: "organizer_entity", value: "IEEE Vardhaman Student Branch", description: "Organizing student branch" },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: s,
      create: s,
    });
  }

  // 2. Problem Tracks
  const tracks = [
    {
      id: "track-ga",
      name: "Genetic Algorithms: Multi-Constraint Combinatorial Optimization",
      shortName: "GA Track",
      technique: "Genetic Algorithms",
      difficulty: "Intermediate",
      description: "Engineer an evolutionary algorithm to solve high-dimensional 0/1 multi-constraint knapsack & scheduling problems under tight convergence constraints.",
      benchmarkType: "KNAPSACK_TSP",
      starterNotebookUrl: "/starter/starter_ga.py",
      statementMarkdown: `### Track 1: Genetic Algorithms (GA) — Combinatorial Optimization

#### 1. Background
Evolutionary computing mimics natural biological selection to search complex combinatorial landscapes. In this challenge, your task is to maximize total fitness while satisfying strict capacity and multi-knapsack resource constraints.

#### 2. Objectives
- Design custom **Chromosome Encoding** (binary or permutation representation).
- Implement robust **Selection Mechanisms** (Roulette Wheel / Tournament Selection with dynamic pressure).
- Implement specialized **Crossover Operators** (Single/Two-point or Uniform Crossover) with high building-block retention.
- Implement **Adaptive Mutation** to avoid premature convergence to local optima.
- Maintain **Elitism** across generations.

#### 3. Scoring Criteria
- **Solution Quality (40%)**: Objective function value achieved on the held-out benchmark.
- **Computational Efficiency (25%)**: Wall-clock runtime and generations required for convergence.
- **Algorithm Design Quality (20%)**: Adherence to GA architectural paradigms verified by static AST & heuristic analysis.
- **Consistency Across Attempts (15%)**: Progressive convergence across your 3 submission attempts.`,
    },
    {
      id: "track-pso",
      name: "Particle Swarm Optimization: Continuous Non-Linear Landscape",
      shortName: "PSO Track",
      technique: "Particle Swarm Optimization",
      difficulty: "Advanced",
      description: "Navigate a rugged, multi-modal continuous benchmark surface (Rastrigin / Ackley) to discover the global minimum using decentralized swarm intelligence.",
      benchmarkType: "RASTRIGIN_ACKLEY",
      starterNotebookUrl: "/starter/starter_pso.py",
      statementMarkdown: `### Track 2: Particle Swarm Optimization (PSO) — Continuous Landscapes

#### 1. Background
Swarm intelligence leverages decentralized collective behavior where particles adjust their trajectories through cognitive memory ($p_{\\text{best}}$) and social attraction ($g_{\\text{best}}$).

#### 2. Objectives
- Formulate particle velocity and position update equations with dynamic inertia weight damping:
  $$v_i(t+1) = w(t) v_i(t) + c_1 r_1 (p_{\\text{best}, i} - x_i(t)) + c_2 r_2 (g_{\\text{best}} - x_i(t))$$
- Implement boundary handling and velocity clamping to prevent particle explosion.
- Test swarm diversity mechanisms to escape sub-optimal local basins in multi-modal terrain.

#### 3. Scoring Criteria
- **Solution Quality (40%)**: Proximity of $g_{\\text{best}}$ to the known global minimum ($0.0$).
- **Efficiency (25%)**: Rapid convergence within the allotted maximum iteration ceiling.
- **Algorithm Design Quality (20%)**: Proper balancing of cognitive vs. social acceleration coefficients.
- **Consistency Across Attempts (15%)**: Optimization stability across sequential submissions.`,
    },
    {
      id: "track-aco",
      name: "Ant Colony Optimization: Dynamic Combinatorial Graph Routing",
      shortName: "ACO Track",
      technique: "Ant Colony Optimization",
      difficulty: "Advanced",
      description: "Optimize shortest closed tour routes in a dense weighted graph through artificial pheromone deposition and evaporation dynamics.",
      benchmarkType: "GRAPH_TSP",
      starterNotebookUrl: "/starter/starter_aco.py",
      statementMarkdown: `### Track 3: Ant Colony Optimization (ACO) — Graph Routing

#### 1. Background
ACO is inspired by the foraging behavior of ant colonies, where individuals deposit pheromone trails that guide subsequent ants toward minimal-cost paths.

#### 2. Objectives
- Implement stochastic transition probability using pheromone concentration $(\\tau)$ and heuristic visibility $(\\eta)$:
  $$P_{ij}^k = \\frac{[\\tau_{ij}]^\\alpha [\\eta_{ij}]^\\beta}{\\sum_{l \\in \\text{allowed}} [\\tau_{il}]^\\alpha [\\eta_{il}]^\\beta}$$
- Design an efficient pheromone evaporation scheme $(1 - \\rho)$ to prevent early stagnation.
- Incorporate Elitist or Max-Min Ant System (MMAS) bounded trail mechanisms.

#### 3. Scoring Criteria
- **Solution Quality (40%)**: Minimal tour length achieved across benchmark graph nodes.
- **Efficiency (25%)**: Low computational complexity and execution time.
- **Algorithm Design Quality (20%)**: Heuristic weighting and evaporation parameter calibration.
- **Consistency Across Attempts (15%)**: Iterative tour improvement across attempts.`,
    },
    {
      id: "track-fuzzy",
      name: "Fuzzy Logic: Non-Linear Dynamic Control & Inference",
      shortName: "Fuzzy Track",
      technique: "Fuzzy Logic Systems",
      difficulty: "Intermediate",
      description: "Design a Mamdani or Sugeno fuzzy inference system with linguistic IF-THEN rules and defuzzification for dynamic plant control.",
      benchmarkType: "DYNAMIC_CONTROL",
      starterNotebookUrl: "/starter/starter_fuzzy.py",
      statementMarkdown: `### Track 4: Fuzzy Logic (FL) — Dynamic Control & Inference

#### 1. Background
Unlike binary boolean logic, fuzzy logic processes approximate reasoning by modeling degrees of truth through continuous membership functions.

#### 2. Objectives
- Construct input and output fuzzy sets (Triangular, Trapezoidal, or Gaussian).
- Formulate an expressive, conflict-free rule base modeling system dynamics.
- Apply Mamdani Min-Max or Sugeno algebraic inference.
- Implement Centroid (Center of Gravity) defuzzification for crisp actuator signals.

#### 3. Scoring Criteria
- **Solution Quality (40%)**: Minimal steady-state error and overshoot in step-response simulation.
- **Efficiency (25%)**: Fast defuzzification computation and clean rule evaluation.
- **Algorithm Design Quality (20%)**: Completeness of fuzzy rule partitions and membership coverage.
- **Consistency Across Attempts (15%)**: Refinement of control curves across attempts.`,
    },
  ];

  for (const track of tracks) {
    await prisma.problemTrack.upsert({
      where: { id: track.id },
      update: track,
      create: track,
    });
  }

  // 3. Admin & Judge Accounts
  const adminPassword = await bcrypt.hash("admin@optiforge2026", 10);
  const judgePassword = await bcrypt.hash("judge@optiforge", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: { password: adminPassword, name: "Lead Organizer (IEEE EMBS × CIS)", role: "ADMIN" },
    create: {
      username: "admin",
      password: adminPassword,
      name: "Lead Organizer (IEEE EMBS × CIS)",
      role: "ADMIN",
    },
  });

  const judges = [
    { username: "judge_ga", name: "Dr. K. Srinivas (GA Expert)", domainId: "track-ga" },
    { username: "judge_pso", name: "Prof. M. Anitha (Swarm Expert)", domainId: "track-pso" },
    { username: "judge_aco", name: "Dr. R. Varma (Routing Expert)", domainId: "track-aco" },
    { username: "judge_fuzzy", name: "Prof. S. Reddy (Fuzzy Systems Expert)", domainId: "track-fuzzy" },
  ];

  for (const j of judges) {
    await prisma.user.upsert({
      where: { username: j.username },
      update: { password: judgePassword, name: j.name, role: "JUDGE", assignedDomainId: j.domainId },
      create: {
        username: j.username,
        password: judgePassword,
        name: j.name,
        role: "JUDGE",
        assignedDomainId: j.domainId,
      },
    });
  }

  // 4. Sample Teams with realistic submissions and scores for immediate live testing
  const teamPassword = await bcrypt.hash("team@optiforge", 10);

  const sampleTeams = [
    {
      teamCode: "OPT-26-1021",
      teamName: "NeuralForge",
      leaderEmail: "neuralforge@vce.ac.in",
      leaderPhone: "9876543210",
      domainId: "track-ga",
      skillLevel: "Advanced",
      paymentStatus: "CONFIRMED",
      paymentAmount: 150,
      attemptsUsed: 2,
      bestScore: 92.4,
      members: [
        { name: "Aditya Kumar", rollNumber: "22011A0501", branch: "CSE", year: "3rd Year", email: "aditya@vce.ac.in", phone: "9876543210" },
        { name: "Pooja Sharma", rollNumber: "22011A0502", branch: "CSE", year: "3rd Year", email: "pooja@vce.ac.in", phone: "9876543211" },
        { name: "Rahul Varma", rollNumber: "22011A0503", branch: "IT", year: "3rd Year", email: "rahul@vce.ac.in", phone: "9876543212" },
      ],
    },
    {
      teamCode: "OPT-26-2044",
      teamName: "SwarmDynasty",
      leaderEmail: "swarmdynasty@vce.ac.in",
      leaderPhone: "9845123456",
      domainId: "track-pso",
      skillLevel: "Advanced",
      paymentStatus: "CONFIRMED",
      paymentAmount: 200,
      attemptsUsed: 3,
      bestScore: 96.8,
      members: [
        { name: "Kavya Reddy", rollNumber: "21011A1201", branch: "IT", year: "4th Year", email: "kavya@vce.ac.in", phone: "9845123456" },
        { name: "Naveen Sai", rollNumber: "21011A1202", branch: "IT", year: "4th Year", email: "naveen@vce.ac.in", phone: "9845123457" },
        { name: "Bhavana Rao", rollNumber: "21011A1203", branch: "CSE", year: "4th Year", email: "bhavana@vce.ac.in", phone: "9845123458" },
        { name: "Siddharth J.", rollNumber: "21011A1204", branch: "ECE", year: "4th Year", email: "sid@vce.ac.in", phone: "9845123459" },
      ],
    },
    {
      teamCode: "OPT-26-3088",
      teamName: "AntPathFinders",
      leaderEmail: "antpaths@vce.ac.in",
      leaderPhone: "9701234567",
      domainId: "track-aco",
      skillLevel: "Intermediate",
      paymentStatus: "CONFIRMED",
      paymentAmount: 100,
      attemptsUsed: 1,
      bestScore: 88.5,
      members: [
        { name: "Rohit Nair", rollNumber: "23011A0510", branch: "CSE", year: "2nd Year", email: "rohit@vce.ac.in", phone: "9701234567" },
        { name: "Sanya Gupta", rollNumber: "23011A0511", branch: "AI&ML", year: "2nd Year", email: "sanya@vce.ac.in", phone: "9701234568" },
      ],
    },
    {
      teamCode: "OPT-26-4109",
      teamName: "FuzzyLogicMasters",
      leaderEmail: "fuzzylogic@vce.ac.in",
      leaderPhone: "9988776655",
      domainId: "track-fuzzy",
      skillLevel: "Advanced",
      paymentStatus: "CONFIRMED",
      paymentAmount: 150,
      attemptsUsed: 2,
      bestScore: 94.2,
      members: [
        { name: "Manish Joshi", rollNumber: "22011A0415", branch: "ECE", year: "3rd Year", email: "manish@vce.ac.in", phone: "9988776655" },
        { name: "Sneha Patel", rollNumber: "22011A0416", branch: "ECE", year: "3rd Year", email: "sneha@vce.ac.in", phone: "9988776656" },
        { name: "Tejaswini K.", rollNumber: "22011A0417", branch: "EEE", year: "3rd Year", email: "teja@vce.ac.in", phone: "9988776657" },
      ],
    },
  ];

  for (const st of sampleTeams) {
    const { members, ...teamData } = st;
    const team = await prisma.team.upsert({
      where: { teamCode: teamData.teamCode },
      update: { ...teamData, password: teamPassword },
      create: {
        ...teamData,
        password: teamPassword,
        members: {
          create: members,
        },
      },
    });

    // Seed realistic submissions
    if (teamData.attemptsUsed > 0) {
      await prisma.submission.upsert({
        where: { id: `sub-${teamData.teamCode}-1` },
        update: {},
        create: {
          id: `sub-${teamData.teamCode}-1`,
          teamId: team.id,
          attemptNumber: 1,
          filename: `attempt_1_${teamData.teamCode.toLowerCase()}.py`,
          codeContent: `# ${teamData.teamName} - Attempt 1\n# Baseline implementation\ndef solve():\n    return 80.0\nbest_solution = [1, 0, 1]\nbest_fitness = 80.0\n`,
          approachNotes: "Baseline implementation exploring standard parameters and initial population convergence.",
          status: "SCORED",
          runtimeMs: 142.5,
          solutionQuality: 82.0,
          efficiencyScore: 92.0,
          designQuality: 85.0,
          consistencyScore: 85.0,
          autoScore: teamData.bestScore,
          isAiAssisted: true,
          aiExplanation: "Clean implementation with solid baseline convergence. Good modular decomposition.",
        },
      });
    }
  }

  // 5. Broadcast Announcement
  await prisma.announcement.upsert({
    where: { id: "announcement-welcome" },
    update: {},
    create: {
      id: "announcement-welcome",
      title: "OptiForge 2026 is Officially Live!",
      message: "Welcome teams! The problem statements and starter templates are now accessible. Remember you have 3 live-scored attempts.",
      type: "INFO",
      isActive: true,
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
