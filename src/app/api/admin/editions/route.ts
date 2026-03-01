import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadBuffer, isStorageConfigured } from "@/lib/storage";
import path from "path";

// Add specific edge configuration for pdfjs-dist
export const runtime = "nodejs"; // ensure node runtime

const getPageCount = async (buffer: Buffer): Promise<number> => {
  try {
    const str = buffer.toString('binary');
    const regex = /\/Count\s+(\d+)/g;
    let match;
    let maxPages = 0;
    while ((match = regex.exec(str)) !== null) {
      const count = parseInt(match[1], 10);
      if (count > maxPages) {
        maxPages = count;
      }
    }
    
    if (maxPages > 0) {
      return maxPages;
    }
    
    return 1;
  } catch (error) {
    console.error("PDF Parsing Error detail:", error);
    return 1;
  }
};

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

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const dateStr = formData.get("date") as string | null;
  const region = (formData.get("region") as string) || "default";
  const language = (formData.get("language") as string) || "en";

  if (!file || !dateStr) return NextResponse.json({ error: "file and date required" }, { status: 400 });
  if (file.type !== "application/pdf")
    return NextResponse.json({ error: "Only PDF allowed" }, { status: 400 });

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime()))
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  let totalPages: number;
  try {
    totalPages = await getPageCount(buffer);
  } catch (e) {
    console.error("PDF parsing error:", e);
    return NextResponse.json({ error: "Invalid PDF" }, { status: 400 });
  }

  try {
    const safeDate = date.toISOString().slice(0, 10); // YYYY-MM-DD
    const safeRegion = region.replace(/[^a-zA-Z0-9]+/g, "_") || "Region";
    const baseName = `Epaper_${safeDate}_${safeRegion}_Main_Edition`;
    const key = `editions/${baseName}.pdf`;
    
    console.log("Uploading to bucket with key:", key);
    console.log("R2 Bucket:", process.env.R2_BUCKET);
    console.log("R2 Endpoint:", process.env.R2_ENDPOINT);
    console.log("R2 Access Key:", process.env.R2_ACCESS_KEY_ID ? "Set" : "Not Set");
    console.log("AWS Access Key:", process.env.AWS_ACCESS_KEY_ID ? "Set" : "Not Set");
    await uploadBuffer(key, buffer, "application/pdf");
    console.log("Upload successful!");

    const edition = await prisma.edition.create({
      data: {
        date,
        region,
        language,
        totalPages,
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

    revalidateTag("editions", "max");

    return NextResponse.json({
      id: edition.id,
      date: edition.date.toISOString().slice(0, 10),
      region: edition.region,
      totalPages: edition.totalPages,
    });
  } catch (uploadError: any) {
    console.error("Upload/Database Error:", uploadError);
    return NextResponse.json({ error: "Failed to upload or save to database: " + uploadError.message }, { status: 500 });
  }
}
