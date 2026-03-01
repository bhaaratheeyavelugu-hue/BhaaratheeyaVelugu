"use client";

import { useRouter, usePathname } from "next/navigation";

type Props = {
  availableDates: string[];
  selectedDate: string;
  latestDate: string;
};

export function DateSelector({ availableDates, selectedDate, latestDate }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  if (availableDates.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-[var(--ink-muted)]">Date</span>
      <select
        className="rounded-xl border-2 border-[var(--paper-border)] bg-[var(--paper)] px-3 py-2 text-sm font-medium text-[var(--ink)] focus:border-[var(--masthead)] focus:outline-none focus:ring-2 focus:ring-[var(--masthead)]/20"
        value={selectedDate}
        onChange={(e) => {
          const v = e.target.value;
          const url = v === latestDate ? pathname : `${pathname}?date=${v}`;
          router.push(url);
        }}
      >
        {availableDates.map((d) => (
          <option key={d} value={d}>
            {new Date(d + "T12:00:00Z").toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </option>
        ))}
      </select>
    </div>
  );
}
