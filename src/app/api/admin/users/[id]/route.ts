import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const suspendSchema = z.object({
  suspended: z.boolean(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (params.id === session.user.id) {
    return NextResponse.json({ error: "Cannot suspend your own account." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const parsed = suspendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { suspended: parsed.data.suspended },
      select: { id: true, suspended: true },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
