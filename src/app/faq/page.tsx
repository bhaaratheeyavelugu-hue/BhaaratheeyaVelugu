import { auth } from "@/auth";
import { InfoPageHeader } from "@/components/info-page-header";

const faqs = [
  {
    q: "How do I read the newspaper?",
    a: "Select your region on the home screen (e.g. Telangana). You’ll see the latest edition; tap or click to open it. Scroll down to read all pages like a PDF. Use the date selector to switch to another day.",
  },
  {
    q: "Do I need an account?",
    a: "You can read the current edition without signing in. Sign in with Google to save your reading progress, bookmark pages, and star editions. Your progress is synced across devices.",
  },
  {
    q: "Which regions are available?",
    a: "Right now we offer the Telangana edition. Andhra Pradesh and Karnataka are planned; you’ll see them marked as “Coming soon” on the region selection page.",
  },
  {
    q: "How often is the paper updated?",
    a: "New editions are published daily. The date shown on the app reflects the edition date in Indian Standard Time (IST).",
  },
  {
    q: "Can I zoom or change the layout?",
    a: "Yes. In the reader, use the zoom controls in the bottom bar to zoom in or out. The layout is continuous scroll (like a PDF), so you can read from top to bottom without flipping pages.",
  },
  {
    q: "Is there a mobile app?",
    a: "Bhaaratheeya velugu works in your mobile browser. You can add it to your home screen for quick access. A dedicated app may be offered in the future.",
  },
  {
    q: "Who do I contact for support?",
    a: "Use the Contact Us page for technical issues, feedback, or questions. We’ll get back to you as soon as we can.",
  },
];

export default async function FAQPage() {
  const session = await auth();
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <InfoPageHeader session={session} />
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-editorial text-2xl font-bold text-[var(--ink)] mb-2">Frequently Asked Questions</h1>
        <p className="text-[var(--ink-muted)] text-sm mb-8">Quick answers to common questions.</p>

        <ul className="space-y-6">
          {faqs.map((faq, i) => (
            <li key={i} className="rounded-xl border border-[var(--paper-border)] bg-[var(--paper)] p-5">
              <h2 className="font-editorial font-semibold text-[var(--ink)] mb-2">{faq.q}</h2>
              <p className="text-[var(--ink-secondary)] text-sm leading-relaxed">{faq.a}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
