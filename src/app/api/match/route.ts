import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMatchScore } from "@/lib/match";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "NONPROFIT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rfpId = new URL(req.url).searchParams.get("rfpId");
  if (!rfpId) return NextResponse.json({ error: "rfpId required" }, { status: 400 });

  const [profile, rfp] = await Promise.all([
    prisma.nonprofitProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.rFP.findUnique({ where: { id: rfpId } }),
  ]);

  if (!profile) {
    return NextResponse.json(
      { error: "Complete your nonprofit profile before requesting match scores." },
      { status: 400 }
    );
  }
  if (!rfp) return NextResponse.json({ error: "RFP not found" }, { status: 404 });

  // Return cached score if within 7-day TTL
  const cached = await prisma.matchScore.findUnique({
    where: { rfpId_nonprofitId: { rfpId, nonprofitId: profile.id } },
  });
  if (cached && Date.now() - cached.computedAt.getTime() < CACHE_TTL_MS) {
    return NextResponse.json({ score: cached.score, justification: cached.justification, cached: true });
  }

  // Compute via Anthropic
  let result;
  try {
    result = await computeMatchScore(
      { title: rfp.title, focusAreas: rfp.focusAreas, geographies: rfp.geographies, description: rfp.description },
      { orgName: profile.orgName, mission: profile.mission, focusAreas: profile.focusAreas, serviceAreas: profile.serviceAreas }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[match] Anthropic error:", msg);
    return NextResponse.json({ error: "Scoring service temporarily unavailable.", detail: msg }, { status: 503 });
  }

  // Persist to cache
  await prisma.matchScore.upsert({
    where: { rfpId_nonprofitId: { rfpId, nonprofitId: profile.id } },
    update: { score: result.score, justification: result.justification, computedAt: new Date() },
    create: { rfpId, nonprofitId: profile.id, score: result.score, justification: result.justification },
  });

  return NextResponse.json({ score: result.score, justification: result.justification, cached: false });
}
