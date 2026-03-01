"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarMenu } from "@/components/sidebar-menu";

type Props = {
  session: { user?: { name?: string | null; email?: string | null; image?: string | null; role?: string } } | null;
};

export function InfoPageHeader({ session }: Props) {
  const isAdmin =
    session?.user && ((session.user as { role?: string }).role === "ADMIN" || (session.user as { role?: string }).role === "SUPER_ADMIN");

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--paper-border)] bg-[var(--paper)] px-3 sm:px-4 py-3">
      <div className="mx-auto w-full max-w-7xl flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 min-w-0 shrink">
          <BrandLogo href="/" showText={true} size="md" asLink={false} className="[&_span]:text-[var(--ink)] [&_img]:shrink-0" />
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle className="scale-90" />
          {!session ? (
            <Link
              href="/login"
              className="text-sm font-semibold text-[var(--masthead)] hover:text-[var(--masthead-hover)] hidden sm:inline"
            >
              Sign In
            </Link>
          ) : null}
          <SidebarMenu session={session} isAdmin={!!isAdmin} />
        </div>
      </div>
    </header>
  );
}
