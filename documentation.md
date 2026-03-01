# Bharatiya Velugu ePaper Platform - Documentation

## Setup guides (step-by-step)

For **clear, copy-paste steps** to configure the app locally and in production, use the guides in the **`docs/`** folder:

| Guide | Purpose |
|-------|--------|
| [docs/README.md](docs/README.md) | Index and order of setup |
| [docs/setup-supabase.md](docs/setup-supabase.md) | Supabase (PostgreSQL database) |
| [docs/setup-cloudflare-r2.md](docs/setup-cloudflare-r2.md) | Cloudflare R2 (PDF/file storage) |
| [docs/setup-google-oauth.md](docs/setup-google-oauth.md) | Google OAuth (Sign in with Google) |

After you complete each guide, you can share the relevant API keys or connection strings in chat so we can add them to `.env.local` and test everything on the local server.

---

## 1. Hosting and Deployment

To get your website live at `epaper.bharatiyavelugu.com`, follow these steps:

### Platform Recommendation
We recommend **Vercel** for hosting the frontend and API of this Next.js App Router project. It provides seamless Next.js support out of the box.

1. Create a GitHub repository and push your code to it.
2. Sign up on [Vercel](https://vercel.com) and click "Add New Project".
3. Import your GitHub repository.
4. In the Environment Variables section, add all your production variables (see Environment Variables section below).
5. Deploy the project.

### Custom Domain Setup (`epaper.bharatiyavelugu.com`)
1. Go to your domain registrar (e.g., GoDaddy, Namecheap, Route53) where you bought `bharatiyavelugu.com`.
2. Open the DNS Management settings for your domain.
3. Add a new `CNAME` record:
   - **Name / Host:** `epaper`
   - **Value / Target:** `cname.vercel-dns.com`
4. In your Vercel project dashboard, go to **Settings > Domains**.
5. Add `epaper.bharatiyavelugu.com` to the project. Vercel will automatically provision an SSL certificate and link the domain.

---

## 2. Databases & Storage Setup

For a production-ready ePaper site, we need a secure relational database (PostgreSQL) and reliable object storage for newspapers (PDFs/Images).

### Database (Users, Staff, Reading Progress, Bookmarks)
We recommend **Supabase** or **Render** for fully managed PostgreSQL hosting.

**Using Supabase (Recommended for ease of use):**
1. Sign up on [Supabase](https://supabase.com).
2. Create a new project.
3. Once created, go to **Project Settings > Database**.
4. Copy the `Connection String` (URI). It will look like this: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres`
5. Set this string as your `DATABASE_URL` in Vercel.

*Note: Supabase provides excellent security, automatic backups, and high performance.*

### Newspaper File Storage (PDFs and Pages)
For storing heavy newspaper PDFs, do **not** store them directly in the project. Use a Cloud Storage provider with a CDN.

**Recommendation:** **Cloudflare R2** or **Amazon S3**.
Cloudflare R2 is significantly cheaper as it doesn't charge for egress bandwidth (download bandwidth), making it ideal for ePaper sites where users download many images/pages.

1. Sign up for Cloudflare and navigate to R2 Object Storage.
2. Create a new Bucket (e.g., `bharatiyavelugu-epapers`).
3. Generate an API Token with "Edit" permissions.
4. Save the Access Key ID, Secret Access Key, and Endpoint URL. You will add these to your environment variables.

---

## 3. Environment Variables (.env)

Your `.env` or Vercel Environment Variables should include:

```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@[YOUR_DB_HOST]:5432/postgres"

# Authentication (NextAuth)
NEXTAUTH_URL="https://epaper.bharatiyavelugu.com"
NEXTAUTH_SECRET="[GENERATE_A_RANDOM_SECRET_KEY]" # Run `openssl rand -base64 32`

# Google OAuth (For Readers)
GOOGLE_CLIENT_ID="[YOUR_GOOGLE_CLOUD_CLIENT_ID]"
GOOGLE_CLIENT_SECRET="[YOUR_GOOGLE_CLOUD_CLIENT_SECRET]"

# R2 / S3 Storage (For PDFs)
S3_ENDPOINT="[YOUR_CLOUDFLARE_R2_URL]"
S3_REGION="auto"
S3_ACCESS_KEY="[YOUR_R2_ACCESS_KEY]"
S3_SECRET_KEY="[YOUR_R2_SECRET_KEY]"
S3_BUCKET_NAME="bharatiyavelugu-epapers"
```

---

## 4. Technical and SEO Features

### Security & Access Control
- **Google OAuth Only (Readers):** Readers can only sign in via Google. This eliminates password management overhead.
- **Admin/Staff Login:** Authorized personnel can log in via Email and Password. Super Admins can restrict access or revoke credentials.
- **Signed URLs:** For future premium iterations, PDF links can be served as temporary signed URLs so that unauthorized users cannot directly scrape or download the files.

### Performance Optimizations (SEO & Speed)
- **Mobile First:** The application utilizes Tailwind CSS to guarantee smooth viewing on any mobile device.
- **Next.js App Router:** Employs Server-Side Rendering (SSR) where needed, and Static Site Generation (SSG) for high-performance delivery.
- **Image Optimization:** PWA ready and pre-loads components dynamically.

---

## 5. System Features Checklist

### Reader
- [x] Login via Google OAuth.
- [x] Track reading progress (Level System).
- [x] Auto-Resume from last read page.
- [x] Star/Favorite editions.
- [x] Bookmark specific pages within an edition.
- [x] Smooth pagination/swipe interface.
- [x] State/Region Selection mechanism.

### Editor / Staff
- [x] Dedicated Admin Login portal.
- [x] Dashboard to upload daily PDFs.
- [x] Ability to set publication date and region.
- [x] Publish / Unpublish toggles.
- [x] Logout Button specifically integrated.

### Main Admin (Super Admin)
- [x] Create, read, update, delete Staff / Editor accounts.
- [x] Complete administrative oversight of all users and publications.
