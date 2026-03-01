import { auth } from "@/auth";
import { InfoPageHeader } from "@/components/info-page-header";

export default async function SearchPage() {
  const session = await auth();
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <InfoPageHeader session={session} />
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-editorial text-2xl font-bold text-[var(--ink)] mb-2">Search</h1>
        <p className="text-[var(--ink-muted)] text-sm mb-6">Search across past and current editions.</p>
        <div className="rounded-xl border border-[var(--paper-border)] bg-[var(--paper)] p-6 text-[var(--ink-secondary)] text-sm space-y-4">
          <p><strong className="text-[var(--ink)]">Search is coming soon.</strong> We are building the ability to search articles, headlines, and dates across all regional editions.</p>
          <p>Until then, you can:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Use the <strong className="text-[var(--ink)]">date selector</strong> on the home or reader page to jump to a specific edition.</li>
            <li>Choose your <strong className="text-[var(--ink)]">region</strong> (e.g. Telangana) to see that edition’s front page and open the full paper.</li>
            <li>Scroll through the PDF-style reader to browse the full edition page by page.</li>
          </ul>
          <p className="pt-2">Thank you for your patience.</p>
        </div>
      </main>
    </div>
  );
}
