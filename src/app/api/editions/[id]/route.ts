import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSignedReadUrl } from "@/lib/storage";

function isExternalUrl(key: string | null): boolean {
  return !!key && (key.startsWith("http://") || key.startsWith("https://"));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const edition = await prisma.edition.findUnique({
    where: { id },
    include: { pages: { orderBy: { pageNumber: "asc" } } },
  });
  if (!edition) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Demo: external PDF URL stored in pdfKey is returned as-is
  const pdfUrl = edition.pdfKey
    ? isExternalUrl(edition.pdfKey)
      ? edition.pdfKey
      : await getSignedReadUrl(edition.pdfKey)
    : null;
  const pageUrls =
    edition.pages.length > 0
      ? await Promise.all(
          edition.pages.map(async (p) => {
            const url = isExternalUrl(p.imageKey)
              ? p.imageKey
              : p.imageKey === edition.pdfKey && pdfUrl
                ? pdfUrl
                : await getSignedReadUrl(p.imageKey);
            return { pageNumber: p.pageNumber, url };
          })
        )
      : pdfUrl
        ? Array.from({ length: edition.totalPages }, (_, i) => ({
            pageNumber: i + 1,
            url: pdfUrl,
          }))
        : [];

  return NextResponse.json({
    id: edition.id,
    date: edition.date.toISOString().slice(0, 10),
    region: edition.region,
    language: edition.language,
    totalPages: edition.totalPages,
    pdfUrl,
    pages: pageUrls,
  });
}
