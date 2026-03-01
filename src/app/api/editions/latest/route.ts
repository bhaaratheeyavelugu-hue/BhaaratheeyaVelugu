import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Lightweight: returns only { id } for the latest published edition in the region. Use for fast region selection. */
export async function GET(request: Request) {
  const region = new URL(request.url).searchParams.get("region");
  if (!region?.trim()) return NextResponse.json({ error: "region required" }, { status: 400 });
  const edition = await prisma.edition.findFirst({
    where: { isPublished: true, region: { contains: region.trim() } },
    orderBy: { date: "desc" },
    select: { id: true },
  });
  if (!edition) return NextResponse.json(null);
  return NextResponse.json({ id: edition.id });
}
