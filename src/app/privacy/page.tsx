import Link from "next/link";
import { auth } from "@/auth";
import { InfoPageHeader } from "@/components/info-page-header";

export default async function PrivacyPage() {
  const session = await auth();
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <InfoPageHeader session={session} />
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-editorial text-2xl font-bold text-[var(--ink)] mb-2">Privacy Policy</h1>
        <p className="text-[var(--ink-muted)] text-sm mb-8">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

        <div className="space-y-6 text-[var(--ink-secondary)] text-sm">
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">1. Information we collect</h2>
            <p>When you use Bhaaratheeya velugu we may collect: (a) information you provide when signing in (e.g. name, email from Google); (b) reading progress and preferences (e.g. last page read, bookmarks); (c) technical data such as device type and IP address for security and analytics.</p>
          </section>
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">2. How we use it</h2>
            <p>We use this information to provide the service (e.g. syncing progress, showing your profile), to improve the product, and to communicate with you about the service. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">3. Cookies and local storage</h2>
            <p>We use cookies or local storage for purposes such as remembering your region choice and theme (light/dark). Sign-in and session data are handled securely. You can clear cookies via your browser settings.</p>
          </section>
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">4. Third parties</h2>
            <p>If you sign in with Google, Google’s privacy policy applies to that sign-in. We may use analytics or hosting providers that process data on our behalf under strict agreements.</p>
          </section>
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">5. Data retention and security</h2>
            <p>We retain your data for as long as your account is active or as needed to provide the service and comply with law. We take reasonable steps to protect your data from unauthorized access or loss.</p>
          </section>
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">6. Your rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data where applicable by law. Contact us via the <Link href="/contact" className="text-[var(--masthead)] hover:underline">Contact Us</Link> page.</p>
          </section>
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">7. Changes</h2>
            <p>We may update this privacy policy from time to time. The “Last updated” date will be revised, and we encourage you to review this page periodically.</p>
          </section>
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">8. Contact</h2>
            <p>For privacy-related questions, please use the <Link href="/contact" className="text-[var(--masthead)] hover:underline">Contact Us</Link> page.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
