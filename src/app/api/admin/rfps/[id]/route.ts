import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rfpSchema } from "@/lib/validations/rfp";

const rfpUpdateSchema = rfpSchema.partial().extend({
  published: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = rfpUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { deadline, published, fundingAmount, ...rest } = parsed.data;

    const rfp = await prisma.rFP.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(fundingAmount !== undefined ? { fundingAmount } : {}),
        ...(deadline ? { deadline: new Date(deadline) } : {}),
        ...(published !== undefined ? { published } : {}),
      },
    });

    return NextResponse.json(rfp);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
