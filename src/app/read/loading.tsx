export default function ReadLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] gap-4">
      <img src="/logo.png" alt="" className="h-14 w-14 object-contain animate-pulse opacity-70" />
      <p className="text-sm font-medium text-[var(--ink-muted)] uppercase tracking-wider">Loading edition…</p>
    </div>
  );
}
