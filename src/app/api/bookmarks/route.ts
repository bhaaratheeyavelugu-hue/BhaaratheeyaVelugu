import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const editionId = searchParams.get("editionId");

  if (editionId) {
    const list = await prisma.bookmark.findMany({
      where: { userId: session.user.id, editionId },
      orderBy: { pageNumber: "asc" },
    });
    return NextResponse.json(list.map((b) => ({ pageNumber: b.pageNumber, id: b.id })));
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    include: { edition: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(
    bookmarks.map((b) => ({
      id: b.id,
      editionId: b.editionId,
      date: b.edition.date.toISOString().slice(0, 10),
      pageNumber: b.pageNumber,
      createdAt: b.createdAt,
    }))
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { editionId, pageNumber } = body as { editionId: string; pageNumber: number };
  if (!editionId || typeof pageNumber !== "number")
    return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_editionId_pageNumber: {
        userId: session.user.id,
        editionId,
        pageNumber,
      },
    },
  });
  if (existing) return NextResponse.json({ id: existing.id });

  const bookmark = await prisma.bookmark.create({
    data: {
      userId: session.user.id,
      editionId,
      pageNumber,
    },
  });
  return NextResponse.json({ id: bookmark.id });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const editionId = searchParams.get("editionId");
  const pageNumber = searchParams.get("pageNumber");

  if (id) {
    await prisma.bookmark.deleteMany({
      where: { id, userId: session.user.id },
    });
    return NextResponse.json({ ok: true });
  }
  if (editionId && pageNumber !== null && pageNumber !== undefined) {
    await prisma.bookmark.deleteMany({
      where: {
        userId: session.user.id,
        editionId,
        pageNumber: Number(pageNumber),
      },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Bad request" }, { status: 400 });
}
