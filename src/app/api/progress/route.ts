import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getLevelFromPages } from "@/lib/constants";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const progress = await prisma.readingProgress.findMany({
    where: { userId: session.user.id },
    include: { edition: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return NextResponse.json(
    progress.map((p) => ({
      editionId: p.editionId,
      date: p.edition.date.toISOString().slice(0, 10),
      lastPageRead: p.lastPageRead,
      percentage: p.percentage,
      updatedAt: p.updatedAt,
    }))
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { editionId, lastPageRead } = body as { editionId: string; lastPageRead: number };
  if (!editionId || typeof lastPageRead !== "number")
    return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const edition = await prisma.edition.findUnique({ where: { id: editionId } });
  if (!edition) return NextResponse.json({ error: "Edition not found" }, { status: 404 });

  const totalPages = edition.totalPages || 1;
  const percentage = Math.min(100, Math.round((lastPageRead / totalPages) * 100));

  const previous = await prisma.readingProgress.findUnique({
    where: {
      userId_editionId: { userId: session.user.id, editionId },
    },
  });
  const prevMax = previous?.lastPageRead ?? 0;
  const delta = Math.max(0, lastPageRead - prevMax);

  const progress = await prisma.readingProgress.upsert({
    where: {
      userId_editionId: { userId: session.user.id, editionId },
    },
    create: {
      userId: session.user.id,
      editionId,
      lastPageRead,
      percentage,
    },
    update: { lastPageRead, percentage },
  });

  if (delta > 0) {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { totalPagesRead: { increment: delta } },
    });
    const newLevel = getLevelFromPages(user.totalPagesRead);
    if (newLevel !== user.level) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { level: newLevel },
      });
    }
  }

  return NextResponse.json({
    lastPageRead: progress.lastPageRead,
    percentage: progress.percentage,
  });
}
