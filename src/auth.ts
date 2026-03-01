import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SUPER_ADMIN_EMAILS, ADMIN_ALLOWED_DOMAINS } from "@/lib/constants";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email: string;
      image?: string | null;
      role: Role;
      level: number;
      totalPagesRead: number;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Staff",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).trim().toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
          include: { adminPermissions: true },
        });
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true; // Already validated
      if (!user.email) return false;
      const email = user.email.toLowerCase();
      const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email);
      const domain = email.split("@")[1]?.toLowerCase();
      const allowedDomain = domain && ADMIN_ALLOWED_DOMAINS.includes(domain);
      // If existing user, let them in; role is already set
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return true;
      // New user: super admin emails -> SUPER_ADMIN, allowed domain -> ADMIN, else -> USER
      return true; // Adapter will create user; we set role in jwt/session
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: (user.email ?? "").toLowerCase() },
          include: { adminPermissions: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.level = dbUser.level;
          token.totalPagesRead = dbUser.totalPagesRead;
        }
      }
      if (trigger === "update" && session) {
        token.level = session.level ?? token.level;
        token.totalPagesRead = session.totalPagesRead ?? token.totalPagesRead;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) ?? "USER";
        session.user.level = (token.level as number) ?? 1;
        session.user.totalPagesRead = (token.totalPagesRead as number) ?? 0;
      }
      return session;
    },
    authorized({ request, auth }) {
      const path = request.nextUrl.pathname;
      const isLogin = path === "/login";
      const isApiAuth = path.startsWith("/api/auth");
      const isAdmin = path.startsWith("/admin");
      const isApiAdmin = path.startsWith("/api/admin");
      if (isLogin || isApiAuth) return true;
      if (isAdmin || isApiAdmin) {
        if (!auth?.user) return NextResponse.redirect(new URL("/login", request.url));
        const role = (auth.user as { role?: string }).role;
        if (role !== "ADMIN" && role !== "SUPER_ADMIN") return NextResponse.redirect(new URL("/", request.url));
        return true;
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.email) return;
      const email = user.email.toLowerCase();
      const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email);
      const domain = email.split("@")[1]?.toLowerCase();
      const allowedDomain = domain && ADMIN_ALLOWED_DOMAINS.includes(domain);
      const role: Role = isSuperAdmin ? "SUPER_ADMIN" : allowedDomain ? "ADMIN" : "USER";
      await prisma.user.update({
        where: { email },
        data: { role },
      });
    },
  },
});
