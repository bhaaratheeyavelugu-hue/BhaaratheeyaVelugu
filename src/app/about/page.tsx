import { auth } from "@/auth";
import { InfoPageHeader } from "@/components/info-page-header";

export default async function AboutPage() {
  const session = await auth();
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <InfoPageHeader session={session} />
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-editorial text-2xl font-bold text-[var(--ink)] mb-2">About Us</h1>
        <p className="text-[var(--ink-muted)] text-sm mb-6">Our story and mission.</p>

        <div className="prose prose-invert max-w-none space-y-6 text-[var(--ink-secondary)] text-sm">
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">What is Bhaaratheeya velugu?</h2>
            <p>Bhaaratheeya velugu is a digital newspaper platform that brings you the daily newspaper as it is printed. We deliver regional editions so you can read your local paper on any device—phone, tablet, or desktop—with a simple, readable experience.</p>
          </section>
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">Our mission</h2>
            <p>We aim to make quality journalism and daily editions accessible to everyone. By moving the newspaper online, we keep the same layout and content you expect from print, with the convenience of scrolling, zooming, and reading on the go.</p>
          </section>
          <section>
            <h2 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-2">What we offer</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Daily editions by region (starting with Telangana; more regions coming soon).</li>
              <li>PDF-style continuous scrolling—read like a real newspaper.</li>
              <li>Progress tracking and bookmarks when you sign in.</li>
              <li>Light and dark mode for comfortable reading.</li>
            </ul>
          </section>
          <section>
            <p className="text-[var(--ink-muted)]">Thank you for reading with us.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
