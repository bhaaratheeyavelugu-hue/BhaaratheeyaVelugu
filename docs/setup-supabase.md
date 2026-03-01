# Supabase setup (database)

Use Supabase as the PostgreSQL database for users, sessions, editions, reading progress, bookmarks, and starred editions. This guide is written for **hosting the app on Vercel** (serverless).

---

## 1. Create a Supabase account and project

1. Go to **[supabase.com](https://supabase.com)** and sign up or log in.
2. If asked, create or select an **Organization**, then click **New project**.
3. Fill in the form:
   - **Name:** e.g. `epaper` or `bhaaratheeya-velugu`
   - **Database password:** Create a strong password and **save it somewhere safe** (you need it for the connection string).
   - **Region:** Choose the region closest to your users (or to Vercel’s region).
   - Leave other options (e.g. pricing plan) as default unless you need something specific.
4. Click **Create new project** and wait until the project is ready (this can take a minute or two).

---

## 2. Get the database connection string (for Vercel)

Because the app runs on **Vercel** (serverless), you must use Supabase’s **Transaction mode** pooler. The connection string is shown in the **Connect** panel, not in the old Settings → Database screen.

### Step A – Open the Connect panel

1. In the Supabase dashboard, open your **project** (click the project name if you have several).
2. In the **top bar** of the project, click the **Connect** button (or the dropdown next to it).
3. A **Connect** panel (or modal) will open with several connection options and tabs (e.g. **URI**, **Session mode**, **Transaction mode**, **Direct**).

### Step B – Choose Transaction mode (for Vercel)

1. In the Connect panel, look for **Transaction** (or **Transaction mode** / **Supavisor transaction**).  
   This is the one recommended for **serverless and edge** (e.g. Vercel).
2. Select the **URI** (or **Connection string**) tab or the option that shows a **Postgres URI**.
3. Copy the connection string. It will look like one of these:
   - **Transaction mode (Supavisor)** – typically **port 6543**:
     ```text
     postgres://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
   - Or with `db.[project-ref].supabase.co` and port **6543**:
     ```text
     postgres://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres
     ```
4. Replace **`[YOUR-PASSWORD]`** with the **database password** you set when creating the project (in step 1).  
   If the UI shows a **Copy** button that already inserts the password, you can use that and then fix the password part if it’s masked.
5. **Use this URI as your main `DATABASE_URL`** for both local development and Vercel.

### Step C – (Optional) Direct connection for migrations

For **running Prisma migrations** (e.g. `prisma migrate deploy`), Supabase recommends a **direct** connection in addition to the pooled one. You can get it from the same Connect panel:

1. In the Connect panel, select **Direct connection** (or **Direct**).
2. Copy that URI (usually **port 5432**). It looks like:
   ```text
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
3. Replace `[YOUR-PASSWORD]` with your database password.
4. You will use this as **`DIRECT_URL`** in the Prisma schema (see section 3) so that migrations use a direct connection while the app uses the transaction pooler.

**Summary**

| Use case              | Connection type   | Port  | Use for                          |
|-----------------------|-------------------|-------|-----------------------------------|
| App (Vercel + local)  | **Transaction**   | 6543  | `DATABASE_URL`                    |
| Prisma migrations     | **Direct**        | 5432  | `directUrl` in `schema.prisma`    |

---

## 3. Switch the app to PostgreSQL (Supabase)

The app’s Prisma schema is set up for SQLite by default. To use Supabase you must point it at PostgreSQL.

1. Open **`prisma/schema.prisma`** in the project.
2. Change the **datasource** from SQLite to PostgreSQL.

   **From:**
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

   **To (Vercel + Supabase – pooled URL + direct for migrations):**
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```

   If you prefer not to use `directUrl` (e.g. you only have one connection string), use this instead:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   Then run migrations only when you have the **direct** (port 5432) connection set as `DATABASE_URL`, or use the pooled connection and see Supabase/Prisma docs if you hit migration issues.

3. Save the file.

---

## 4. Set environment variables

### Local development (`.env.local`)

1. In the project root, create or edit **`.env.local`** (do not commit this file).
2. Set **`DATABASE_URL`** to the **Transaction mode** connection string (port 6543) from section 2:

   ```env
   DATABASE_URL="postgres://postgres.[PROJECT-REF]:YOUR_PASSWORD@aws-0-[REGION].pooler.supabase.com:6543/postgres"
   ```

   Replace `[PROJECT-REF]`, `YOUR_PASSWORD`, and `[REGION]` with your actual values.

3. If you added **`directUrl`** in the schema, set **`DIRECT_URL`** to the **Direct** connection string (port 5432):

   ```env
   DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

4. Save `.env.local`.

### Vercel (production)

1. In the [Vercel dashboard](https://vercel.com/dashboard), open your project.
2. Go to **Settings** → **Environment Variables**.
3. Add:
   - **`DATABASE_URL`** = same Transaction mode URI (port 6543) you use in `.env.local`.  
     Apply to **Production**, **Preview**, and **Development** if you use Vercel for all.
   - **`DIRECT_URL`** (optional) = same Direct URI (port 5432) as in `.env.local`, if you use `directUrl` in Prisma.  
     You can restrict this to **Production** only if you run migrations from production; otherwise you can run migrations locally and leave `DIRECT_URL` only in `.env.local`.
4. Save. Redeploy the project so the new variables are used.

---

## 5. Run migrations and generate the client

From the project root (e.g. `epaper-app/`):

```bash
npx prisma generate
npx prisma migrate deploy
```

- **If you use `directUrl`** in `schema.prisma`, Prisma will use `DIRECT_URL` for migrations and `DATABASE_URL` for the app at runtime. Ensure both are set in `.env.local` when running these commands locally.
- If you already have migrations created for SQLite, they should work for PostgreSQL.  
- If you get errors, you may need to create a new migration for Postgres:

  ```bash
  npx prisma migrate dev --name init_postgres
  ```

---

## 6. (Optional) Seed the database

To create a demo admin and sample data:

```bash
npm run seed
```

---

## Summary – what to add in chat

After you finish the steps above, you can paste here (in chat) **only**:

- **Database URL** – the full `DATABASE_URL` value (with password), so we can put it in `.env.local` and test, **or**
- **Project ref + password** – e.g. “project ref is `abcdefghijk`, password is `MySecretPass123`” and we’ll format the URI.

Do **not** paste your Supabase password in public; use chat only with people you trust. Prefer sharing the exact `DATABASE_URL` line you use in `.env.local` so we can test on localhost.

---

## Troubleshooting

| Issue | What to do |
|--------|------------|
| Connection timeout | Use the **Transaction mode** URI (port 6543) for the app. For migrations use the **Direct** URI (port 5432) via `DIRECT_URL`. |
| SSL errors | Append `?sslmode=require` to the URI, or use the “URI” that Supabase shows (it often includes SSL). |
| “Relation does not exist” | Run `npx prisma migrate deploy` again; ensure `DATABASE_URL` points at the correct project. |
| Prisma Client out of sync | Run `npx prisma generate` after changing the schema. |
| Vercel build fails (DB) | Set `DATABASE_URL` (and `DIRECT_URL` if used) in Vercel → Settings → Environment Variables and redeploy. |
| Can't find connection string | Use the **Connect** button in the **top bar** of the project (not Settings → Database). Pick **Transaction** and copy the URI. |
