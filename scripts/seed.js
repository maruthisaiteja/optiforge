const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "optiforge_db.json");

async function seed() {
  console.log("Seeding OptiForge database...");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const now = new Date().toISOString();

  // 1. Settings
  const systemSettings = [
    { key: "leaderboard_frozen", value: "false", description: "Freeze leaderboard updates", updatedAt: now },
    { key: "leaderboard_visible", value: "true", description: "Public visibility of leaderboard", updatedAt: now },
    { key: "weight_auto", value: "60", description: "Percentage weight of auto-score", updatedAt: now },
    { key: "weight_judge", value: "40", description: "Percentage weight of manual judge score", updatedAt: now },
    { key: "registration_open", value: "true", description: "Allow team registrations", updatedAt: now },
    { key: "event_date", value: "25-09-2026", description: "Official event date", updatedAt: now },
    { key: "event_time", value: "9:00 AM - 4:00 PM", description: "Official event timing", updatedAt: now },
    { key: "organizer_entity", value: "IEEE Vardhaman Student Branch", description: "Organizing student branch", updatedAt: now },
  ];

  // 2. Problem Tracks
  const problemTracks = [
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
      createdAt: now,
      updatedAt: now,
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
      createdAt: now,
      updatedAt: now,
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
      createdAt: now,
      updatedAt: now,
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
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 3. Admin & Judge Users
  const adminPassword = await bcrypt.hash("admin@optiforge2026", 10);
  const judgePassword = await bcrypt.hash("judge@optiforge", 10);
  const teamPassword = await bcrypt.hash("team@optiforge", 10);

  const users = [
    {
      id: crypto.randomUUID(),
      username: "admin",
      password: adminPassword,
      name: "Lead Organizer (IEEE EMBS × CIS)",
      role: "ADMIN",
      assignedDomainId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      username: "judge_ga",
      password: judgePassword,
      name: "Dr. K. Srinivas (GA Expert)",
      role: "JUDGE",
      assignedDomainId: "track-ga",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      username: "judge_pso",
      password: judgePassword,
      name: "Prof. M. Anitha (Swarm Expert)",
      role: "JUDGE",
      assignedDomainId: "track-pso",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      username: "judge_aco",
      password: judgePassword,
      name: "Dr. R. Varma (Routing Expert)",
      role: "JUDGE",
      assignedDomainId: "track-aco",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      username: "judge_fuzzy",
      password: judgePassword,
      name: "Prof. S. Reddy (Fuzzy Systems Expert)",
      role: "JUDGE",
      assignedDomainId: "track-fuzzy",
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 4. Sample Teams & Submissions
  const teamsData = [
    {
      id: "team-id-1021",
      teamCode: "OPT-26-1021",
      teamName: "NeuralForge",
      leaderEmail: "neuralforge@vce.ac.in",
      leaderPhone: "9876543210",
      password: teamPassword,
      domainId: "track-ga",
      skillLevel: "Advanced",
      paymentStatus: "CONFIRMED",
      paymentAmount: 150,
      attemptsUsed: 2,
      bestScore: 92.4,
      isDisqualified: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "team-id-2044",
      teamCode: "OPT-26-2044",
      teamName: "SwarmDynasty",
      leaderEmail: "swarmdynasty@vce.ac.in",
      leaderPhone: "9845123456",
      password: teamPassword,
      domainId: "track-pso",
      skillLevel: "Advanced",
      paymentStatus: "CONFIRMED",
      paymentAmount: 200,
      attemptsUsed: 3,
      bestScore: 96.8,
      isDisqualified: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "team-id-3088",
      teamCode: "OPT-26-3088",
      teamName: "AntPathFinders",
      leaderEmail: "antpaths@vce.ac.in",
      leaderPhone: "9701234567",
      password: teamPassword,
      domainId: "track-aco",
      skillLevel: "Intermediate",
      paymentStatus: "CONFIRMED",
      paymentAmount: 100,
      attemptsUsed: 1,
      bestScore: 88.5,
      isDisqualified: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "team-id-4109",
      teamCode: "OPT-26-4109",
      teamName: "FuzzyLogicMasters",
      leaderEmail: "fuzzylogic@vce.ac.in",
      leaderPhone: "9988776655",
      password: teamPassword,
      domainId: "track-fuzzy",
      skillLevel: "Advanced",
      paymentStatus: "CONFIRMED",
      paymentAmount: 150,
      attemptsUsed: 2,
      bestScore: 94.2,
      isDisqualified: false,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const teamMembers = [
    { id: crypto.randomUUID(), teamId: "team-id-1021", name: "Aditya Kumar", rollNumber: "22011A0501", branch: "CSE", year: "3rd Year", email: "aditya@vce.ac.in", phone: "9876543210", tshirtSize: "L", createdAt: now },
    { id: crypto.randomUUID(), teamId: "team-id-1021", name: "Pooja Sharma", rollNumber: "22011A0502", branch: "CSE", year: "3rd Year", email: "pooja@vce.ac.in", phone: "9876543211", tshirtSize: "M", createdAt: now },
    { id: crypto.randomUUID(), teamId: "team-id-1021", name: "Rahul Varma", rollNumber: "22011A0503", branch: "IT", year: "3rd Year", email: "rahul@vce.ac.in", phone: "9876543212", tshirtSize: "XL", createdAt: now },
    
    { id: crypto.randomUUID(), teamId: "team-id-2044", name: "Kavya Reddy", rollNumber: "21011A1201", branch: "IT", year: "4th Year", email: "kavya@vce.ac.in", phone: "9845123456", tshirtSize: "S", createdAt: now },
    { id: crypto.randomUUID(), teamId: "team-id-2044", name: "Naveen Sai", rollNumber: "21011A1202", branch: "IT", year: "4th Year", email: "naveen@vce.ac.in", phone: "9845123457", tshirtSize: "M", createdAt: now },
    { id: crypto.randomUUID(), teamId: "team-id-2044", name: "Bhavana Rao", rollNumber: "21011A1203", branch: "CSE", year: "4th Year", email: "bhavana@vce.ac.in", phone: "9845123458", tshirtSize: "M", createdAt: now },
    { id: crypto.randomUUID(), teamId: "team-id-2044", name: "Siddharth J.", rollNumber: "21011A1204", branch: "ECE", year: "4th Year", email: "sid@vce.ac.in", phone: "9845123459", tshirtSize: "L", createdAt: now },

    { id: crypto.randomUUID(), teamId: "team-id-3088", name: "Rohit Nair", rollNumber: "23011A0510", branch: "CSE", year: "2nd Year", email: "rohit@vce.ac.in", phone: "9701234567", tshirtSize: "L", createdAt: now },
    { id: crypto.randomUUID(), teamId: "team-id-3088", name: "Sanya Gupta", rollNumber: "23011A0511", branch: "AI&ML", year: "2nd Year", email: "sanya@vce.ac.in", phone: "9701234568", tshirtSize: "M", createdAt: now },

    { id: crypto.randomUUID(), teamId: "team-id-4109", name: "Manish Joshi", rollNumber: "22011A0415", branch: "ECE", year: "3rd Year", email: "manish@vce.ac.in", phone: "9988776655", tshirtSize: "XL", createdAt: now },
    { id: crypto.randomUUID(), teamId: "team-id-4109", name: "Sneha Patel", rollNumber: "22011A0416", branch: "ECE", year: "3rd Year", email: "sneha@vce.ac.in", phone: "9988776656", tshirtSize: "S", createdAt: now },
    { id: crypto.randomUUID(), teamId: "team-id-4109", name: "Tejaswini K.", rollNumber: "22011A0417", branch: "EEE", year: "3rd Year", email: "teja@vce.ac.in", phone: "9988776657", tshirtSize: "M", createdAt: now },
  ];

  const submissions = [
    {
      id: "sub-1021-1",
      teamId: "team-id-1021",
      attemptNumber: 1,
      filename: "ga_attempt1.py",
      codeContent: `# NeuralForge - GA Attempt 1\n# Roulette wheel selection with two-point crossover\nimport random\ndef solve():\n    return 88.5\nbest_solution = [1, 0, 1, 1, 0]\nbest_fitness = 88.5\n`,
      approachNotes: "Initial exploration using two-point crossover and roulette wheel selection with population 50.",
      status: "SCORED",
      runtimeMs: 182.4,
      solutionQuality: 88.5,
      efficiencyScore: 94.0,
      designQuality: 88.0,
      consistencyScore: 85.0,
      autoScore: 89.2,
      isAiAssisted: true,
      aiExplanation: "Strong genetic diversity preservation. Solid elitism retention across generations.",
      executionLogs: "Execution time: 182.4 ms\nAST verification: PASSED\nKnapsack constraint checks: SATISFIED\nFitness optimum convergence: 88.5",
      similarityScore: 12.0,
      similarityFlag: false,
      submittedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: "sub-1021-2",
      teamId: "team-id-1021",
      attemptNumber: 2,
      filename: "ga_attempt2_optimized.py",
      codeContent: `# NeuralForge - GA Attempt 2\n# Added tournament selection and adaptive mutation rate\nimport random\ndef solve():\n    return 94.0\nbest_solution = [1, 1, 1, 1, 0]\nbest_fitness = 94.0\n`,
      approachNotes: "Improved with tournament selection (k=3) and adaptive 1/L mutation rate.",
      status: "SCORED",
      runtimeMs: 165.2,
      solutionQuality: 93.5,
      efficiencyScore: 96.0,
      designQuality: 92.0,
      consistencyScore: 95.0,
      autoScore: 92.4,
      isAiAssisted: true,
      aiExplanation: "Adaptive mutation effectively prevented stagnation. Fast convergence to global basin.",
      executionLogs: "Execution time: 165.2 ms\nAST verification: PASSED\nKnapsack constraint checks: SATISFIED\nFitness optimum convergence: 94.0",
      similarityScore: 15.0,
      similarityFlag: false,
      submittedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: "sub-2044-3",
      teamId: "team-id-2044",
      attemptNumber: 3,
      filename: "pso_dynamic_damping.py",
      codeContent: `# SwarmDynasty - PSO Final Attempt\n# Inertia damping w=0.729, c1=1.49, c2=1.49\nimport random\nimport math\ndef optimize():\n    return [0.001, -0.002]\nbest_solution = [0.001, -0.002]\nbest_fitness = 0.0003\n`,
      approachNotes: "Tuned cognitive vs social factors with velocity clamping to prevent swarm explosion.",
      status: "SCORED",
      runtimeMs: 125.0,
      solutionQuality: 97.5,
      efficiencyScore: 98.0,
      designQuality: 95.0,
      consistencyScore: 96.0,
      autoScore: 96.8,
      isAiAssisted: true,
      aiExplanation: "Exceptional continuous landscape convergence. Excellent velocity clamping.",
      executionLogs: "Execution time: 125.0 ms\nAST verification: PASSED\nRastrigin test: CONVERGED to 0.0003",
      similarityScore: 8.5,
      similarityFlag: false,
      submittedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ];

  const announcements = [
    {
      id: "ann-1",
      title: "OptiForge 2026 is Officially Live!",
      message: "Welcome participants! You can now view your assigned problem track and download starter templates. Each team has 3 live-scored submission attempts.",
      type: "INFO",
      isActive: true,
      createdAt: now,
    },
  ];

  const dbData = {
    users,
    teams: teamsData,
    teamMembers,
    problemTracks,
    submissions,
    judgeEvaluations: [],
    announcements,
    systemSettings,
    auditLogs: [
      {
        id: crypto.randomUUID(),
        action: "DATABASE_INITIALIZED",
        performedBy: "system",
        details: "OptiForge 2026 seeded with 4 problem tracks and test teams",
        reason: "Initial deployment setup",
        createdAt: now,
      },
    ],
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), "utf8");
  console.log("Database seeded successfully to:", DB_FILE);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
