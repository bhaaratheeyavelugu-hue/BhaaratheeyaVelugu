import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { prisma } from "@/lib/prisma";
import { getAllPublishedEditions } from "@/lib/data";

const ReaderView = dynamic(
  () => import("@/components/reader-view").then((m) => ({ default: m.ReaderView })),
  { loading: () => <ReadPageSkeleton /> }
);

function ReadPageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] gap-4">
      <img src="/logo.png" alt="" className="h-14 w-14 object-contain animate-pulse opacity-70" />
      <p className="text-sm font-medium text-[var(--ink-muted)] uppercase tracking-wider">Loading edition…</p>
    </div>
  );
}

export default async function ReadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page: pageParam }] = await Promise.all([params, searchParams]);

  const [session, edition, allEditions] = await Promise.all([
    auth(),
    prisma.edition.findUnique({
      where: { id },
      include: { pages: { orderBy: { pageNumber: "asc" } } },
    }),
    getAllPublishedEditions()
  ]);

  if (!edition || !edition.isPublished) redirect("/");

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
