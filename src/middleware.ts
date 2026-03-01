import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight middleware only (no auth import) to stay under Vercel Edge 1MB limit.
// Auth and redirects are enforced in pages and API routes (admin, profile, /api/admin, etc.).
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|apple-icon|icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
