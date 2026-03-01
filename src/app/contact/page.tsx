import { auth } from "@/auth";
import { InfoPageHeader } from "@/components/info-page-header";

export default async function ContactPage() {
  const session = await auth();
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <InfoPageHeader session={session} />
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-editorial text-2xl font-bold text-[var(--ink)] mb-2">Contact Us</h1>
        <p className="text-[var(--ink-muted)] text-sm mb-6">Get in touch with our team.</p>

        <div className="space-y-6 text-[var(--ink-secondary)] text-sm">
          <section className="rounded-xl border border-[var(--paper-border)] bg-[var(--paper)] p-6">
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-3">General enquiries</h2>
            <p className="mb-2">For reader feedback, subscription questions, or technical support:</p>
            <p className="text-[var(--masthead)] font-medium">contact@bhaaratheeyavelugu.com</p>
            <p className="mt-2 text-[var(--ink-muted)]">We aim to respond within 2–3 business days.</p>
          </section>
          <section className="rounded-xl border border-[var(--paper-border)] bg-[var(--paper)] p-6">
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-3">Advertising & partnerships</h2>
            <p className="mb-2">For advertising or partnership inquiries:</p>
            <p className="text-[var(--masthead)] font-medium">ads@bhaaratheeyavelugu.com</p>
          </section>
          <section className="rounded-xl border border-[var(--paper-border)] bg-[var(--paper)] p-6">
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-3">Editorial / press</h2>
            <p className="mb-2">For press or editorial matters:</p>
            <p className="text-[var(--masthead)] font-medium">editorial@bhaaratheeyavelugu.com</p>
          </section>
          <p className="text-[var(--ink-muted)] text-xs">Address and phone numbers will be updated here when available.</p>
        </div>
      </main>
    </div>
  );
}
