import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatePicker } from "@/components/state-picker";

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