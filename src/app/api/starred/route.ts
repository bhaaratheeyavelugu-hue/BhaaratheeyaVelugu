import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const starred = await prisma.starredEdition.findMany({
    where: { userId: session.user.id },
    include: { edition: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    starred.map((s) => ({
      editionId: s.editionId,
      date: s.edition.date.toISOString().slice(0, 10),
      region: s.edition.region,
      totalPages: s.edition.totalPages,
    }))
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const editionId = body?.editionId as string | undefined;
  if (!editionId) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  await prisma.starredEdition.upsert({
    where: {
      userId_editionId: { userId: session.user.id, editionId },
    },
    create: { userId: session.user.id, editionId },
    update: {},
  });
  return NextResponse.json({ starred: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const editionId = searchParams.get("editionId");
  if (!editionId) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  await prisma.starredEdition.deleteMany({
    where: { userId: session.user.id, editionId },
  });
  return NextResponse.json({ ok: true });
}
