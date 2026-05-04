import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { statusUpdateSchema } from "@/lib/validations/application";
import { sendStatusChangedEmail } from "@/lib/email";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DONOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = statusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const donorProfile = await prisma.donorProfile.findUnique({ where: { userId: session.user.id } });
    if (!donorProfile) return NextResponse.json({ error: "Donor profile not found." }, { status: 400 });

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        rfp: { select: { title: true, donorId: true } },
        nonprofit: { include: { user: { select: { email: true } } } },
      },
    });

    if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });
    if (application.rfp.donorId !== donorProfile.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
    });

    const nonprofitEmail = application.nonprofit.user.email;
    const appUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/nonprofit/rfps`;
    sendStatusChangedEmail({
      nonprofitEmail,
      nonprofitName: application.nonprofit.orgName,
      rfpTitle: application.rfp.title,
      newStatus: parsed.data.status,
      appUrl,
    }).catch(console.error);

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
