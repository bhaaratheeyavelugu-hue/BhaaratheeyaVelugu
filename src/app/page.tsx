import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { prisma } from "@/lib/prisma";

const StatePicker = dynamic(
  () => import("@/components/state-picker").then((m) => ({ default: m.StatePicker })),
  { loading: () => <HomeSkeleton /> }
);

function HomeSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--background)] min-h-screen">
      <img src="/logo.png" alt="" className="h-16 w-16 object-contain animate-pulse opacity-80 mb-4" />
      <p className="text-sm font-medium text-[var(--ink-muted)] uppercase tracking-wider">Loading…</p>
    </div>
  );
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const regionCookie = cookieStore.get("userRegion")?.value;

  if (regionCookie) {
    // Attempt to find the latest edition for this region
    // Note: We use contains since the exact DB string might differ (e.g. "Andhra Pradesh - Main")
    const latestEdition = await prisma.edition.findFirst({
      where: { 
        isPublished: true, 
        region: { contains: regionCookie } 
      },
      orderBy: { date: "desc" }
    });

    if (latestEdition) {
      redirect(`/read/${latestEdition.id}`);
    }
  }

  // If no cookie, or no edition found for their region, show the picker
  return <StatePicker />;
}