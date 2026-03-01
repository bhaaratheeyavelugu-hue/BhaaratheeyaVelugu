import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const region = searchParams.get("region");
  const publishedOnly = searchParams.get("published") !== "false";

  const where: { isPublished?: boolean; date?: Date; region?: { contains: string } } = {};
  if (publishedOnly) where.isPublished = true;
  if (date) where.date = new Date(date);
  if (region) where.region = { contains: region };

  const editions = await prisma.edition.findMany({
    where,
    orderBy: { date: "desc" },
    take: 50,
    include: {
      _count: { select: { pages: true } },
    },
  });

  return NextResponse.json(
    editions.map((e) => ({
      id: e.id,
      date: e.date.toISOString().slice(0, 10),
      region: e.region,
      language: e.language,
      totalPages: e.totalPages,
      isPublished: e.isPublished,
      pageCount: e._count.pages,
    }))
  );
}
