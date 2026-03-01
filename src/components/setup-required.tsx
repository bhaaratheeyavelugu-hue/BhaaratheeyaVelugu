export function SetupRequired({ missing }: { missing: string[] }) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center bg-[var(--background)] p-6">
      <div className="w-full max-w-md rounded-2xl border-2 border-[var(--paper-border)] bg-[var(--paper)] p-6 shadow-[var(--shadow-card)]">
        <h1 className="font-editorial text-lg font-semibold text-[var(--ink)]">Setup required</h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Add these to <code className="rounded bg-[var(--paper-border)] px-1.5 py-0.5 text-xs">.env.local</code> in the project root, then restart the dev server.
        </p>
        <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-[var(--ink-muted)]">
          {missing.map((key) => (
            <li key={key}>
              <code className="rounded bg-[var(--paper-border)] px-1.5 py-0.5">{key}</code>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-[var(--ink-muted)]">
          See <code className="rounded bg-[var(--paper-border)] px-1 py-0.5">.env.example</code> for examples.
        </p>
      </div>
    </div>
  );
}
