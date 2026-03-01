import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { isPublished, region, language } = body as {
    isPublished?: boolean;
    region?: string;
    language?: string;
  };

  const data: { isPublished?: boolean; region?: string; language?: string } = {};
  if (typeof isPublished === "boolean") data.isPublished = isPublished;
  if (typeof region === "string") data.region = region;
  if (typeof language === "string") data.language = language;

  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: "No updates" }, { status: 400 });

  const edition = await prisma.edition.update({
    where: { id },
    data,
  });

  if (Object.hasOwn(data, "isPublished")) {
    revalidateTag("editions", "max");
  }

  return NextResponse.json({
    id: edition.id,
    isPublished: edition.isPublished,
    region: edition.region,
    language: edition.language,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.edition.delete({ where: { id } });
  revalidateTag("editions", "max");
  return NextResponse.json({ ok: true });
}
