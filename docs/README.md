# ePaper app – setup guides

Step-by-step docs to configure the app for local and production use.

---

## 1. Supabase (database)

- **Doc:** [setup-supabase.md](./setup-supabase.md)
- **What you get:** PostgreSQL database for users, sessions, editions, reading progress, bookmarks, starred editions.
- **What to prepare:** Supabase project, database password, connection string (URI).
- **Env var:** `DATABASE_URL`
- **After setup:** Run `npx prisma generate` and `npx prisma migrate deploy` (and optionally `npm run seed`).

---

## 2. Cloudflare R2 (file storage)

- **Doc:** [setup-cloudflare-r2.md](./setup-cloudflare-r2.md)
- **What you get:** Storage for uploaded PDF editions (and generated page assets).
- **What to prepare:** Cloudflare account, R2 bucket, R2 API token (Access Key ID + Secret Access Key), endpoint URL.
- **Env vars:** `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET`
- **After setup:** Restart the dev server; upload an edition in the admin panel to test.

---

## 3. Google OAuth (Sign in with Google)

- **Doc:** [setup-google-oauth.md](./setup-google-oauth.md)
- **What you get:** “Sign in with Google” on the login page.
- **What to prepare:** Google Cloud project, OAuth consent screen, OAuth 2.0 Web client (Client ID + Client Secret).
- **Env vars:** `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`, `NEXTAUTH_URL`
- **After setup:** Restart the dev server; open `/login` and click “Sign in with Google” to test.

---

## Order to do them (local testing)

1. **Supabase** – so the app has a database (required).
2. **Google OAuth** – so you can sign in and test profile, bookmarks, progress.
3. **Cloudflare R2** – so admin uploads work; optional for reading if you already have demo editions in DB.

---

## Where to put API keys and secrets

- Use **`.env.local`** in the project root for local development.
- Do **not** commit `.env.local` (it should be in `.gitignore`).
- For production (e.g. Vercel), add the same variable names in the host’s **Environment variables** and set `NEXTAUTH_URL` (and any auth redirect URLs) to your production URL.

After you finish each guide, you can paste the relevant values in chat (only in a private/safe place) and we can plug them into `.env.local` and test everything on the local server.
