import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicationSchema } from "@/lib/validations/application";
import { sendApplicationSubmittedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "NONPROFIT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = applicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { rfpId, proposalNarrative, budgetNotes } = parsed.data;

    const [profile, rfp] = await Promise.all([
      prisma.nonprofitProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.rFP.findUnique({
        where: { id: rfpId },
        include: { donor: { include: { user: { select: { email: true } } } } },
      }),
    ]);

    if (!profile) return NextResponse.json({ error: "Complete your profile first." }, { status: 400 });
    if (!rfp) return NextResponse.json({ error: "RFP not found" }, { status: 404 });

    const existing = await prisma.application.findUnique({
      where: { rfpId_nonprofitId: { rfpId, nonprofitId: profile.id } },
    });
    if (existing) return NextResponse.json({ error: "You have already applied to this RFP." }, { status: 409 });

    const application = await prisma.application.create({
      data: { rfpId, nonprofitId: profile.id, proposalNarrative, budgetNotes },
    });

    const donorEmail = rfp.donor?.user?.email;
    if (donorEmail) {
      const appUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/donor/applications`;
      sendApplicationSubmittedEmail({
        donorEmail,
        nonprofitName: profile.orgName,
        rfpTitle: rfp.title,
        appUrl,
      }).catch(console.error);
    }

    return NextResponse.json(application, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
