import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ editionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { editionId } = await params;
  const progress = await prisma.readingProgress.findUnique({
    where: {
      userId_editionId: { userId: session.user.id, editionId },
    },
  });

  if (!progress)
    return NextResponse.json({ lastPageRead: 0, percentage: 0 });

  return NextResponse.json({
    lastPageRead: progress.lastPageRead,
    percentage: progress.percentage,
    updatedAt: progress.updatedAt,
  });
}
