"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isProfile = pathname === "/profile";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-[var(--paper-border)] bg-[var(--paper)] py-2 safe-area-pb md:hidden"
      aria-label="Main navigation"
    >
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
          isHome ? "text-[var(--masthead)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
        }`}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Home
      </Link>
      <Link
        href="/profile"
        className={`flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
          isProfile ? "text-[var(--masthead)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
        }`}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Profile
      </Link>
    </nav>
  );
}
