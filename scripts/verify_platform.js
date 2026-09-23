const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

async function verify() {
  console.log("=== RUNNING OPTIFORGE 2026 PLATFORM AUDIT ===");

  const dbPath = path.join(__dirname, "..", "data", "optiforge_db.json");
  if (!fs.existsSync(dbPath)) {
    throw new Error(`FAIL: Database file ${dbPath} does not exist!`);
  }

  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  // 1. Verify OPT-26-1904
  const team1904 = db.teams.find((t) => t.teamCode === "OPT-26-1904");
  if (!team1904) {
    throw new Error("FAIL: OPT-26-1904 not found in database!");
  }
  const members1904 = db.teamMembers.filter((m) => m.teamId === team1904.id);

  console.log("✔ OPT-26-1904 found:", team1904.teamName);
  console.log("  - Payment Status:", team1904.paymentStatus);
  console.log("  - Payment Amount: ₹" + team1904.paymentAmount);
  console.log("  - UTR (Payment ID):", team1904.razorpayPaymentId);
  console.log("  - Member Count:", members1904.length);

  if (team1904.paymentStatus !== "CONFIRMED") {
    throw new Error("FAIL: OPT-26-1904 paymentStatus is not CONFIRMED!");
  }
  if (team1904.razorpayPaymentId !== "512165830063") {
    throw new Error("FAIL: OPT-26-1904 UTR is not 512165830063!");
  }

  // 2. Check Password Authentication
  const passMatch = await bcrypt.compare("Forge#1904", team1904.password);
  if (!passMatch) {
    throw new Error("FAIL: Password Forge#1904 failed bcrypt match!");
  }
  console.log("✔ Password Forge#1904 bcrypt validation: PASSED");

  // 2b. Verify OPT-26-7151 (Pending registration team)
  const team7151 = db.teams.find((t) => t.teamCode === "OPT-26-7151");
  if (!team7151) throw new Error("FAIL: OPT-26-7151 not found in database!");
  if (team7151.paymentStatus !== "PENDING_PAYMENT") {
    throw new Error("FAIL: OPT-26-7151 should be in PENDING_PAYMENT status!");
  }
  const passMatch7151 = await bcrypt.compare("Forge#7151", team7151.password);
  if (!passMatch7151) throw new Error("FAIL: Password Forge#7151 failed bcrypt match!");
  console.log("✔ OPT-26-7151 verified in PENDING_PAYMENT mode with bcrypt validation: PASSED");

  // 2c. Verify OPT-26-1112 (Pending registration team from live test)
  const team1112 = db.teams.find((t) => t.teamCode === "OPT-26-1112");
  if (!team1112) throw new Error("FAIL: OPT-26-1112 not found in database!");
  if (team1112.paymentStatus !== "PENDING_PAYMENT") {
    throw new Error("FAIL: OPT-26-1112 should be in PENDING_PAYMENT status!");
  }
  const passMatch1112 = await bcrypt.compare("Forge#1112", team1112.password);
  if (!passMatch1112) throw new Error("FAIL: Password Forge#1112 failed bcrypt match!");
  console.log("✔ OPT-26-1112 verified in PENDING_PAYMENT mode with bcrypt validation: PASSED");

  // 3. Verify ALL dummy teams are removed
  const dummyNames = ["NeuralForge", "SwarmDynasty", "PathFinders", "BioLogic", "FuzzyLogicMasters", "AeroFleet"];
  for (const t of db.teams) {
    if (dummyNames.includes(t.teamName)) {
      throw new Error(`FAIL: Dummy team ${t.teamName} still found in database!`);
    }
  }
  console.log(`✔ Verified no dummy teams in database. Total registered teams: ${db.teams.length}`);

  // 4. Verify no dummy submissions
  if (db.submissions.length > 0) {
    throw new Error(`FAIL: Found ${db.submissions.length} submissions in database! Submissions must be 0 before event.`);
  }
  console.log("✔ Zero dummy submissions in database: PASSED");

  // 5. Verify 6 Innovation Themes
  if (db.problemTracks.length !== 6) {
    throw new Error(`FAIL: Expected 6 innovation themes, found ${db.problemTracks.length}`);
  }
  console.log(`✔ All 6 Innovation Themes verified:`);
  db.problemTracks.forEach((tr, i) => {
    console.log(`   ${i + 1}. [${tr.id}] ${tr.shortName}`);
  });

  // 6. Verify Admin and 6 Judges
  const adminUser = db.users.find(u => u.role === "ADMIN");
  const judgeUsers = db.users.filter(u => u.role === "JUDGE");
  if (!adminUser) throw new Error("FAIL: Admin user not found!");
  if (judgeUsers.length !== 6) throw new Error(`FAIL: Expected 6 judges, found ${judgeUsers.length}`);
  console.log(`✔ Admin (${adminUser.username}) and ${judgeUsers.length} Expert Judges verified: PASSED`);

  console.log("\n=== ALL AUDIT CHECKS PASSED PERFECTLY ===");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
