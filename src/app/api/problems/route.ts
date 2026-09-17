import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get("id");

    const tracks = await db.problemTrack.findMany();

    // Sanitize to enforce Strict Visibility Rules:
    // Strip confidential backend fields: hiddenShiftAttempt2, hiddenShiftAttempt3, livePatchSurprise
    const sanitized = tracks.map((track) => ({
      id: track.id,
      name: track.name,
      shortName: track.shortName,
      society: track.society,
      difficulty: track.difficulty,
      technique: track.technique,
      context: track.context,
      coreChallenge: track.coreChallenge,
      hardConstraints: track.hardConstraints,
      optimizationObjectives: track.optimizationObjectives,
      hiddenTestNote: track.hiddenTestNote,
      expectedOutputChecklist: track.expectedOutputChecklist,
      description: track.description,
      statementMarkdown: track.statementMarkdown,
      starterNotebookUrl: track.starterNotebookUrl,
      benchmarkType: track.benchmarkType,
    }));

    if (problemId) {
      const match = sanitized.find((t) => t.id === problemId);
      if (!match) {
        return NextResponse.json({ error: "Problem track not found." }, { status: 404 });
      }
      return NextResponse.json({ problem: match });
    }

    return NextResponse.json({ problems: sanitized });
  } catch {
    return NextResponse.json({ error: "Error retrieving problem statements." }, { status: 500 });
  }
}