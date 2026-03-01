import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { InfoPageHeader } from "@/components/info-page-header";
import { BottomNav } from "@/components/bottom-nav";
import { getProgressToNextLevel } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) redirect("/login");

  const { current, next, percentage } = getProgressToNextLevel(user.totalPagesRead);
  const progress = await prisma.readingProgress.findMany({
    where: { userId: user.id },
    include: { edition: true },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    include: { edition: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const starred = await prisma.starredEdition.findMany({
    where: { userId: user.id },
    include: { edition: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="relative z-10 min-h-screen bg-[var(--background)]">
      <InfoPageHeader session={session} />

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 pb-24 md:pb-12">
        <section className="mb-8 rounded-2xl border-2 border-[var(--paper-border)] bg-[var(--paper)] p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--masthead)] to-[var(--masthead-hover)] text-2xl font-bold text-white shadow-md">
              {user.name?.slice(0, 1) ?? user.email?.slice(0, 1) ?? "?"}
            </div>
            <div>
              <h1 className="font-editorial text-xl font-semibold text-[var(--ink)]">
                {user.name ?? "Reader"}
              </h1>
              <p className="text-sm text-[var(--ink-muted)]">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4 rounded-xl bg-[var(--accent-soft)]/50 border border-[var(--masthead)]/10 p-4">
            <div className="flex flex-col items-center">
              <span className="font-editorial text-2xl font-bold text-[var(--masthead)]">Level {user.level}</span>
              <span className="text-xs font-medium text-[var(--ink-muted)]">Reader level</span>
            </div>
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-xs font-medium text-[var(--ink-muted)]">
                <span>{current} pages</span>
                <span>{next} pages</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[var(--paper-border)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--masthead)] to-[var(--masthead-hover)] transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-[var(--ink-muted)]">
                {user.totalPagesRead} total pages read
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-editorial mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--ink-muted)]">
            Reading history
          </h2>
          <ul className="space-y-2">
            {progress.slice(0, 10).map((p) => (
              <li key={p.id}>
                <Link
                  href={`/read/${p.editionId}${p.lastPageRead > 0 ? `?page=${p.lastPageRead + 1}` : ""}`}
                  className="flex items-center justify-between rounded-xl border-2 border-[var(--paper-border)] bg-[var(--paper)] px-4 py-3 transition hover:border-[var(--masthead)]/30 hover:shadow-sm"
                >
                  <span className="font-medium text-[var(--ink)]">
                    {new Date(p.edition.date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                    {p.edition.region ? ` · ${p.edition.region}` : ""}
                  </span>
                  <span className="text-sm font-medium text-[var(--masthead)]">
                    {Math.round(p.percentage)}% read · Resume page {p.lastPageRead + 1}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {progress.length === 0 && (
            <p className="rounded-xl border-2 border-dashed border-[var(--paper-border)] py-8 text-center text-sm text-[var(--ink-muted)]">
              No reading history yet.
            </p>
          )}
        </section>

        <section className="mb-8">
          <h2 className="font-editorial mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--ink-muted)]">
            Starred editions
          </h2>
          <ul className="space-y-2">
            {starred.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/read/${s.editionId}`}
                  className="flex items-center justify-between rounded-xl border-2 border-[var(--paper-border)] bg-[var(--paper)] px-4 py-3 transition hover:border-[var(--masthead)]/30 hover:shadow-sm"
                >
                  <span className="font-medium text-[var(--ink)]">
                    {new Date(s.edition.date).toISOString().slice(0, 10)}
                  </span>
                  <span className="text-[var(--accent)]">★</span>
                </Link>
              </li>
            ))}
          </ul>
          {starred.length === 0 && (
            <p className="rounded-xl border-2 border-dashed border-[var(--paper-border)] py-8 text-center text-sm text-[var(--ink-muted)]">
              No starred editions.
            </p>
          )}
        </section>

        <section>
          <h2 className="font-editorial mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--ink-muted)]">
            Recent bookmarks
          </h2>
          <ul className="space-y-2">
            {bookmarks.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/read/${b.editionId}?page=${b.pageNumber}`}
                  className="flex items-center justify-between rounded-xl border-2 border-[var(--paper-border)] bg-[var(--paper)] px-4 py-3 transition hover:border-[var(--masthead)]/30 hover:shadow-sm"
                >
                  <span className="font-medium text-[var(--ink)]">
                    {new Date(b.edition.date).toISOString().slice(0, 10)} – Page {b.pageNumber}
                  </span>
                  <span className="text-[var(--ink-muted)]">🔖</span>
                </Link>
              </li>
            ))}
          </ul>
          {bookmarks.length === 0 && (
            <p className="rounded-xl border-2 border-dashed border-[var(--paper-border)] py-8 text-center text-sm text-[var(--ink-muted)]">
              No bookmarks yet.
            </p>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
