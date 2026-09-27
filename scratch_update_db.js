const fs = require('fs');

async function updateDb() {
  const dbData = fs.readFileSync('data/optiforge_db.json', 'utf8');
  const db = JSON.parse(dbData);

  // Set active stage to STAGE_0_PRE_EVENT
  const stageSetting = db.systemSettings.find(s => s.key === 'active_stage');
  if (stageSetting) {
    stageSetting.value = 'STAGE_0_PRE_EVENT';
  }

  // Update Confidential Shifts & Theme names
  const updates = [
    {
      id: "theme-1-biomedical-ai",
      name: "P1: Hospital Staff Scheduling",
      shortName: "P1: Hospital Staff",
      technique: "Genetic Algorithm + Fuzzy Fatigue Model",
      a2: "Staff reduction: Emergency leave removes ~20% of nursing staff in Intensive Care and Emergency.",
      a3: "Demand spike: Pediatric and Critical Care departments declare a 35% increase in minimum shift coverage.",
      lp: "One additional department declares an emergency minimum-staffing requirement, effective immediately."
    },
    {
      id: "theme-2-signals",
      name: "P2: Drone Medical Delivery",
      shortName: "P2: Drone Delivery",
      technique: "Ant Colony Optimization + Genetic Algorithm",
      a2: "Adverse atmospheric conditions: Headwinds increase drone flight energy consumption by 25%.",
      a3: "Request surge: Remote clinic orders double with narrowed 30-minute delivery deadlines.",
      lp: "One drone in the fleet suffers mechanical failure and is grounded — all its assigned deliveries must be re-routed live."
    },
    {
      id: "theme-3-imaging",
      name: "P3: Hospital Destination Selection",
      shortName: "P3: Hospital Destination",
      technique: "Fuzzy Logic + Particle Swarm Optimization",
      a2: "Sudden regional incident: The nearest Tier-1 trauma center experiences extreme ER queue congestion.",
      a3: "Specialist unavailability: On-call neurosurgeon and cardiac catheterization teams become unavailable at two candidate centers.",
      lp: "The current top-ranked hospital destination just went to 100% full ICU capacity."
    },
    {
      id: "theme-4-ml-ai",
      name: "P4: Blood Inventory Allocation",
      shortName: "P4: Blood Allocation",
      technique: "Genetic Algorithm / Particle Swarm Optimization",
      a2: "Multiple emergency trauma arrivals trigger sudden surge in O-negative and B-positive demand.",
      a3: "Supply chain disruption: Blood bank delivery van delayed by 48 hours.",
      lp: "A critical blood-group shortage is declared for O-negative with an incoming mass-casualty transport."
    },
    {
      id: "theme-5-autonomous",
      name: "P5: Multi-Robot Search & Rescue",
      shortName: "P5: Search & Rescue",
      technique: "PSO / ACO / Multi-Agent Genetic Algorithm",
      a2: "Debris collapse: 3 new obstacle zones spawn dynamically, cutting off direct corridors.",
      a3: "Secondary search zone: High survivor probability shifts unexpectedly to previously low-prior sector.",
      lp: "One robot experiences communication transmitter failure — swarm coordination logic must adapt with remaining mesh nodes."
    },
    {
      id: "theme-6-open-innovation",
      name: "P6: Fuzzy ER Triage",
      shortName: "P6: Fuzzy ER Triage",
      technique: "Fuzzy Logic + Genetic Algorithm",
      a2: "Sensor noise injection: Vital readings have random Gaussian noise and 15% missing telemetry.",
      a3: "Conflicting vitals: A set of high-risk edge cases present with normal blood pressure but critical hypoxia.",
      lp: "A patient presents with a rare combination of vitals that contradicts two rules simultaneously."
    }
  ];

  for (const update of updates) {
    const track = db.problemTracks.find(t => t.id === update.id);
    if (track) {
      track.name = update.name;
      track.shortName = update.shortName;
      track.technique = update.technique;
      track.hiddenShiftAttempt2 = update.a2;
      track.hiddenShiftAttempt3 = update.a3;
      track.livePatchSurprise = update.lp;

      // also update statementMarkdown
      track.statementMarkdown = `### ${update.name}\n\n**Technique:** ${update.technique}\n\n#### Context\n*Problem details to be announced during the event.*`;
    }
  }

  fs.writeFileSync('data/optiforge_db.json', JSON.stringify(db, null, 2), 'utf8');
  console.log('Database updated with new statements and PRE_EVENT stage.');
}

updateDb();
