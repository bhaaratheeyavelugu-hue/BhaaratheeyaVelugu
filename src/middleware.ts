import { auth } from "@/auth";

export default auth((req) => {
  // authorized callback in auth.ts handles redirects
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
