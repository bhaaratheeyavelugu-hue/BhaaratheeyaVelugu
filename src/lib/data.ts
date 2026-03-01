import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const getLatestEditionIdByRegion = unstable_cache(
  async (region: string) => {
    const edition = await prisma.edition.findFirst({
      where: { isPublished: true, region: { contains: region } },
      orderBy: { date: "desc" },
      select: { id: true },
    });
    return edition?.id || null;
  },
  ["latest-edition-by-region"],
  { revalidate: 300 } // Cache for 5 minutes
);

export const getAllPublishedEditions = unstable_cache(
  async () => {
    return await prisma.edition.findMany({
      where: { isPublished: true },
      select: { id: true, date: true, region: true },
      orderBy: [{ date: "desc" }, { region: "asc" }],
    });
  },
  ["all-published-editions"],
  { revalidate: 300 } // Cache for 5 minutes
);
