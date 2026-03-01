"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { DateStrip } from "@/components/date-strip";
import { SidebarMenu } from "@/components/sidebar-menu";
import { STATES } from "@/lib/states";

type Edition = {
  id: string;
  date: Date;
  totalPages: number;
  region: string;
};

type Props = {
  editions: Edition[];
  continueReading: { editionId: string; lastPageRead: number; totalPages: number } | null;
  session: { user?: { name?: string | null; email?: string | null; image?: string | null; role?: string } } | null;
  isAdmin: boolean;
  availableDates: string[];
  selectedDate: string;
  latestDate: string;
};

export function NewspaperHome({ editions, continueReading, session, isAdmin, availableDates, selectedDate, latestDate }: Props) {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem("userState");
    if (savedState) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedState(savedState);
    }
    
    // We intentionally delay setting loaded to avoid hydration mismatch
    // and we're okay with the slight render impact here because it's a one-time mount task
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, []);

  const handleStateSelect = (stateName: string) => {
    localStorage.setItem("userState", stateName);
    setSelectedState(stateName);
  };

  if (!isLoaded) return null;

  // Entry Screen (State Selection)
  if (!selectedState) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[var(--background)]">
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <img src="/logo.png" alt="Logo" className="mx-auto mb-6 h-24 w-24 object-contain" />
            <h1 className="font-logo text-4xl md:text-6xl text-[var(--ink)] tracking-tight mb-4">Bhaaratheeya velugu</h1>
            <p className="text-[var(--ink-muted)] uppercase tracking-[0.2em] text-sm md:text-base mb-12">Select your region to continue</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            <AnimatePresence>
              {STATES.map((s, i) => (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  onClick={() => !s.comingSoon && handleStateSelect(s.name)}
                  disabled={s.comingSoon}
                  className={`group relative overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[3/4] shadow-[var(--shadow-card)] transition-all duration-500 border border-[var(--paper-border)] bg-[var(--paper-elevated)] ${s.comingSoon ? "cursor-not-allowed opacity-60" : "hover:shadow-[var(--shadow-modal)] hover:border-[var(--masthead)]"}`}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-[var(--ink)]">
                    <div className={`mb-6 flex items-center justify-center w-20 h-20 md:w-28 md:h-28 transition-transform duration-300 ${s.comingSoon ? "opacity-50 [filter:grayscale(1)]" : "group-hover:scale-110"}`}>
                      <img src={s.image} alt="" className="w-full h-full object-contain" loading="lazy" decoding="async" aria-hidden />
                    </div>
                    
                    <h2 className="font-editorial text-2xl md:text-3xl font-bold tracking-wide text-center">{s.name}</h2>
                    
                    {s.comingSoon ? (
                      <span className="mt-4 px-6 py-2 rounded-full bg-[var(--paper-border)] text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                        Coming Soon
                      </span>
                    ) : (
                      <span className="mt-4 px-6 py-2 rounded-full bg-[var(--masthead)] text-white text-xs font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-md">
                        Read Edition
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Filter editions for selected state (rough fallback if exact match not found)
  const stateEditions = editions.filter(e => e.region.toLowerCase().includes(selectedState.toLowerCase())) || [];
  const featuredEditions = stateEditions.length > 0 ? stateEditions : editions;
  const featured = featuredEditions[0];
  const others = featuredEditions.slice(1);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Top Utility Bar */}
      <div className="border-b border-[var(--paper-border)] bg-[var(--background)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-[var(--ink-muted)] flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="hidden md:inline-block border-l border-[var(--paper-border)] pl-4">{new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
          <div className="flex items-center gap-2 border-l border-[var(--paper-border)] pl-4">
            <span>Region:</span>
            <select
              value={selectedState || ""}
              onChange={(e) => handleStateSelect(e.target.value)}
              className="bg-transparent text-[var(--masthead)] font-bold focus:outline-none cursor-pointer text-sm md:text-base min-w-[120px]"
            >
              {STATES.filter((s) => !s.comingSoon).map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
          <div className="flex items-center gap-4 ml-auto">
          <ThemeToggle className="!p-0 !text-[var(--ink-muted)] hover:!text-[var(--ink)] scale-90" />
          {session ? (
            <>
              {isAdmin && <Link href="/admin" className="hover:text-[var(--ink)] transition-colors hidden md:block">Admin</Link>}
              <Link href="/profile" className="hover:text-[var(--ink)] transition-colors hidden md:block">Profile</Link>
              <LogoutButton className="hover:text-[var(--ink)] transition-colors !p-0 !border-none !bg-transparent hidden md:block" />
            </>
          ) : (
            <Link href="/login" className="text-[var(--masthead)] font-bold hover:underline hidden md:block">Sign In</Link>
          )}
          <SidebarMenu session={session} isAdmin={isAdmin} />
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-[var(--paper)] border-b border-[var(--paper-border)] py-6 md:py-8 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-4 group">
            <img src="/logo.png" alt="Logo" className="h-14 w-14 object-contain transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <h1 className="font-logo text-4xl md:text-5xl text-[var(--ink)] leading-none tracking-tight">Bhaaratheeya velugu</h1>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--ink-muted)] mt-1">Digital Newspaper</span>
            </div>
          </Link>
          
          <div className="w-full md:w-auto overflow-hidden">
            <DateStrip availableDates={availableDates} selectedDate={selectedDate} latestDate={latestDate} />
          </div>
        </div>
      </header>

      {/* Main Content - Full Screen Featured Experience */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Featured Front Page (Hero) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex items-end justify-between mb-4">
            <h2 className="font-editorial text-2xl font-bold text-[var(--ink)] border-l-4 border-[var(--masthead)] pl-3 leading-none">
              Today&apos;s Front Page
            </h2>
            {featured && (
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--masthead)] bg-[var(--accent-soft)] px-3 py-1 rounded-full">
                {featured.region} Edition
              </span>
            )}
          </div>

          {featured ? (
            <Link href={`/read/${featured.id}`} className="group relative block w-full bg-[var(--paper-elevated)] border border-[var(--paper-border)] p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-modal)] transition-all duration-500 rounded-lg">
              {/* Realistic Newspaper Mockup */}
              <div className="w-full aspect-[2/3] bg-[#fcfbf8] border border-gray-200 shadow-inner p-6 flex flex-col relative overflow-hidden">
                 <div className="border-b-4 border-gray-900 pb-4 mb-6 text-center">
                    <h1 className="font-logo text-5xl md:text-7xl text-gray-900 leading-none">Bhaaratheeya velugu</h1>
                    <div className="flex justify-between items-center mt-3 border-y border-gray-300 py-1 px-2">
                      <span className="text-[8px] md:text-[10px] uppercase text-gray-600">{featured.region}</span>
                      <span className="text-[8px] md:text-[10px] text-gray-600">{new Date(new Date(featured.date).toISOString().slice(0, 10) + "T12:00:00Z").toLocaleDateString()}</span>
                      <span className="text-[8px] md:text-[10px] uppercase text-gray-600">{featured.totalPages} Pages</span>
                    </div>
                 </div>
                 
                 {/* CSS Article Layout Mockup */}
                 <div className="flex-1 flex gap-6 opacity-80">
                    <div className="w-2/3 flex flex-col gap-4">
                      <div className="w-full aspect-video bg-gray-300 relative">
                         <div className="absolute bottom-0 left-0 bg-black/70 text-white text-[10px] p-2 w-full">Breaking News Highlight</div>
                      </div>
                      <h2 className="font-editorial text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Major Development Announced for {featured.region} Region</h2>
                      <div className="flex flex-col gap-2">
                        <div className="h-3 bg-gray-200 w-full"></div>
                        <div className="h-3 bg-gray-200 w-full"></div>
                        <div className="h-3 bg-gray-200 w-11/12"></div>
                        <div className="h-3 bg-gray-200 w-full"></div>
                        <div className="h-3 bg-gray-200 w-4/5"></div>
                      </div>
                    </div>
                    <div className="w-1/3 flex flex-col gap-4 border-l border-gray-300 pl-6">
                      <h3 className="font-editorial text-xl font-bold text-gray-900 leading-tight">Key Policy Changes Explained</h3>
                      <div className="flex flex-col gap-2">
                        <div className="h-2 bg-gray-200 w-full"></div>
                        <div className="h-2 bg-gray-200 w-11/12"></div>
                        <div className="h-2 bg-gray-200 w-full"></div>
                      </div>
                      <div className="w-full aspect-square bg-gray-300 mt-4"></div>
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="h-2 bg-gray-200 w-full"></div>
                        <div className="h-2 bg-gray-200 w-5/6"></div>
                      </div>
                    </div>
                 </div>
                 
                 {/* Read Overlay */}
                 <div className="absolute inset-0 bg-[var(--masthead)]/0 group-hover:bg-[var(--masthead)]/5 backdrop-blur-[0px] transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 bg-[var(--masthead)] text-white px-8 py-4 rounded-full font-bold shadow-xl flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      Read Full Edition
                    </div>
                 </div>
              </div>
            </Link>
          ) : (
            <div className="w-full aspect-[2/3] bg-[var(--paper-border)] rounded-lg flex items-center justify-center flex-col">
               <svg className="w-16 h-16 text-[var(--ink-muted)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 7H20z" /></svg>
               <p className="text-[var(--ink-muted)] font-editorial text-xl">No edition available for this date.</p>
            </div>
          )}
        </div>

        {/* Right Column: District Editions / Continue Reading */}
        <div className="lg:col-span-4 flex flex-col gap-8 w-full">
          
          {continueReading && session && (
            <div className="bg-[var(--masthead)] text-white rounded-2xl p-6 shadow-[var(--shadow-card)] relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
              </div>
              <h3 className="font-editorial text-xl font-bold mb-2 relative z-10">Pick up where you left off</h3>
              <p className="text-sm text-blue-100 mb-6 relative z-10">Page {continueReading.lastPageRead + 1} of {continueReading.totalPages}</p>
              <Link href={`/read/${continueReading.editionId}`} className="inline-block bg-white text-[var(--masthead)] font-bold px-6 py-2.5 rounded-full hover:bg-blue-50 transition-colors relative z-10 text-sm w-full text-center">
                Resume Reading
              </Link>
            </div>
          )}

          <div>
            <h3 className="font-editorial text-xl font-bold text-[var(--ink)] mb-4 border-b border-[var(--paper-border)] pb-2">
              Other Editions
            </h3>
            {others.length > 0 ? (
              <div className="flex flex-col gap-4">
                {others.map(e => (
                  <Link key={e.id} href={`/read/${e.id}`} className="flex items-center gap-4 group p-3 rounded-xl hover:bg-[var(--paper-elevated)] hover:shadow-[var(--shadow-sm)] border border-transparent hover:border-[var(--paper-border)] transition-all">
                    <div className="w-16 h-20 bg-[#fdfcf8] border border-gray-200 shadow-sm flex flex-col p-1 flex-shrink-0 relative overflow-hidden">
                       <div className="border-b border-gray-800 pb-0.5 mb-1 text-center">
                         <span className="font-logo text-[6px] text-gray-900 leading-none block">Bhaaratheeya velugu</span>
                       </div>
                       <div className="flex gap-1 flex-1">
                         <div className="w-1/2 bg-gray-200 h-full"></div>
                         <div className="w-1/2 bg-gray-200 h-full"></div>
                       </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--ink)] group-hover:text-[var(--masthead)] transition-colors">{e.region}</h4>
                      <p className="text-xs text-[var(--ink-muted)] mt-1">{e.totalPages} Pages</p>
                    </div>
                    <svg className="w-5 h-5 ml-auto text-[var(--ink-muted)] group-hover:text-[var(--masthead)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[var(--ink-muted)] text-sm italic">No other editions published today.</p>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
