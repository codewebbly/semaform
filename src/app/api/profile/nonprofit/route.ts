import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nonprofitProfileSchema } from "@/lib/validations/profile";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "NONPROFIT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.nonprofitProfile.findUnique({
    where: { userId: session.user.id },
  });
  return NextResponse.json(profile);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "NONPROFIT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = nonprofitProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const profile = await prisma.nonprofitProfile.upsert({
      where: { userId: session.user.id },
      update: parsed.data,
      create: { ...parsed.data, userId: session.user.id },
    });

    return NextResponse.json(profile);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
