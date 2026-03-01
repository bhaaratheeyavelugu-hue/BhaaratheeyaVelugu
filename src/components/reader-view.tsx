"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";

import { SidebarMenu } from "@/components/sidebar-menu";

type EditionMeta = {
  id: string;
  date: Date;
  region: string;
};

type ReaderViewProps = {
  editionId: string;
  region: string;
  totalPages: number;
  date: string;
  initialPage: number;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  allEditions?: EditionMeta[];
};

type EditionData = {
  id: string;
  totalPages: number;
  pdfUrl: string | null;
  pages: { pageNumber: number; url: string }[];
};

export function ReaderView({
  editionId,
  region,
  totalPages,
  date,
  initialPage,
  isLoggedIn,
  isAdmin = false,
  allEditions = [],
}: ReaderViewProps) {
  const router = useRouter();
  const [edition, setEdition] = useState<EditionData | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [thumbnailsInitialized, setThumbnailsInitialized] = useState(false);
  const [scale, setScale] = useState(1);
  const [progressSaving, setProgressSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const lastSavedPageRef = useRef(Math.max(0, initialPage - 1));
  const currentPageRef = useRef(initialPage);
  currentPageRef.current = currentPage;

  // On desktop (md+), open thumbnails by default after mount to avoid hydration mismatch
  useEffect(() => {
    if (thumbnailsInitialized) return;
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    setShowThumbnails(isDesktop);
    if (isDesktop) setScale(1.25);
    setThumbnailsInitialized(true);
  }, [thumbnailsInitialized]);

  // Group editions for the dropdowns
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    allEditions.forEach(e => dates.add(new Date(e.date).toISOString().slice(0, 10)));
    return Array.from(dates).sort((a, b) => b.localeCompare(a));
  }, [allEditions]);

  const editionsForDate = useMemo(() => {
    return allEditions.filter(e => new Date(e.date).toISOString().slice(0, 10) === date);
  }, [allEditions, date]);

  // Fetch edition (signed URLs)
  useEffect(() => {
    setLoading(true);
    fetch(`/api/editions/${editionId}`)
      .then((r) => r.json())
      .then((data) => {
        setEdition({
          id: data.id,
          totalPages: data.totalPages,
          pdfUrl: data.pdfUrl ?? null,
          pages: data.pages ?? [],
        });
      })
      .catch(() => setEdition(null))
      .finally(() => setLoading(false));
  }, [editionId]);

  // Save reading progress
  const saveProgress = useCallback(
    async (page: number) => {
      if (!isLoggedIn || progressSaving) return;
      const lastPageRead = page - 1; // 0-based for API
      if (lastPageRead <= lastSavedPageRef.current) return;
      lastSavedPageRef.current = lastPageRead;
      setProgressSaving(true);
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editionId, lastPageRead }),
        });
      } finally {
        setProgressSaving(false);
      }
    },
    [editionId, isLoggedIn, progressSaving]
  );

  useEffect(() => {
    saveProgress(currentPage);
  }, [currentPage, saveProgress]);

  const scrollToPage = (p: number) => {
    setCurrentPage(p);
    const el = document.getElementById(`page-${p}`);
    if (el && scrollRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Scroll to initial page when content is ready
  useEffect(() => {
    if (!edition || loading) return;
    const container = scrollRef.current;
    const el = document.getElementById(`page-${initialPage}`);
    if (container && el) {
      const timeoutId = setTimeout(() => {
        el.scrollIntoView({ behavior: "auto", block: "start" });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [edition, loading, initialPage]);

  // Update current page from scroll position – attach when edition is loaded so page elements exist
  useEffect(() => {
    if (!edition || loading) return;
    const container = scrollRef.current;
    if (!container) return;

    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const pageElements = Array.from(container.querySelectorAll<HTMLElement>('[id^="page-"]'));
        if (pageElements.length === 0) return;
        const containerRect = container.getBoundingClientRect();
        const viewportCenterY = containerRect.top + containerRect.height / 2;
        let closestPage = currentPageRef.current;
        let minDistance = Infinity;

        pageElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const pageCenterY = rect.top + rect.height / 2;
          const distance = Math.abs(pageCenterY - viewportCenterY);
          if (distance < minDistance) {
            minDistance = distance;
            const num = parseInt(el.id.replace("page-", ""), 10);
            if (!Number.isNaN(num)) closestPage = num;
          }
        });

        if (closestPage !== currentPageRef.current) {
          setCurrentPage(closestPage);
        }
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [edition?.id, loading]);

  // Auto-scroll thumbnails when current page changes
  useEffect(() => {
    if (showThumbnails && thumbnailsContainerRef.current) {
      const activeThumb = document.getElementById(`thumb-${currentPage}`);
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentPage, showThumbnails]);

  const zoomIn = () => setScale(s => Math.min(s + 0.25, 4));
  const zoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const resetZoom = () => setScale(1);

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = e.target.value;
    const editionForNewDate = allEditions.find(ed => 
      new Date(ed.date).toISOString().slice(0, 10) === newDate && ed.region === region
    ) || allEditions.find(ed => new Date(ed.date).toISOString().slice(0, 10) === newDate);
    
    if (editionForNewDate) router.push(`/read/${editionForNewDate.id}`);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEditionId = e.target.value;
    router.push(`/read/${newEditionId}`);
  };

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [isStarred, setIsStarred] = useState(false);

  // Load bookmark state for current page (when edition or page changes)
  useEffect(() => {
    if (!isLoggedIn || !editionId) return;
    fetch(`/api/bookmarks?editionId=${editionId}`)
      .then((r) => r.json())
      .then((list: { pageNumber: number; id: string }[]) => {
        const onPage = list.find((b) => b.pageNumber === currentPage);
        setIsBookmarked(!!onPage);
        setBookmarkId(onPage?.id ?? null);
      })
      .catch(() => {});
  }, [isLoggedIn, editionId, currentPage]);

  // Load starred status for this edition
  useEffect(() => {
    if (!isLoggedIn || !editionId) return;
    fetch("/api/starred")
      .then((r) => r.json())
      .then((list: { editionId: string }[]) => {
        setIsStarred(list.some((s) => s.editionId === editionId));
      })
      .catch(() => {});
  }, [isLoggedIn, editionId]);

  const toggleBookmark = async () => {
    if (!isLoggedIn) {
      alert("Please sign in to bookmark pages.");
      return;
    }
    if (isBookmarked && bookmarkId) {
      const res = await fetch(`/api/bookmarks?id=${bookmarkId}`, { method: "DELETE" });
      if (res.ok) {
        setIsBookmarked(false);
        setBookmarkId(null);
      }
    } else {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editionId, pageNumber: currentPage }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(true);
        setBookmarkId(data.id ?? null);
      }
    }
  };

  const toggleStar = async () => {
    if (!isLoggedIn) {
      alert("Please sign in to star editions.");
      return;
    }
    if (isStarred) {
      const res = await fetch(`/api/starred?editionId=${editionId}`, { method: "DELETE" });
      if (res.ok) setIsStarred(false);
    } else {
      const res = await fetch("/api/starred", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editionId }),
      });
      if (res.ok) setIsStarred(true);
    }
  };

  if (loading || !edition) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center">
          <img
            src="/logo.png"
            alt="Loading"
            className="h-16 w-16 min-h-16 min-w-16 flex-shrink-0 object-contain animate-pulse opacity-50 mb-4"
          />
          <div className="font-editorial text-[var(--ink-muted)] tracking-widest uppercase text-sm">Loading Edition...</div>
        </div>
      </div>
    );
  }

  const pageUrl = edition.pages.find((p) => p.pageNumber === currentPage)?.url ?? (edition.pdfUrl || null);

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--background)] font-sans overflow-hidden" ref={containerRef}>
      
      {/* Top bar: Logo + app actions (like The Hindu top header) */}
      <header className="min-h-[3.25rem] flex shrink-0 items-center justify-between border-b border-[var(--paper-border)] bg-[var(--paper)] px-3 sm:px-4 shadow-sm z-40">
        <Link href="/" className="flex items-center gap-2 group shrink-0 min-w-0">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain transition-transform group-hover:scale-105 shrink-0" />
          <span className="hidden sm:block font-logo text-lg md:text-xl font-black text-[var(--ink)] tracking-tight pb-0.5 leading-[1.2]" style={{ overflow: "visible" }}>
            Bhaaratheeya velugu
          </span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <ThemeToggle className="hidden md:flex scale-90" />
          {!isLoggedIn ? (
            <Link href="/login" className="text-sm font-bold text-[var(--masthead)] hover:text-[var(--masthead-hover)] hidden sm:block">
              Sign In
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link href="/admin" className="text-xs font-bold text-white bg-[var(--masthead)] px-3 py-1.5 rounded hover:bg-[var(--masthead-hover)] transition-colors hidden sm:block">
                  Admin
                </Link>
              )}
              <LogoutButton className="text-xs font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)] bg-[var(--paper-border)] hover:bg-[var(--paper-elevated)] px-3 py-1.5 rounded transition-colors !p-0 !border-none hidden sm:flex items-center justify-center h-[28px] w-[70px]" />
            </div>
          )}
          <SidebarMenu session={isLoggedIn ? {} : null} isAdmin={isAdmin} />
        </div>
      </header>

      {/* Toolbar: Edition, Date, Zoom, Pages (integrated selection bars like The Hindu) */}
      <div className="flex shrink-0 items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 border-b border-[var(--paper-border)] bg-[var(--paper-elevated)] z-30">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wide whitespace-nowrap">Edition:</span>
            <select
              value={editionId}
              onChange={handleRegionChange}
              className="bg-[var(--paper)] border border-[var(--paper-border)] rounded-md px-2.5 py-1.5 text-sm font-medium text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--masthead)]/30 min-w-[7rem] sm:min-w-[9rem] cursor-pointer"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.35rem center', backgroundSize: '0.6rem auto' }}
            >
              {editionsForDate.filter(e => e.region === "Telangana" || e.region === region).map(e => <option key={e.id} value={e.id} className="bg-[var(--paper)] text-[var(--ink)]">{e.region}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wide whitespace-nowrap">Date:</span>
            <select
              value={date}
              onChange={handleDateChange}
              className="bg-[var(--paper)] border border-[var(--paper-border)] rounded-md px-2.5 py-1.5 text-sm font-medium text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--masthead)]/30 min-w-[7rem] sm:min-w-[10rem] cursor-pointer"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.35rem center', backgroundSize: '0.6rem auto' }}
            >
              {availableDates.map(d => <option key={d} value={d} className="bg-[var(--paper)] text-[var(--ink)]">{new Date(d + "T12:00:00Z").toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</option>)}
            </select>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1 mr-2 border-l border-[var(--paper-border)] pl-3">
          <button onClick={zoomOut} className="p-1.5 rounded text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)] transition-colors" title="Zoom out" aria-label="Zoom out">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
          </button>
          <span className="px-2 text-xs font-bold text-[var(--ink-secondary)] min-w-[2.5rem] text-center">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="p-1.5 rounded text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)] transition-colors" title="Zoom in" aria-label="Zoom in">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
          </button>
        </div>
        <div className="flex items-center gap-2 border-l border-[var(--paper-border)] pl-3">
          <button
            type="button"
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-semibold transition-colors ${showThumbnails ? "bg-[var(--masthead)] text-white" : "text-[var(--ink-muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            <span className="hidden sm:inline">Pages</span>
          </button>
          <span className="text-sm font-semibold text-[var(--ink-muted)]">Page <span className="text-[var(--ink)] font-bold">{currentPage}</span> of {totalPages}</span>
        </div>
      </div>

      {/* Main Content Area: Thumbnails + Reader */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Toggleable Thumbnail Strip (Left Side) */}
        <AnimatePresence>
          {showThumbnails && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 140, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="h-full bg-[var(--paper)] border-r border-[var(--paper-border)] shadow-[var(--shadow-sm)] overflow-y-auto z-20 flex-shrink-0 hide-scrollbar"
              ref={thumbnailsContainerRef}
            >
              <div className="p-3 flex flex-col gap-4">
                <div className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-widest text-center pb-2 border-b border-[var(--paper-border)]">Pages</div>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const pUrl = edition.pages.find((pg) => pg.pageNumber === p)?.url;
                  const isCurrent = p === currentPage;
                  return (
                    <button
                      key={p}
                      id={`thumb-${p}`}
                      onClick={() => scrollToPage(p)}
                      className={`relative flex flex-col items-center gap-1 group ${isCurrent ? 'opacity-100' : 'opacity-60 hover:opacity-100'} transition-opacity`}
                    >
                      <div className={`w-24 bg-[var(--paper-elevated)] border-2 ${isCurrent ? 'border-[var(--masthead)] shadow-md' : 'border-[var(--paper-border)]'} rounded overflow-hidden relative`}>
                         {pUrl && pUrl !== edition.pdfUrl ? (
                           <img src={pUrl} alt={`Thumbnail ${p}`} className="w-full h-auto object-contain" />
                         ) : (
                           <PDFPageView
                             pdfUrl={edition.pdfUrl}
                             pageUrl={edition.pdfUrl}
                             currentPage={p}
                             isThumbnail={true}
                           />
                         )}
                      </div>
                      <span className={`text-xs font-semibold ${isCurrent ? 'text-[var(--masthead)]' : 'text-[var(--ink-muted)]'}`}>{p}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Reader Canvas - smooth scroll on iOS, proper overflow */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto relative flex flex-col custom-scrollbar py-4 md:py-8 gap-6 md:gap-12 bg-[var(--paper-border)] px-2 md:px-8"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <div
              key={p}
              id={`page-${p}`}
              className="mx-auto shadow-2xl bg-[var(--paper)] border border-[var(--paper-border)] relative transition-all duration-200"
              style={{ width: `${scale * 100}%`, maxWidth: `${scale * 900}px` }}
            >
              <PDFPageView
                pdfUrl={edition.pdfUrl}
                pageUrl={edition.pages.find((pg) => pg.pageNumber === p)?.url ?? (edition.pdfUrl || null)}
                currentPage={p}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Toolbar - z below header so it never covers hamburger */}
      <footer className="h-12 shrink-0 border-t border-[var(--paper-border)] bg-[var(--paper)] px-4 flex items-center justify-between shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20">
        
        {/* Left: Thumbnails Toggle */}
        <button 
          onClick={() => setShowThumbnails(!showThumbnails)}
          className={`flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-md transition-colors ${showThumbnails ? 'bg-[var(--masthead)] text-white' : 'text-[var(--ink-muted)] hover:bg-[var(--paper-elevated)]'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          <span className="hidden sm:block">Pages</span>
        </button>

        {/* Center: Zoom Controls */}
        <div className="hidden md:flex items-center bg-[var(--paper-elevated)] rounded-lg p-1 border border-[var(--paper-border)] mx-auto absolute left-1/2 -translate-x-1/2">
           <button onClick={zoomOut} className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)] rounded shadow-sm transition-all" title="Zoom Out">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
           </button>
           <button onClick={resetZoom} className="px-3 text-xs font-bold text-[var(--ink-secondary)] hover:text-[var(--masthead)] w-14 text-center cursor-pointer">
             {Math.round(scale * 100)}%
           </button>
           <button onClick={zoomIn} className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)] rounded shadow-sm transition-all" title="Zoom In">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
           </button>
        </div>

        {/* Right: Page Navigation and Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {isLoggedIn && (
            <div className="flex items-center gap-1 mr-2 border-r border-[var(--paper-border)] pr-3">
              <button 
                onClick={toggleBookmark}
                className={`p-1.5 rounded-md transition-colors ${isBookmarked ? 'text-[var(--masthead)] bg-[var(--accent-soft)]' : 'text-[var(--ink-muted)] hover:bg-[var(--paper-elevated)] hover:text-[var(--ink)]'}`}
                title="Bookmark Page"
              >
                <svg className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              </button>
              <button 
                onClick={toggleStar}
                className={`p-1.5 rounded-md transition-colors ${isStarred ? 'text-yellow-500 bg-yellow-500/10' : 'text-[var(--ink-muted)] hover:bg-[var(--paper-elevated)] hover:text-[var(--ink)]'}`}
                title="Star Edition"
              >
                <svg className="w-5 h-5" fill={isStarred ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.898 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              </button>
            </div>
          )}
           <span className="text-sm font-semibold text-[var(--ink-muted)]">
             Page <span className="text-[var(--ink)] font-bold">{currentPage}</span> of {totalPages}
           </span>
        </div>

      </footer>
      
    </div>
  );
}

// Extracted and optimized PDF renderer
function PDFPageView({
  pdfUrl,
  pageUrl,
  currentPage,
  isThumbnail = false,
}: {
  pdfUrl: string | null;
  pageUrl: string | null;
  currentPage: number;
  isThumbnail?: boolean;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const margin = isThumbnail ? "100px" : isMobile ? "250px" : "600px";
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: margin, threshold: 0 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isThumbnail]);

  useEffect(() => {
    if (!isVisible) return;
    setErr(null);
    if (!pageUrl) {
      setImgUrl(null);
      return;
    }

    if (!pdfUrl || pageUrl !== pdfUrl) {
      setImgUrl(pageUrl);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
        const doc = await pdfjs.getDocument({ url: pageUrl }).promise;
        const page = await doc.getPage(currentPage);
        const scale = isThumbnail ? 0.3 : 2.5;
        const viewport = page.getViewport({ scale }); 
        setAspectRatio(viewport.width / viewport.height);
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // CSS will handle scaling the canvas while maintaining aspect ratio
        // canvas.style.width = `${viewport.width / scale}px`;
        // canvas.style.height = `${viewport.height / scale}px`;

        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        setImgUrl(null);
      } catch (e: any) {
        if (!cancelled) {
          console.error("PDF Render error:", e);
          setErr(`Could not load page. Error: ${e.message || e}`);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [pageUrl, currentPage, pdfUrl, isVisible]);

  if (err) {
    return (
      <div ref={containerRef} className={`flex w-full items-center justify-center text-[var(--ink-muted)] bg-[var(--paper-elevated)] ${isThumbnail ? 'h-full text-[10px]' : 'min-h-[500px]'}`}>
        <div className="text-center p-2">
           {!isThumbnail && <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
           {isThumbnail ? "Error" : err}
        </div>
      </div>
    );
  }

  const content = imgUrl ? (
    <img
      src={imgUrl}
      alt={`Page ${currentPage}`}
      className="absolute inset-0 w-full h-full object-contain"
    />
  ) : (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ objectFit: 'contain' }} />
  );

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full ${isThumbnail ? 'min-h-[60px]' : 'min-h-[500px]'} bg-[var(--paper)]`}
      style={{ aspectRatio: aspectRatio ? `${aspectRatio}` : (isThumbnail ? '2/3' : '1/1.414') }}
    >
      {!isVisible && <div className={`absolute inset-0 flex items-center justify-center text-[var(--ink-muted)] font-editorial bg-[var(--paper-elevated)]/50 ${isThumbnail ? 'text-[10px]' : ''}`}>...</div>}
      {isVisible && content}
    </div>
  );
}