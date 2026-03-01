// Level thresholds: totalPagesRead -> level
// Level 1: 0–50, Level 2: 51–150, Level 3: 151–300, etc.
export const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 750, 1000, 1500, 2000, 3000] as const;

export function getLevelFromPages(totalPages: number): number {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPages >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
}

export function getProgressToNextLevel(totalPages: number): { current: number; next: number; percentage: number } {
  const level = getLevelFromPages(totalPages);
  const current = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const next = LEVEL_THRESHOLDS[level] ?? current + 500;
  const inLevel = totalPages - current;
  const needed = next - current;
  const percentage = needed > 0 ? Math.min(100, (inLevel / needed) * 100) : 100;
  return { current, next, percentage };
}

// Allowed admin domains for staff login (e.g. ["yourcompany.com"])
export const ADMIN_ALLOWED_DOMAINS = (process.env.ADMIN_ALLOWED_DOMAINS ?? "")
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

// Super admin emails (comma-separated in env)
export const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
