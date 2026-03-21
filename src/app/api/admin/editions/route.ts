import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStorageConfigured } from "@/lib/storage";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const editions = await prisma.edition.findMany({
    orderBy: { date: "desc" },
    take: 100,
    include: { _count: { select: { pages: true } } },
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

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!isStorageConfigured())
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action === "getUploadUrl") {
    const { filename, contentType, date, region } = body;
    if (!filename || !date) return NextResponse.json({ error: "filename and date required" }, { status: 400 });

    const safeDate = new Date(date).toISOString().slice(0, 10);
    const safeRegion = (region || "Region").replace(/[^a-zA-Z0-9]+/g, "_");
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const baseName = `Epaper_${safeDate}_${safeRegion}_Main_Edition_${uniqueId}`;
    const key = `editions/${baseName}.pdf`;

    const { getSignedUploadUrl } = await import("@/lib/storage");
    try {
      const uploadUrl = await getSignedUploadUrl(key, contentType || "application/pdf");
      return NextResponse.json({ uploadUrl, key });
    } catch (e: any) {
      console.error("Presigned URL error:", e);
      return NextResponse.json({ error: "Failed to generate upload URL: " + e.message }, { status: 500 });
    }
  }

  if (body.action === "createEdition") {
    const { date, region, language, totalPages, key } = body;
    if (!key || !date || typeof totalPages !== 'number') 
      return NextResponse.json({ error: "Invalid metadata payload" }, { status: 400 });

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) 
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });

    try {
      const edition = await prisma.edition.create({
        data: {
          date: parsedDate,
          region: region || "default",
          language: language || "en",
          totalPages: totalPages,
          pdfKey: key,
          isPublished: true,
        },
      });

      // Create one EditionPage per page; imageKey points to same PDF (client uses PDF.js + pageNumber)
      await prisma.editionPage.createMany({
        data: Array.from({ length: totalPages }, (_, i) => ({
          editionId: edition.id,
          pageNumber: i + 1,
          imageKey: key,
        })),
      });

      revalidateTag("editions", "max" as any); // Type cast to bypass Next.js 14 typings mismatch

      return NextResponse.json({
        id: edition.id,
        date: edition.date.toISOString().slice(0, 10),
        region: edition.region,
        totalPages: edition.totalPages,
      });
    } catch (uploadError: any) {
      console.error("Database Save Error:", uploadError);
      return NextResponse.json({ error: "Failed to save to database: " + uploadError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
