"use client";

import { useRouter, usePathname } from "next/navigation";
import { useRef, useEffect } from "react";

type Props = {
  availableDates: string[];
  selectedDate: string;
  latestDate: string;
};

export function DateStrip({ availableDates, selectedDate, latestDate }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedIndex = availableDates.indexOf(selectedDate);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || selectedIndex < 0) return;
    const child = el.children[selectedIndex] as HTMLElement;
    if (child) {
      child.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedIndex]);

  if (availableDates.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 pt-1 scroll-smooth md:flex-wrap md:justify-center"
    >
      {availableDates.slice(0, 14).map((d) => {
        const isSelected = d === selectedDate;
        const isToday = d === latestDate;
        const date = new Date(d + "T12:00:00Z");
        const dayNum = date.getDate();
        const short = date.toLocaleDateString("en-IN", { weekday: "short" });
        const full = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

        return (
          <button
            key={d}
            type="button"
            onClick={() => {
              const url = d === latestDate ? pathname : `${pathname}?date=${d}`;
              router.push(url);
            }}
            className={`flex shrink-0 flex-col items-center rounded-lg px-4 py-2 text-center transition-colors min-w-[64px] border ${
              isSelected
                ? "bg-[var(--ink)] text-white border-[var(--ink)]"
                : "bg-transparent text-[var(--ink-muted)] border-transparent hover:border-[var(--paper-border)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
            }`}
            title={full}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90">{short}</span>
            <span className="mt-0.5 text-lg font-bold leading-none">{dayNum}</span>
            {isToday && !isSelected && (
              <span className="mt-0.5 text-[10px] font-medium text-[var(--ink-muted)]">Today</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
