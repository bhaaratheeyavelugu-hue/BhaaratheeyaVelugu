import { NextResponse } from "next/server";
import { getLatestEditionIdByRegion } from "@/lib/data";

/** Lightweight: returns only { id } for the latest published edition in the region. Use for fast region selection. */
export async function GET(request: Request) {
  const region = new URL(request.url).searchParams.get("region");
  if (!region?.trim()) return NextResponse.json({ error: "region required" }, { status: 400 });
  const latestId = await getLatestEditionIdByRegion(region.trim());
  if (!latestId) return NextResponse.json(null);
  return NextResponse.json({ id: latestId });
}
