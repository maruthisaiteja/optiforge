import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || (session.role !== "JUDGE" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized: Judge login required." }, { status: 401 });
    }

    const assignedTrack = session.domainId;
    const allTeams = await db.team.findMany({
      where: assignedTrack ? { domainId: assignedTrack } : undefined,
    });

    const evaluations = await db.judgeEvaluation.findMany({
      where: session.role === "JUDGE" ? { judgeId: session.id } : undefined,
    });

const VIVA_QUESTIONS: Record<string, string[]> = {
  "theme-1-biomedical-ai": [
    "How does your predictive clinical model handle highly imbalanced patient outcome distributions?",
    "What loss function and regularization constraints ensure medical interpretability for healthcare practitioners?",
    "How does your algorithm adapt when critical patient physiological telemetry contains missing sensor values?",
    "How do you mathematically guard against demographic or hospital-specific bias in your model predictions?",
  ],
  "theme-2-signals": [
    "Explain how your wavelet or filter bank isolates subtle ECG arrhythmic beats from baseline wander.",
    "How does your fuzzy classifier handle overlapping boundaries between benign and pathological signal morphologies?",
    "What is your mathematical threshold for triggering high-priority physiological alarms?",
    "How does your pipeline ensure deterministic real-time throughput on streaming multi-channel biosensors?",
  ],
  "theme-3-imaging": [
    "How do your segmentation contours preserve minute lesion boundaries under low-contrast radiological scans?",
    "What fitness metric did you choose to evaluate segmentation quality against clinical ground truth masks?",
    "How does your feature optimizer prevent overfitting to a single scanner vendor or patient cohort?",
    "What computational trade-offs were made to ensure rapid inference runtime on clinical workstations?",
  ],
  "theme-4-ml-ai": [
    "How does your machine learning architecture maintain generalization across non-stationary data drift?",
    "What hyperparameter search and regularization strategy did you apply to prevent overfitting?",
    "How do you ensure deterministic convergence of your optimization trajectory under strict time constraints?",
    "What mathematical validation confirms that your model outputs are fairly calibrated across sub-cohorts?",
  ],
  "theme-5-autonomous": [
    "How does your multi-agent autonomous decision engine coordinate collision-free trajectories under latency bounds?",
    "When an obstacle or communication dropout occurs, how rapidly does your planner recalibrate paths?",
    "What objective weighting prevents swarm deadlocks and hallway bottleneck lockouts in crowded environments?",
    "How does your distributed coordination protocol operate without centralized single-point bottlenecks?",
  ],
  "theme-6-open-innovation": [
    "What novel computational intelligence paradigm did your team formulate to bridge EMBS and CIS domains?",
    "How do you mathematically validate that your hybrid approach outperforms classical baseline heuristics?",
    "How does your multi-objective formulation navigate competing trade-offs between accuracy, runtime, and complexity?",
    "What real-world clinical or technological bottleneck does your solution solve most effectively?",
  ],
  "theme-2-edtech": [
    "How does your student knowledge state model update dynamically as a learner attempts multiple exercises?",
    "How do you mathematically balance personalization depth versus comprehensive curriculum coverage?",
    "What optimization strategy avoids cognitive overload or disengagement in adaptive learning path generation?",
    "How does your system prevent recommending duplicate or redundant pedagogical modules?",
  ],
  "theme-3-digital-health": [
    "Walk through your defuzzification and triage queue priority mechanism under emergency network bandwidth drops.",
    "How does your consultation dispatch system ensure low patient waiting latency across diverse medical specialties?",
    "How do you handle sudden surge demand when remote clinics report simultaneous acute patient arrivals?",
    "What mathematical criteria determine when a patient requires urgent in-person escalation vs remote monitoring?",
  ],
  "theme-4-neurotech": [
    "How does your BCI spatial filter handle non-stationary EEG signal drift across hours of continuous usage?",
    "What feature extraction techniques isolate motor imagery artifacts from ocular or muscular noise?",
    "How does your algorithm maintain low latency (<50ms) for real-time neuro-robotic prosthetic feedback?",
    "How did your model adapt during testing when electrode impedance fluctuated unpredictably?",
  ],
  "theme-5-medical-imaging": [
    "How do your segmentation contours preserve minute lesion boundaries under low-contrast radiological scans?",
    "What fitness metric did you choose to evaluate segmentation quality against clinical ground truth masks?",
    "How does your feature optimizer prevent overfitting to a single scanner vendor or patient cohort?",
    "What computational trade-offs were made to ensure rapid inference runtime on clinical workstations?",
  ],
  "theme-6-biomedical-signals": [
    "Explain how your wavelet or filter bank isolates subtle ECG arrhythmic beats from baseline wander.",
    "How does your fuzzy classifier handle overlapping boundaries between benign and pathological signal morphologies?",
    "What is your mathematical threshold for triggering high-priority physiological alarms?",
    "How does your pipeline ensure deterministic real-time throughput on streaming multi-channel biosensors?",
  ],
  "theme-7-smart-healthcare-iot": [
    "How does your energy-efficient routing algorithm prolong battery life across distributed medical IoT nodes?",
    "What is your duty-cycling policy during critical physiological event telemetry spikes?",
    "How does your network routing topology recover when an intermediate edge gateway node unexpectedly fails?",
    "How do you mathematically guarantee latency bounds for time-sensitive intensive-care alerts?",
  ],
  "theme-8-healthcare-robotics": [
    "How does your motion planning formulation guarantee smooth, collision-free kinematics near clinical staff?",
    "When an obstacle blocks a primary hospital delivery corridor, how rapidly does your planner compute an alternate path?",
    "What objective weighting prevents jerky robotic actuator accelerations during delicate medical transport?",
    "How did your multi-agent swarm allocation behave when task urgency shifted dynamically across wards?",
  ],
  "theme-9-open-innovation": [
    "What novel computational intelligence paradigm did your team formulate to bridge EMBS and CIS domains?",
    "How do you mathematically validate that your hybrid approach outperforms classical baseline heuristics?",
    "How does your multi-objective formulation navigate competing trade-offs between accuracy, runtime, and complexity?",
    "What real-world clinical or technological bottleneck does your solution solve most effectively?",
  ],
  "p1-hospital-scheduling": [
    "How did you mathematically model consecutive night-shift fatigue in your fuzzy inference system?",
    "What happens if 3 critical nurses take emergency leave simultaneously? How does your algorithm adapt?",
    "How does your crossover operator prevent generating invalid schedules with broken rest periods?",
    "What prevents your genetic algorithm from getting trapped in local minima during convergence?",
  ],
  "p2-drone-delivery": [
    "How is temperature degradation penalized in your fitness/pheromone evaluation function?",
    "If headwinds double flight energy consumption on edge (i,j), how quickly does your colony re-route?",
    "How do you handle non-linear battery depletion during multi-drop return journeys?",
    "Why choose this hybrid ACO+GA combination rather than pure Dijkstra or Simulated Annealing?",
  ],
  "p3-emergency-hospital": [
    "Walk through your defuzzification step for a patient presenting with conflicting vitals and uncertain queue times.",
    "How does PSO velocity clamping prevent particles from oscillating ('hospital hopping') between centers?",
    "What is your mathematical threshold for diverting an ambulance to a more distant facility?",
    "How does your algorithm verify that candidate hospitals have active specialist availability?",
  ],
  "p4-blood-inventory": [
    "Why did you choose substitution order X over Y, especially regarding universal donor O-negative units?",
    "How does your chromosome representation track multi-day perishability and shelf-life degradation?",
    "What is the mathematical trade-off weight between a stockout penalty versus expired unit wastage?",
    "How does your policy behave under an unannounced 48-hour delivery delay from the regional blood bank?",
  ],
  "p5-search-and-rescue": [
    "How does your robot swarm avoid getting trapped inside concave obstacle dead-ends?",
    "When Robot 2 discovers a survivor, what exact message or pheromone broadcast triggers swarm reallocation?",
    "What is your battery return-to-base safety margin calculation under unpredictable debris drag?",
    "How did your swarm coverage map adapt when direct communication corridors collapsed?",
  ],
  "p6-fuzzy-triage": [
    "Show the exact fuzzy rule triggered when heart rate is high (>120) but systolic blood pressure appears normal.",
    "How did your genetic algorithm optimize membership function bounds without violating clinical safety limits?",
    "How does your system prevent catastrophic under-triage of subtle pediatric emergency cases?",
    "How does your inference engine handle 15% noisy or missing sensor telemetry?",
  ],
};

    // Build judging queue with all submissions and reflections
    const queue = [];
    for (const team of allTeams) {
      if (team.isDisqualified) continue;

      const subs = await db.submission.findMany({
        where: { teamId: team.id },
        orderBy: { submittedAt: "desc" },
      });

      // Prefer attempt 3 or latest attempt
      const finalSub = subs[0] || null;
      const evaluation = evaluations.find((e) => e.teamId === team.id) || null;
      const trackVivaQuestions = VIVA_QUESTIONS[team.domainId || "p1-hospital-scheduling"] || [
        "Explain the algorithmic representation and operators chosen for this problem.",
        "How does your method handle the hidden scenario shifts between attempts?",
        "What trade-offs were made between solution quality and computational execution time?",
      ];

      queue.push({
        teamId: team.id,
        teamCode: team.teamCode,
        teamName: team.teamName, // Real team names
        trackId: team.domainId,
        trackName: team.track?.shortName || "Track",
        attemptsUsed: team.attemptsUsed,
        bestScore: team.bestScore,
        submissions: subs,
        finalSubmission: finalSub,
        hasEvaluated: !!evaluation,
        evaluation,
        vivaQuestions: trackVivaQuestions,
      });
    }

    return NextResponse.json({
      judgeName: session.name,
      assignedTrack: assignedTrack || "ALL_TRACKS",
      queue,
    });
  } catch (err) {
    return NextResponse.json({ error: "Error retrieving judge queue." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || (session.role !== "JUDGE" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized: Judge login required." }, { status: 401 });
    }

    const body = await req.json();
    const { submissionId, teamId, codeQuality, algorithmicReasoning, resultInterpretation, innovation, notes } = body;

    if (!submissionId || !teamId) {
      return NextResponse.json({ error: "Submission ID and Team ID are required." }, { status: 400 });
    }

    // Clamp rubric values
    const qCode = Math.min(25, Math.max(0, Number(codeQuality) || 0));
    const qReasoning = Math.min(35, Math.max(0, Number(algorithmicReasoning) || 0));
    const qInterpretation = Math.min(20, Math.max(0, Number(resultInterpretation) || 0));
    const qInnovation = Math.min(20, Math.max(0, Number(innovation) || 0));

    const totalJudgeScore = Math.round((qCode + qReasoning + qInterpretation + qInnovation) * 10) / 10;

    // Save evaluation
    const evaluation = await db.judgeEvaluation.upsert({
      where: {
        judgeId_submissionId: {
          judgeId: session.id,
          submissionId,
        },
      },
      update: {
        codeQuality: qCode,
        algorithmicReasoning: qReasoning,
        resultInterpretation: qInterpretation,
        innovation: qInnovation,
        totalJudgeScore,
        notes: notes?.trim() || null,
      },
      create: {
        judgeId: session.id,
        submissionId,
        teamId,
        codeQuality: qCode,
        algorithmicReasoning: qReasoning,
        resultInterpretation: qInterpretation,
        innovation: qInnovation,
        totalJudgeScore,
        notes: notes?.trim() || null,
      },
    });

    // Compute average judge score for this team across all judges
    const teamEvals = await db.judgeEvaluation.findMany({ where: { teamId } });
    const avgJudgeScore =
      teamEvals.reduce((acc, ev) => acc + ev.totalJudgeScore, 0) / (teamEvals.length || 1);

    // Fetch config weights
    const weightAutoStr = await db.systemSetting.get("weight_auto", "60");
    const weightJudgeStr = await db.systemSetting.get("weight_judge", "40");
    const wAuto = (Number(weightAutoStr) || 60) / 100;
    const wJudge = (Number(weightJudgeStr) || 40) / 100;

    const team = await db.team.findUnique({ where: { id: teamId } });
    if (team) {
      const combined = Math.round((wAuto * team.bestScore + wJudge * avgJudgeScore) * 10) / 10;
      await db.team.update({
        where: { id: teamId },
        data: {
          finalJudgeScore: Math.round(avgJudgeScore * 10) / 10,
          finalCombinedScore: combined,
        },
      });
    }

    // Audit log
    await db.auditLog.create({
      data: {
        action: "JUDGE_EVALUATION_RECORDED",
        performedBy: session.name,
        details: `Judge scored team ${team?.teamName || teamId} with ${totalJudgeScore}/100.`,
      },
    });

    return NextResponse.json({
      success: true,
      evaluation,
      totalJudgeScore,
      avgJudgeScore: Math.round(avgJudgeScore * 10) / 10,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error saving evaluation." }, { status: 500 });
  }
}
