"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LogoutButton } from "./logout-button";

type Props = {
  session: { user?: { name?: string | null, email?: string | null, image?: string | null, role?: string } } | null;
  isAdmin: boolean;
};

export function SidebarMenu({ session, isAdmin }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-[var(--paper-elevated)] rounded-lg transition-colors flex items-center justify-center text-[var(--ink)] md:hidden relative z-50"
        aria-label="Open Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop Menu Link (optional, or you can use the hamburger on desktop too) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex p-1.5 hover:bg-[var(--paper-elevated)] rounded transition-colors text-[var(--ink)]"
        aria-label="Open Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-[var(--background)] shadow-2xl z-[101] flex flex-col overflow-y-auto"
            >
              <div className="p-4 border-b border-[var(--paper-border)] flex items-center justify-between bg-[var(--paper-elevated)]">
                <div className="flex items-center min-w-0">
                  <span className="font-logo text-xl text-[var(--ink)] tracking-tight overflow-visible leading-[1.2] pb-0.5">Bhaaratheeya velugu</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-[var(--paper-border)] rounded-full text-[var(--ink-muted)] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col py-2 flex-1 text-[var(--ink)]">
                <div className="px-6 py-3">
                  <p className="text-xs font-bold text-[var(--ink-muted)] uppercase tracking-wider mb-2">Navigation</p>
                  <Link href="/" onClick={() => setIsOpen(false)} className="block py-2.5 hover:text-[var(--masthead)] font-medium">Home</Link>
                  {session && (
                    <Link href="/profile" onClick={() => setIsOpen(false)} className="block py-2.5 hover:text-[var(--masthead)] font-medium">My Profile</Link>
                  )}
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setIsOpen(false)} className="block py-2.5 hover:text-[var(--masthead)] font-medium">Admin Dashboard</Link>
                  )}
                </div>

                <div className="border-t border-[var(--paper-border)] my-2"></div>

                <div className="px-6 py-3">
                  <p className="text-xs font-bold text-[var(--ink-muted)] uppercase tracking-wider mb-2">Information</p>
                  <Link href="/about" onClick={() => setIsOpen(false)} className="block py-2.5 text-[var(--ink-secondary)] hover:text-[var(--masthead)] text-sm">About Us</Link>
                  <Link href="/contact" onClick={() => setIsOpen(false)} className="block py-2.5 text-[var(--ink-secondary)] hover:text-[var(--masthead)] text-sm">Contact Us</Link>
                  <Link href="/faq" onClick={() => setIsOpen(false)} className="block py-2.5 text-[var(--ink-secondary)] hover:text-[var(--masthead)] text-sm">FAQ</Link>
                  <Link href="/terms" onClick={() => setIsOpen(false)} className="block py-2.5 text-[var(--ink-secondary)] hover:text-[var(--masthead)] text-sm">Terms and Conditions</Link>
                  <Link href="/privacy" onClick={() => setIsOpen(false)} className="block py-2.5 text-[var(--ink-secondary)] hover:text-[var(--masthead)] text-sm">Privacy Policy</Link>
                </div>

                <div className="border-t border-[var(--paper-border)] my-2"></div>
                
                <div className="px-6 py-4 mt-auto">
                  {session ? (
                    <div className="w-full">
                      <LogoutButton className="w-full justify-start text-[var(--accent)] hover:bg-[var(--accent-soft)] py-3 rounded-lg border border-[var(--paper-border)]" />
                    </div>
                  ) : (
                    <Link 
                      href="/login" 
                      onClick={() => setIsOpen(false)} 
                      className="block w-full text-center bg-[var(--masthead)] text-white font-medium py-3 rounded-lg hover:bg-[var(--masthead-hover)] transition-colors"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
