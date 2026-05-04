import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rfpSchema } from "@/lib/validations/rfp";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const focusArea = searchParams.get("focusArea")?.trim() ?? "";
  const geography = searchParams.get("geography")?.trim() ?? "";

  const where: Prisma.RFPWhereInput = {};

  if (session.user.role === "NONPROFIT") {
    where.published = true;
  } else if (session.user.role === "DONOR") {
    const profile = await prisma.donorProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return NextResponse.json([]);
    where.donorId = profile.id;
  }

  if (search) {
    const tsQuery = search.split(/\s+/).filter(Boolean).join(" & ");
    where.OR = [
      { title: { search: tsQuery } },
      { description: { search: tsQuery } },
    ];
  }

  if (focusArea) where.focusAreas = { hasSome: [focusArea] };
  if (geography) where.geographies = { hasSome: [geography] };

  const rfps = await prisma.rFP.findMany({
    where,
    include: { donor: { select: { orgName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rfps);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "NONPROFIT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = rfpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { deadline, sourceType, fundingAmount, ...rest } = parsed.data;

    let donorId: string | undefined;
    if (session.user.role === "DONOR") {
      const profile = await prisma.donorProfile.findUnique({ where: { userId: session.user.id } });
      if (!profile) return NextResponse.json({ error: "Complete your donor profile first." }, { status: 400 });
      donorId = profile.id;
    }

    const rfp = await prisma.rFP.create({
      data: {
        ...rest,
        fundingAmount,
        deadline: new Date(deadline),
        sourceType,
        published: session.user.role === "ADMIN" && sourceType === "IMPORTED" ? false : true,
        ...(donorId ? { donorId } : {}),
      },
    });

    return NextResponse.json(rfp, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
