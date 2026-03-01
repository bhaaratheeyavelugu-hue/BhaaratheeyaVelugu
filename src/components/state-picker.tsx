"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { STATES } from "@/lib/states";

export function StatePicker() {
  const router = useRouter();
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (stateName: string) => {
    if (typeof window === "undefined" || loading) return;
    setLoading(true);
    try {
      if (remember) {
        document.cookie = `userRegion=${stateName}; path=/; max-age=${60 * 60 * 24 * 30}`;
      } else {
        document.cookie = "userRegion=; path=/; max-age=0";
      }
      const res = await fetch(`/api/editions?region=${encodeURIComponent(stateName)}`);
      const editions = await res.json();
      if (editions?.length > 0) {
        router.push(`/read/${editions[0].id}`);
      } else {
        setLoading(false);
        alert(`No published editions found for ${stateName}`);
      }
    } catch (err) {
      console.error("Failed to fetch edition", err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--background)] min-h-screen overflow-hidden">
      {/* Logo and title always visible at top - not pushed off on mobile */}
      <div className="shrink-0 pt-4 pb-2 px-4 text-center border-b border-[var(--paper-border)] bg-[var(--background)]">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="mb-3 h-14 w-14 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain"
          />
          <h1 className="font-logo font-black text-3xl sm:text-5xl md:text-7xl text-[var(--ink)] tracking-tight leading-tight">
            Bhaaratheeya velugu
          </h1>
          <p className="text-[var(--ink-muted)] uppercase tracking-[0.2em] text-xs md:text-sm font-semibold mt-1">
            Digital Edition
          </p>
        </motion.div>
      </div>

      {/* Scrollable region cards - no justify-center so content flows from top */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="w-full max-w-5xl mx-auto px-4 py-6 md:py-10 flex flex-col items-center"
        >
          <h2 className="text-center font-editorial text-xl md:text-3xl text-[var(--ink)] mb-6 font-bold">
            {loading ? "Loading…" : "Select your region"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 w-full">
            {STATES.map((s, i) => (
              <motion.button
                key={s.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                onClick={() => !s.comingSoon && !loading && handleSelect(s.name)}
                disabled={s.comingSoon || loading}
                className={`group relative overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[3/4] border transition-all duration-300 shadow-[var(--shadow-card)] bg-[var(--paper-elevated)] border-[var(--paper-border)] ${s.comingSoon ? "cursor-not-allowed opacity-60" : loading ? "cursor-wait opacity-80" : "hover:shadow-[var(--shadow-modal)] hover:border-[var(--masthead)]"}`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-6 text-[var(--ink)]">
                  <div
                    className={`mb-3 md:mb-6 flex items-center justify-center w-16 h-16 md:w-24 md:h-24 transition-colors ${s.comingSoon ? "opacity-50 [filter:grayscale(1)]" : "text-[var(--masthead)]"}`}
                  >
                    <img
                      src={s.image}
                      alt=""
                      className="w-full h-full object-contain"
                      aria-hidden
                    />
                  </div>
                  <h2 className="font-editorial text-lg md:text-2xl font-bold tracking-wide text-center">
                    {s.name}
                  </h2>
                  {s.comingSoon ? (
                    <span className="mt-3 px-4 py-1.5 rounded-full bg-[var(--paper-border)] text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                      Coming Soon
                    </span>
                  ) : (
                    <span className="mt-3 px-4 py-1.5 rounded-full bg-[var(--masthead)] text-white text-xs font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Select
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          <motion.label
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 md:mt-8 flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-[var(--paper-border)] text-[var(--masthead)] focus:ring-[var(--masthead)]"
            />
            <span className="text-sm font-medium text-[var(--ink-muted)] select-none">
              Remember my choice
            </span>
          </motion.label>
        </motion.div>
      </div>
      <div className="shrink-0 py-3 text-center text-xs text-[var(--ink-muted)] uppercase tracking-widest bg-[var(--background)] border-t border-[var(--paper-border)]">
        Read the paper as it is printed
      </div>
    </div>
  );
}
