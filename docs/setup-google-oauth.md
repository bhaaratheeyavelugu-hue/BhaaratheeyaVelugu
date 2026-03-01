# Google OAuth setup (Sign in with Google)

## How it works

1. User clicks **Sign in with Google** on your app.
2. Google asks them to sign in and approve your app (name, email, profile).
3. **NextAuth.js** (in your app) receives the user info from Google.
4. NextAuth uses the **Prisma adapter** to save or update the user in your **Supabase** database:
   - **User** table: `id`, `name`, `email`, `image`, etc.
   - **Account** table: link between the user and Google (provider, tokens).
5. Your app then has a logged-in session; profile, bookmarks, and reading progress are tied to that user in Supabase.

So: **Google provides the identity; your app stores the user in Supabase.** You don’t store Google passwords—only the fact that this Google account is linked to a user row in your DB.

---

## What you need from Google

Two values:

- **Client ID** (public)
- **Client secret** (keep private)

You get them from **Google Cloud Console** by creating an **OAuth 2.0 Web application** client. Steps below.

---

## Step 1. Open Google Cloud Console

1. Go to **[console.cloud.google.com](https://console.cloud.google.com)** and sign in.
2. In the **top bar**, click the project dropdown (it may say “Select a project” or show a project name).
3. Click **New project**, give it a name (e.g. `ePaper App`), then **Create**. Wait for it to finish, then select that project.

---

## Step 2. Configure the OAuth consent screen (required first)

Before creating credentials, you must set up the “consent screen” (what users see when they sign in with Google). Google has updated the flow: in many accounts you only see **App name**, **Support email**, and **Audience (External/Internal)** on the first screen—there is **no “Scopes” page** there. You click **Create** or **Save**, then add scopes in **Data Access** (see Step 2b). If your console still shows a multi-page wizard with a Scopes page, use that; otherwise follow 2a → 2b → 2c below.

### Where to open it

- **Option A:** Left sidebar → **APIs & Services** → **OAuth consent screen**
- **Option B:** Go to **[Google Auth platform](https://console.developers.google.com/auth/overview)** (or **Google Auth platform** in the menu) → **Branding** or the main “Get started” / app setup

Use whichever path your console shows.

### 2a. First screen: App info and audience (no scopes here)

On the first consent-screen / app setup screen you will see:

1. **Audience (User type)** – choose one:
   - **External** – Any Google user (e.g. anyone with a Gmail account) can sign in. Use this for a public app. While the app is in “Testing”, only added test users can sign in; after you **Publish app**, any Google account can sign in.
   - **Internal** – Only users in your **Google Workspace organization** can sign in. Use only if the app is for your company.
   - **For this ePaper app:** choose **External**.

2. **App information:**
   - **App name:** e.g. `Bhaaratheeya velugu`
   - **User support email:** pick your email from the dropdown (must be one you monitor)
   - **App logo:** optional; you can skip for now
   - **Developer contact information:** your email (for Google to contact you)

3. Click **Save and Continue** or **Create** (or **Save**).  
   There is **no “Scopes” page** on this first flow in the updated console—scopes are added in the next step.

### 2b. Add scopes (separate “Data Access” step)

Scopes are configured on the **Data Access** page, not on the first consent screen.

1. Open **Data Access**:
   - **Option A:** In the left menu under the same project, look for **Google Auth platform** → **Data Access**, or  
   - **Option B:** **APIs & Services** → **OAuth consent screen** → then in the consent screen configuration, look for **Scopes** or **Data Access** and open it.  
   Direct link (with your project selected): **[Data Access – Scopes](https://console.developers.google.com/auth/scopes)**

2. Click **ADD OR REMOVE SCOPES** (or **Add or remove scopes**).

3. Add these three scopes (required for “Sign in with Google” to get name and email):
   - **`.../auth/userinfo.email`** (search or filter for `email`)
   - **`.../auth/userinfo.profile`** (search or filter for `profile`)
   - **`openid`** (search for `openid`; needed for OpenID Connect)

4. Click **Update** (or **Save**). The scopes will appear under “Your non-sensitive scopes” (email/profile/openid are non-sensitive).

### 2c. Test users (only if app is in “Testing”)

If your app is in **Testing** mode, only listed test users can sign in:

- Find **Test users** (or **Audience** → Test users) and click **Add users**.
- Add the Gmail addresses that should be allowed to sign in (e.g. your own).
- Save.

When you’re ready for everyone to sign in, use **Publish app** in the OAuth consent screen / app status; you can then remove test users if you like.

---

## Step 3. Create OAuth 2.0 credentials (Client ID + Secret)

1. In the left sidebar, go to **APIs & Services** → **Credentials**.
2. Click **+ Create Credentials** at the top → **OAuth client ID**.
3. **Application type:** choose **Web application**.
4. **Name:** e.g. `ePaper Web` or `Bhaaratheeya velugu – Web`.
5. **Authorized JavaScript origins:** click **+ Add URI** and add:
   - For local: `http://localhost:3000`
   - For production (when you have a domain): `https://yourdomain.com` (no trailing slash)
6. **Authorized redirect URIs:** click **+ Add URI** and add:
   - For local: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
7. Click **Create**.
8. A popup shows **Your Client ID** and **Your Client Secret**. Copy both and store them safely (e.g. in a password manager). The secret is only shown once.

---

## Step 4. Add these to your app

In your project root, create or edit **`.env.local`** and add:

```env
# From Step 3 – replace with your real values
AUTH_GOOGLE_ID="your_client_id_here"
AUTH_GOOGLE_SECRET="your_client_secret_here"

# Required for NextAuth
AUTH_SECRET="paste_a_long_random_string_here"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate `AUTH_SECRET`** (one-time, any random string):

- On your machine run:  
  `openssl rand -base64 32`  
- Copy the output and paste it as the value of `AUTH_SECRET` in `.env.local`.

For **Vercel** (production), add the same variables in **Project → Settings → Environment Variables**: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`, and set `NEXTAUTH_URL` to your production URL (e.g. `https://yourdomain.com`).

---

## Optional: Super admin and staff by email/domain

Your app can assign roles when a user signs in with Google for the first time:

```env
# These emails get SUPER_ADMIN role on first sign-in
SUPER_ADMIN_EMAILS="admin@example.com"

# Emails from these domains get ADMIN role on first sign-in
ADMIN_ALLOWED_DOMAINS="yourcompany.com"
```

---

## Quick checklist

| What | Where |
|------|--------|
| **Audience (User type)** | OAuth consent screen → **External** (public app) or **Internal** (Google Workspace only). For this app use **External**. |
| Client ID | Google Cloud Console → APIs & Services → Credentials → your OAuth client |
| Client secret | Same place (copy when you create the client) |
| Consent screen | APIs & Services → OAuth consent screen (or Google Auth platform). Choose **External**. Add scopes under **Data Access** → ADD OR REMOVE SCOPES (email, profile, openid). |
| Redirect URI for local | `http://localhost:3000/api/auth/callback/google` |
| Redirect URI for production | `https://yourdomain.com/api/auth/callback/google` |
| Where user data is stored | **Supabase** (via NextAuth + Prisma adapter) |

---

## Troubleshooting

| Issue | Fix |
|--------|-----|
| **redirect_uri_mismatch** | In Google Console → Credentials → your OAuth client, add exactly `http://localhost:3000/api/auth/callback/google` under **Authorized redirect URIs** (same port as your app). |
| **Access blocked: This app’s request is invalid** | Add the three scopes (email, profile, openid) under **Data Access** → ADD OR REMOVE SCOPES (Step 2b). If the app is in “Testing”, add your Gmail under Test users (Step 2c). |
| **Sign-in works locally but not on Vercel** | Add your production URL to Authorized JavaScript origins and redirect URIs in Google Console, and set `NEXTAUTH_URL` in Vercel to that URL (e.g. `https://yourapp.vercel.app`). |

---

## Summary

- **Sign in with Google** uses Google only for login; **user data is stored in Supabase** (User + Account tables) via NextAuth and Prisma.
- You need **Client ID** and **Client secret** from Google Cloud Console (OAuth 2.0 Web application).
- Set them in `.env.local` as `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`, plus `AUTH_SECRET` and `NEXTAUTH_URL`.
