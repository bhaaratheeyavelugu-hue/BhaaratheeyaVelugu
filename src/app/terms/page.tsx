import Link from "next/link";
import { auth } from "@/auth";
import { InfoPageHeader } from "@/components/info-page-header";

export default async function TermsPage() {
  const session = await auth();
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <InfoPageHeader session={session} />
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-editorial text-2xl font-bold text-[var(--ink)] mb-2">Terms and Conditions</h1>
        <p className="text-[var(--ink-muted)] text-sm mb-8">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

        <div className="space-y-6 text-[var(--ink-secondary)] text-sm">
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">1. Acceptance of terms</h2>
            <p>By using Bhaaratheeya velugu (“the service”), you agree to these Terms and Conditions. If you do not agree, please do not use the service.</p>
          </section>
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">2. Use of the service</h2>
            <p>You may use the service to read digital editions of the newspaper for personal, non-commercial use. You may not copy, redistribute, or commercially exploit the content without permission. You are responsible for keeping your account credentials secure.</p>
          </section>
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">3. Content and accuracy</h2>
            <p>Content is published as received from the publisher. We do not guarantee the accuracy or completeness of any article or edition. Views expressed in articles are those of the authors or sources, not necessarily of Bhaaratheeya velugu.</p>
          </section>
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">4. Availability</h2>
            <p>The service is provided “as is.” We strive for uptime but do not guarantee uninterrupted access. We may modify, suspend, or discontinue the service or any feature with reasonable notice where possible.</p>
          </section>
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">5. Limitation of liability</h2>
            <p>To the extent permitted by law, Bhaaratheeya velugu and its providers shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
          </section>
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">6. Changes</h2>
            <p>We may update these terms from time to time. The “Last updated” date at the top will be revised. Continued use of the service after changes constitutes acceptance of the updated terms.</p>
          </section>
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">7. Contact</h2>
            <p>For questions about these terms, please use the <Link href="/contact" className="text-[var(--masthead)] hover:underline">Contact Us</Link> page.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
