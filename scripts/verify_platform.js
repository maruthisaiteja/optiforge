/**
 * OptiForge 2026 - Comprehensive End-to-End Automated Platform Verification
 * Tests the entire event lifecycle:
 * Landing Page -> 6 Problems Visibility -> Registration -> Payment ->
 * Team Profile -> Attempt 1 (Base) -> Attempt 2 (Reflection Check) -> Attempt 3 ->
 * Attempt Limit Check -> Stage 7 Live Patch (Zero AI) -> Judge Viva Review -> Leaderboard Combined Score
 */

const BASE_URL = "http://localhost:3000";

async function runVerification() {
  console.log("=================================================");
  console.log("🚀 STARTING OPTIFORGE 2026 FULL SYSTEM VERIFICATION");
  console.log("=================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Check Public Landing Page
  console.log("--- 1. Testing Landing Page ---");
  const landingRes = await fetch(`${BASE_URL}/`);
  assert(landingRes.status === 200, "Landing page responded with HTTP 200 OK");
  const landingHtml = await landingRes.text();
  assert(landingHtml.includes("OPTI") || landingHtml.includes("FORGE"), "Landing page contains OptiForge branding");
  assert(landingHtml.includes("IEEE Vardhaman Student Branch"), "Landing page contains official IEEE Vardhaman Student Branch branding");
  assert(landingHtml.includes("8-Stage Lifecycle"), "Landing page contains the 8-Stage Lifecycle Stepper");
  assert(landingHtml.includes("Why OptiForge Cannot Simply Be"), "Landing page contains the Anti-Shortcut Integrity Architecture");
  assert(landingHtml.includes("What You Get from OptiForge"), "Landing page contains the 2-Panel Prerequisites section");
  assert(landingHtml.includes("Problem 5 Flagship Showcase"), "Landing page showcases Problem 5 with Swarm Telemetry");

  // 2. Test Public Problems API and Visibility Rules
  console.log("\n--- 2. Testing Public Problems API & Strict Visibility Rules ---");
  const probRes = await fetch(`${BASE_URL}/api/problems`);
  assert(probRes.status === 200, "Public /api/problems responded with HTTP 200");
  const probData = await probRes.json();
  assert(probData.problems && probData.problems.length === 6, "All 6 official problem statements are returned");

  // Verify all 6 problems have expected IDs
  const problemIds = probData.problems.map((p) => p.id);
  assert(problemIds.includes("p1-hospital-scheduling"), "Includes P1: Hospital Staff Scheduling");
  assert(problemIds.includes("p2-drone-delivery"), "Includes P2: Drone Medical Delivery");
  assert(problemIds.includes("p3-emergency-hospital"), "Includes P3: Emergency Hospital Destination Selection");
  assert(problemIds.includes("p4-blood-inventory"), "Includes P4: Hospital Blood Inventory");
  assert(problemIds.includes("p5-search-and-rescue"), "Includes P5: Multi-Robot Search & Rescue");
  assert(problemIds.includes("p6-fuzzy-triage"), "Includes P6: Fuzzy ER Triage");

  // Verify Confidential Backend Fields are STRIPPED from public API
  for (const prob of probData.problems) {
    assert(prob.hiddenShiftAttempt2 === undefined, `Problem ${prob.id} hides confidential hiddenShiftAttempt2`);
    assert(prob.hiddenShiftAttempt3 === undefined, `Problem ${prob.id} hides confidential hiddenShiftAttempt3`);
    assert(prob.livePatchSurprise === undefined, `Problem ${prob.id} hides confidential livePatchSurprise`);
  }

  // 3. Test Team Registration with Single Problem Selection & College Name
  console.log("\n--- 3. Testing Team Registration with Single Problem Selection ---");
  const testTeamName = `ApexOptimization_${Date.now().toString().slice(-4)}`;
  const regPayload = {
    teamName: testTeamName,
    selectedProblem: "p5-search-and-rescue",
    agreedToTerms: true,
    members: [
      {
        name: "Dev Leader",
        collegeName: "Vardhaman College of Engineering",
        rollNumber: "22011A0581",
        branch: "CSE",
        year: "3rd Year",
        email: `devleader_${Date.now()}@vce.ac.in`,
        phone: "9876543210",
      },
      {
        name: "Dev Member 2",
        collegeName: "Vardhaman College of Engineering",
        rollNumber: "22011A0582",
        branch: "IT",
        year: "3rd Year",
        email: `devmember2_${Date.now()}@vce.ac.in`,
        phone: "9876543211",
      },
      {
        name: "Dev Member 3",
        collegeName: "Vardhaman College of Engineering",
        rollNumber: "22011A0583",
        branch: "ECE",
        year: "3rd Year",
        email: `devmember3_${Date.now()}@vce.ac.in`,
        phone: "9876543212",
      },
    ],
  };

  const regRes = await fetch(`${BASE_URL}/api/registration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(regPayload),
  });
  const regData = await regRes.json();
  assert(regRes.status === 200, "Registration API returned HTTP 200");
  assert(regData.success === true, "Registration success flag is true");
  assert(regData.paymentAmount === 150, "Dynamic fee correctly calculated as ₹150 for 3 members (₹50/member)");
  assert(regData.teamCode.startsWith("OPT-26-"), `Generated valid Team ID format: ${regData.teamCode}`);

  const registeredTeamCode = regData.teamCode;
  const registeredPassword = regData.temporaryPassword;

  // 4. Test Payment Verification Flow (12-Digit UTR)
  console.log("\n--- 4. Testing Payment Verification Flow (12-Digit UTR) ---");
  const testUtr = `426189${Date.now().toString().slice(-6)}`;
  const payRes = await fetch(`${BASE_URL}/api/payment/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      teamCode: registeredTeamCode,
      utrNumber: testUtr,
    }),
  });
  const payData = await payRes.json();
  assert(payRes.status === 200, "Payment verification returned HTTP 200");
  assert(payData.success === true, "Payment status flipped to CONFIRMED");
  assert(payData.paymentId === testUtr, `12-digit UTR persisted: ${payData.paymentId}`);

  // Test duplicate UTR rejection
  const dupRes = await fetch(`${BASE_URL}/api/payment/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      teamCode: "OPT-26-1021",
      utrNumber: testUtr,
    }),
  });
  assert(dupRes.status === 400, "Duplicate UTR submission correctly rejected with HTTP 400");

  // 5. Test Team Login & Profile Session
  console.log("\n--- 5. Testing Team Authentication & /api/team/profile ---");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: registeredTeamCode,
      password: registeredPassword,
    }),
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200, "Team login succeeded with HTTP 200");
  assert(loginData.user.role === "TEAM", "User session role is TEAM");

  const teamCookie = loginRes.headers.get("set-cookie");
  assert(!!teamCookie, "Session cookie received in response headers");

  // Fetch team profile
  const profRes = await fetch(`${BASE_URL}/api/team/profile`, {
    headers: { Cookie: teamCookie },
  });
  const profData = await profRes.json();
  assert(profRes.status === 200, "Team profile returned HTTP 200");
  assert(profData.team.teamCode === registeredTeamCode, "Profile matches registered team");
  assert(profData.track && profData.track.id === "p5-search-and-rescue", "Assigned track is Flagship P5");
  assert(profData.tournament && profData.tournament.activeStage !== undefined, "Tournament activeStage returned");

  // 6. Test Multi-Attempt Submission & Mandatory Reflection
  console.log("\n--- 6. Testing Multi-Attempt Submission & Mandatory Reflection ---");

  // Attempt 1: Baseline script (no reflection required)
  const baseCode = `
# Solution for Multi-Robot Search and Rescue (Flagship)
import math
import random

def solve():
    random.seed(42)
    grid_size = 10
    robots = 4
    covered = set()
    for step in range(50):
        for r in range(robots):
            x = (step * 3 + r * 5) % grid_size
            y = (step * 2 + r * 7) % grid_size
            covered.add((x, y))
    coverage = len(covered)
    return round((coverage / 100.0) * 100.0, 2)

best_fitness = solve()
print(f"Computed Coverage Fitness: {best_fitness}")
`;

  const sub1Res = await fetch(`${BASE_URL}/api/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: teamCookie,
    },
    body: JSON.stringify({
      codeContent: baseCode,
      filename: "sar_baseline_attempt1.py",
      approachNotes: "Baseline multi-robot raster sweep coverage",
    }),
  });
  const sub1Data = await sub1Res.json();
  assert(sub1Res.status === 200, "Attempt 1 submission succeeded");
  assert(sub1Data.submission.attemptNumber === 1, "Recorded as Attempt #1");
  assert(sub1Data.submission.autoScore > 0, `Auto-score calculated: ${sub1Data.submission.autoScore}`);
  assert(sub1Data.attemptsRemaining === 2, "2 attempts remaining");

  // Attempt 2 WITHOUT reflection note -> MUST BE REJECTED (400)
  console.log("Checking Attempt 2 reflection enforcement...");
  const sub2FailRes = await fetch(`${BASE_URL}/api/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: teamCookie,
    },
    body: JSON.stringify({
      codeContent: baseCode + "\n# Some small modification",
      filename: "sar_attempt2_missing_notes.py",
      whatChangedNotes: "", // Empty reflection!
    }),
  });
  assert(sub2FailRes.status === 400, "Attempt 2 without reflection note was correctly REJECTED (HTTP 400)");

  // Attempt 2 WITH reflection note -> MUST SUCCEED
  const sub2Res = await fetch(`${BASE_URL}/api/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: teamCookie,
    },
    body: JSON.stringify({
      codeContent: baseCode + "\n# Enhanced PSO swarm velocity clamping\nvelocity_clamp = 2.5",
      filename: "sar_attempt2_valid.py",
      approachNotes: "Refined PSO movement bounds",
      whatChangedNotes: "Adapted to debris collapse shift: increased repulsion weight to 2.5 and clamped velocity.",
    }),
  });
  const sub2Data = await sub2Res.json();
  assert(sub2Res.status === 200, "Attempt 2 with reflection note succeeded");
  assert(sub2Data.submission.attemptNumber === 2, "Recorded as Attempt #2");
  assert(sub2Data.submission.whatChangedNotes.includes("Adapted to debris collapse"), "Reflection note persisted");
  assert(sub2Data.attemptsRemaining === 1, "1 attempt remaining");

  // Attempt 3 WITH reflection note
  const sub3Res = await fetch(`${BASE_URL}/api/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: teamCookie,
    },
    body: JSON.stringify({
      codeContent: baseCode + "\n# Secondary zone probability shift optimization\nprior_boost = 1.8",
      filename: "sar_attempt3_final.py",
      approachNotes: "Final converged swarm heuristic",
      whatChangedNotes: "Shift 2 adaptation: reweighted survivor prior map by 1.8x and dynamically reassigned robot 4.",
    }),
  });
  const sub3Data = await sub3Res.json();
  assert(sub3Res.status === 200, "Attempt 3 succeeded");
  assert(sub3Data.submission.attemptNumber === 3, "Recorded as Attempt #3");
  assert(sub3Data.attemptsRemaining === 0, "0 attempts remaining (Budget exhausted)");

  // Attempt 4 (standard) -> MUST BE REJECTED (3/3 used)
  console.log("Checking standard Attempt 4 lock...");
  const sub4FailRes = await fetch(`${BASE_URL}/api/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: teamCookie,
    },
    body: JSON.stringify({
      codeContent: baseCode,
      filename: "sar_attempt4_blocked.py",
    }),
  });
  assert(sub4FailRes.status === 400, "Attempt 4 standard submission is locked (HTTP 400)");

  // 7. Test Stage 7 Live Patch Round Submission
  console.log("\n--- 7. Testing Stage 7 Live Patch Round Submission ---");
  const livePatchRes = await fetch(`${BASE_URL}/api/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: teamCookie,
    },
    body: JSON.stringify({
      codeContent: baseCode + "\n# STAGE 7 LIVE PATCH: Mesh transmitter failure fallback logic",
      filename: "sar_live_patch.py",
      approachNotes: "Zero AI live patch solving transmitter failure",
      whatChangedNotes: "Rerouted communications through Robot 3 as peer relay mesh node.",
      isLivePatch: true,
    }),
  });
  const livePatchData = await livePatchRes.json();
  assert(livePatchRes.status === 200, "Stage 7 Live Patch submission SUCCEEDED");
  assert(livePatchData.submission.isLivePatch === true, "Submission marked as isLivePatch = true");

  // Duplicate Live Patch Submission -> MUST BE REJECTED (only 1 live patch attempt permitted)
  const dupLivePatchRes = await fetch(`${BASE_URL}/api/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: teamCookie,
    },
    body: JSON.stringify({
      codeContent: baseCode + "\n# Duplicate patch attempt",
      filename: "sar_live_patch_dup.py",
      isLivePatch: true,
    }),
  });
  assert(dupLivePatchRes.status === 400, "Duplicate live patch attempt was correctly REJECTED (HTTP 400)");

  // 8. Test Judge Portal, Viva Q&A, and Rubric Scoring
  console.log("\n--- 8. Testing Judge Portal & Rubric Scoring ---");
  const judgeLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: "judge_p5",
      password: "judge@optiforge",
    }),
  });
  const judgeLoginData = await judgeLoginRes.json();
  assert(judgeLoginRes.status === 200, "Judge p5 login succeeded");

  const judgeCookie = judgeLoginRes.headers.get("set-cookie");
  const judgeQueueRes = await fetch(`${BASE_URL}/api/judge`, {
    headers: { Cookie: judgeCookie },
  });
  const judgeQueueData = await judgeQueueRes.json();
  assert(judgeQueueRes.status === 200, "Judge queue retrieved");
  assert(judgeQueueData.queue && judgeQueueData.queue.length > 0, "Judge queue has assigned teams");

  const targetTeamInQueue = judgeQueueData.queue.find((item) => item.teamCode === registeredTeamCode);
  assert(!!targetTeamInQueue, `Registered team ${registeredTeamCode} present in Judge P5 queue`);
  assert(targetTeamInQueue.vivaQuestions && targetTeamInQueue.vivaQuestions.length >= 3, "Track viva questions provided to judge");
  assert(targetTeamInQueue.submissions && targetTeamInQueue.submissions.length >= 3, "All submissions available for judge inspection");

  // Submit Judge Rubric Evaluation
  const judgeEvalRes = await fetch(`${BASE_URL}/api/judge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: judgeCookie,
    },
    body: JSON.stringify({
      teamId: targetTeamInQueue.teamId,
      submissionId: targetTeamInQueue.finalSubmission.id,
      codeQuality: 22, // /25
      algorithmicReasoning: 32, // /35
      resultInterpretation: 18, // /20
      innovation: 17, // /20
      notes: "Exceptional defense during viva. Clear mathematical rationale for swarm mesh relay.",
    }),
  });
  const judgeEvalData = await judgeEvalRes.json();
  assert(judgeEvalRes.status === 200, "Judge evaluation submitted successfully");
  assert(judgeEvalData.totalJudgeScore === 89, "Total Judge Score correctly calculated (22+32+18+17 = 89)");

  // 9. Test Live Leaderboard Formula (60% Auto + 40% Judge)
  console.log("\n--- 9. Testing Live Leaderboard Scoring Formula ---");
  const lbRes = await fetch(`${BASE_URL}/api/leaderboard`);
  assert(lbRes.status === 200, "Leaderboard responded with HTTP 200");
  const lbData = await lbRes.json();
  const rankedTeams = lbData.entries || lbData.teams || [];
  assert(rankedTeams.length > 0, "Leaderboard returns ranked teams");

  const rankedTeam = rankedTeams.find((t) => t.teamCode === registeredTeamCode);
  assert(!!rankedTeam, "Evaluated team appears on live leaderboard");
  assert(rankedTeam.finalJudgeScore === 89, "Leaderboard shows judge score of 89");

  const expectedCombined = Math.round((0.6 * rankedTeam.bestScore + 0.4 * 89) * 10) / 10;
  assert(
    rankedTeam.finalCombinedScore === expectedCombined,
    `Combined score verified: 0.60×(${rankedTeam.bestScore}) + 0.40×(89) = ${expectedCombined}`
  );

  // 10. Test Admin ADVANCE_STAGE Action
  console.log("\n--- 10. Testing Admin Stage Advancement Controller ---");
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: "admin",
      password: "admin@optiforge2026",
    }),
  });
  assert(adminLoginRes.status === 200, "Admin login succeeded");
  const adminCookie = adminLoginRes.headers.get("set-cookie");

  const stageAdvanceRes = await fetch(`${BASE_URL}/api/admin/actions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      action: "ADVANCE_STAGE",
      payload: {
        stage: "STAGE_7_LIVE_PATCH",
        livePatchMins: 20,
      },
    }),
  });
  const stageAdvanceData = await stageAdvanceRes.json();
  assert(stageAdvanceRes.status === 200, "Admin successfully advanced stage to STAGE_7_LIVE_PATCH");
  assert(stageAdvanceData.stage === "STAGE_7_LIVE_PATCH", "Stage confirmed as STAGE_7_LIVE_PATCH");

  console.log("\n=================================================");
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED PERFECTLY!`);
  console.log("OptiForge 2026 platform meets 100% of specification requirements.");
  console.log("=================================================");
}

runVerification().catch((err) => {
  console.error("\n❌ VERIFICATION TEST FAILED:");
  console.error(err);
  process.exit(1);
});
