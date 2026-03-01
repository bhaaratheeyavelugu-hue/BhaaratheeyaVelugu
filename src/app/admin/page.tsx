import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { LogoutButton } from "@/components/logout-button";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

const AdminDashboard = dynamic(
  () => import("@/components/admin-dashboard").then((m) => ({ default: m.AdminDashboard })),
  { loading: () => <div className="min-h-[40vh] flex items-center justify-center text-[var(--ink-muted)] font-medium">Loading…</div> }
);

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-50 border-b border-[var(--paper-border)] bg-[var(--paper)] shadow-[var(--shadow-sm)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-1.5 sm:gap-2 text-[var(--ink)] overflow-visible [&_span]:text-[var(--ink)] [&_span]:font-black [&_span]:overflow-visible [&_span]:leading-[1.2] [&_span]:pb-0.5 [&_span]:text-base sm:[&_span]:text-lg"
          >
            <BrandLogo asLink={false} showText={true} size="sm" className="shrink-0 min-w-0 [&_img]:h-7 [&_img]:w-7 sm:[&_img]:h-8 sm:[&_img]:w-8" />
            <span className="hidden sm:inline font-editorial text-base font-semibold text-[var(--ink-muted)]">Admin</span>
          </Link>
          <nav className="flex shrink-0 items-center gap-1.5 sm:gap-4">
            <ThemeToggle className="shrink-0 p-1.5 sm:p-1" />
            <Link
              href="/"
              className="text-xs sm:text-sm font-medium text-[var(--masthead)] hover:text-[var(--masthead-hover)] whitespace-nowrap py-2 px-2 sm:px-0"
            >
              <span className="hidden sm:inline">Back to app</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <LogoutButton className="shrink-0 rounded-lg border border-[var(--paper-border)] bg-[var(--paper)] py-1.5 px-2 sm:px-3 text-xs sm:text-sm font-medium text-[var(--ink-muted)] hover:border-[var(--masthead)]/40 hover:text-[var(--ink)] transition-colors" />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 md:py-8">
        <AdminDashboard isSuperAdmin={role === "SUPER_ADMIN"} />
      </main>
    </div>
  );
}
