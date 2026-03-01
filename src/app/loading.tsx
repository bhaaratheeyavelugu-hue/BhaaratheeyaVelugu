export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] gap-4">
      <div className="h-12 w-12 rounded-full border-2 border-[var(--masthead)] border-t-transparent animate-spin" />
      <p className="text-sm font-medium text-[var(--ink-muted)]">Loading…</p>
    </div>
  );
}
