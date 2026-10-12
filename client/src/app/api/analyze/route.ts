import { NextResponse } from "next/server";
import { analyzeRequirements } from "@/lib/server/openrouter";
import { MIN_LENGTH } from "@/lib/constants";

// Analyses routinely take 1–2 minutes; allow up to 5 on Vercel.
export const maxDuration = 300;

const MAX_LENGTH = 50_000;

export async function POST(req: Request) {
  let requirements: unknown;
  try {
    ({ requirements } = await req.json());
  } catch {
    return NextResponse.json(
      { error: "Bad request", message: "Request body must be JSON." },
      { status: 400 }
    );
  }

  if (!requirements || typeof requirements !== "string") {
    return NextResponse.json(
      { error: "Bad request", message: "Please provide a 'requirements' field as a string." },
      { status: 400 }
    );
  }

  if (requirements.trim().length < MIN_LENGTH) {
    return NextResponse.json(
      {
        error: "Bad request",
        message: `Requirements text is too short. Please provide more detail (at least ${MIN_LENGTH} characters).`,
      },
      { status: 400 }
    );
  }

  if (requirements.length > MAX_LENGTH) {
    return NextResponse.json(
      {
        error: "Bad request",
        message: `Requirements text is too long (max ${MAX_LENGTH.toLocaleString()} characters).`,
      },
      { status: 413 }
    );
  }

  try {
    const analysis = await analyzeRequirements(requirements);
    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error("Analysis error:", (error as Error).message);
    return NextResponse.json(
      {
        error: "Analysis failed",
        message: (error as Error).message || "Failed to analyze requirements.",
      },
      { status: 500 }
    );
  }
}
