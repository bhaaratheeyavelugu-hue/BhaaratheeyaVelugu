import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReaderView } from "@/components/reader-view";
import { prisma } from "@/lib/prisma";

export default async function ReadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const { page: pageParam } = await searchParams;

  const edition = await prisma.edition.findUnique({
    where: { id },
    include: { pages: { orderBy: { pageNumber: "asc" } } },
  });
  if (!edition || !edition.isPublished) redirect("/");

  // Fetch all published editions to build the date and edition selectors in the header
  const allEditions = await prisma.edition.findMany({
    where: { isPublished: true },
    select: { id: true, date: true, region: true },
    orderBy: [{ date: "desc" }, { region: "asc" }],
  });

  let initialPage = 1;
  const pageFromQuery = pageParam ? parseInt(pageParam, 10) : 0;
  if (pageFromQuery > 0) {
    initialPage = Math.min(pageFromQuery, edition.totalPages);
  } else if (session?.user?.id) {
    const progress = await prisma.readingProgress.findUnique({
      where: { userId_editionId: { userId: session.user.id, editionId: id } },
    });
    if (progress && progress.lastPageRead > 0)
      initialPage = Math.min(progress.lastPageRead + 1, edition.totalPages);
  }

  return (
    <ReaderView
      editionId={id}
      region={edition.region}
      totalPages={edition.totalPages}
      date={edition.date.toISOString().slice(0, 10)}
      initialPage={initialPage}
      isLoggedIn={!!session?.user}
      isAdmin={session?.user ? ((session.user as { role?: string }).role === "ADMIN" || (session.user as { role?: string }).role === "SUPER_ADMIN") : false}
      allEditions={allEditions}
    />
  );
}
