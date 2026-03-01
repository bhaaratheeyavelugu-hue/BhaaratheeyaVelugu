# Bhaaratheeya Velugu ePaper

A digital newspaper (ePaper) platform for reading daily editions by region. Readers can sign in, track progress, bookmark pages, and star editions. Admins can upload PDF editions and manage content; Super Admins can manage staff and permissions.

## Features

- **Readers**: Sign in with Google or email/password. Read editions, bookmark pages, star editions, track reading progress.
- **Staff / Admin**: Access admin dashboard to upload PDF editions, publish or unpublish, manage content.
- **Super Admin**: Manage staff (grant or remove admin access by email), full system control.
- **Mobile-first**: Responsive layout, PWA-ready, region selection, date and edition picker.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Framer Motion, PDF.js for page rendering
- **Backend**: NextAuth.js (Google OAuth + Credentials), Prisma ORM
- **Database**: PostgreSQL (e.g. Supabase)
- **Storage**: S3-compatible storage (e.g. Cloudflare R2) for PDF editions and signed URLs

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- (Optional) Cloud storage (R2 or S3) for PDF uploads
- (Optional) Google OAuth client for Sign in with Google

### Install

```bash
npm install
```

### Environment

Create `.env.local` in the project root. Required and optional variables:

- `DATABASE_URL` – PostgreSQL connection string (required)
- `DIRECT_URL` – Direct PostgreSQL URL for migrations (required when using Supabase pooler)
- `AUTH_SECRET` – NextAuth secret (e.g. `openssl rand -base64 32`)
- `NEXTAUTH_URL` – App URL (e.g. `http://localhost:3000` for dev)
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` – For Sign in with Google (optional)
- `SUPER_ADMIN_EMAILS` – Comma-separated emails that get Super Admin on first sign-in
- `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET` – For Cloudflare R2 uploads (optional)

### Database

```bash
npx prisma generate
npx prisma migrate deploy
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Choose a region to see the latest edition or sign in to access profile, bookmarks, and (if admin) the admin dashboard.

## Project Structure

- `src/app` – App Router pages (home, login, signup, profile, admin, read)
- `src/auth.ts` – NextAuth config (Google + Credentials, roles)
- `src/components` – ReaderView, AdminDashboard, StatePicker, etc.
- `src/lib` – Prisma client, storage (R2/S3), constants
- `prisma/schema.prisma` – Data model (User, Edition, ReadingProgress, Bookmark, etc.)

## API Overview

- `GET/POST /api/progress` – Reading progress per edition
- `GET/POST/DELETE /api/bookmarks` – Page bookmarks
- `GET/POST/DELETE /api/starred` – Starred editions
- `GET /api/editions`, `GET /api/editions/[id]` – List editions, get edition with signed URLs
- `GET/POST /api/admin/editions` – Admin: list editions, upload PDF
- `PATCH/DELETE /api/admin/editions/[id]` – Publish/unpublish, delete edition
- `GET/POST /api/admin/users`, `PATCH/DELETE /api/admin/users/[id]` – Super Admin: list staff, grant access, remove access

## Deployment

- Set `NEXTAUTH_URL` to your production URL (e.g. `https://your-app.vercel.app`).
- Run `npx prisma migrate deploy` against your production database before or during first deploy.
- Configure all required environment variables on your host. Do not commit `.env.local`.

### Vercel

The app is ready for Vercel. The build runs: copy favicons to `app/`, `prisma generate`, then `next build`. In the Vercel project, add `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, and any optional keys (Google OAuth, R2, `SUPER_ADMIN_EMAILS`). Connect the repo and deploy.

## Favicons & PWA

Favicons are generated from `public/logo.png` via `npm run favicons`, producing `favicon.ico`, `icon-192.png`, `icon-512.png`, and `apple-touch-icon.png`. Before each build, icons are copied into `src/app/` so Next.js file conventions emit the correct `<link>` tags for all platforms (desktop, Android, iPhone, iPad). The web app manifest at `/manifest.json` uses the same icons and theme colour for “Add to Home Screen” and PWA behaviour.

## License

Private / your choice.
