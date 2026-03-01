# ePaper – Mobile-First Digital Newspaper Platform

A production-ready digital newspaper (ePaper) platform with Google OAuth, role-based admin/staff, daily reading progress, bookmarks, starred editions, and a level-based gamification system.

## Features

- **Readers**: Google Sign-In only; read editions, bookmark pages, star editions, track progress, earn levels
- **Staff/Admin**: Email + password or Google (restricted domain); manage content, publish editions
- **Super Admin**: Create/remove staff, assign permissions, full system control
- **Mobile-first**: PWA-ready, clean reading UI, progress bar, continue reading, offline-friendly layout

## Tech Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Framer Motion, PDF.js
- **Backend**: NextAuth.js v5 (Google OAuth + Credentials), Prisma ORM
- **Database**: PostgreSQL
- **Storage**: AWS S3 or Cloudflare R2 (signed URLs, CDN)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and set:

- `DATABASE_URL` – PostgreSQL connection string
- `AUTH_SECRET` – e.g. `openssl rand -base64 32`
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` – from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (OAuth 2.0 Client)
- `SUPER_ADMIN_EMAILS` – comma-separated emails that become Super Admin on first Google sign-in
- `ADMIN_ALLOWED_DOMAINS` – (optional) domains allowed to become Admin on first Google sign-in
- For uploads: AWS or R2 credentials and bucket (see `.env.example`)

### 3. Database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. First Super Admin

- Add your email to `SUPER_ADMIN_EMAILS` in `.env.local`
- Sign in once via **User Login** tab with Google → you become Super Admin
- Then open **Admin** (or go to `/admin`), and use **Users & Staff** → **Add staff** to create admin accounts with email/password (Staff Login tab)

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## PWA Icons

Add `public/icon-192.png` and `public/icon-512.png` for PWA install. The manifest is at `public/manifest.json`.

## Project Structure

- `src/app` – App Router pages (home, login, profile, admin, read/[id])
- `src/auth.ts` – NextAuth config (Google + Credentials, roles, authorized callback)
- `src/components` – ReaderView, AdminDashboard, Providers
- `src/lib` – prisma, constants (levels), storage (S3/R2)
- `prisma/schema.prisma` – User, Edition, ReadingProgress, Bookmark, StarredEdition, AdminPermissions

## API Overview

- `GET/POST /api/progress` – Reading progress (per edition)
- `GET/POST/DELETE /api/bookmarks` – Page bookmarks
- `GET/POST/DELETE /api/starred` – Starred editions
- `GET /api/editions`, `GET /api/editions/[id]` – List and get edition (signed page URLs)
- `GET/POST /api/admin/editions` – Admin: list, upload PDF
- `PATCH/DELETE /api/admin/editions/[id]` – Publish/unpublish, delete
- `GET/POST /api/admin/users`, `PATCH/DELETE /api/admin/users/[id]` – Super Admin: users and staff

## Deployment

- Set `NEXTAUTH_URL` to your production URL
- Run `npx prisma migrate deploy` and ensure `DATABASE_URL` is set
- Configure S3 or R2 for edition uploads
- Optional: use Next.js middleware (current `src/middleware.ts`) for admin route protection

## License

Private / your choice.
