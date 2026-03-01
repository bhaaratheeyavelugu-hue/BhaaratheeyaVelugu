# Cloudflare R2 setup (file storage)

Use Cloudflare R2 to store uploaded PDF editions. The app talks to R2 via the S3-compatible API.

---

## 1. Create a Cloudflare account

1. Go to **[cloudflare.com](https://www.cloudflare.com)** and sign up or log in.
2. From the dashboard, open **R2 Object Storage** (left sidebar: **R2**).

---

## 2. Create an R2 bucket

1. Click **Create bucket**.
2. **Bucket name:** e.g. `epaper` or `bhaaratheeya-velugu-editions`.
3. **Location:** choose **Automatic** (or a specific region if you prefer).
4. Click **Create bucket**.

---

## 3. Create R2 API tokens (access key + secret)

1. In the R2 section, click **Manage R2 API Tokens** (or go to **Overview** → **R2 API Tokens**).
2. Click **Create API token**.
3. **Token name:** e.g. `epaper-app-uploads`.
4. **Permissions:** **Object Read & Write** (or **Edit** for the bucket you created).
5. **Specify bucket(s):** optionally limit to your bucket (e.g. `epaper`).
6. **TTL:** leave empty (no expiry) or set an expiry if you want.
7. Click **Create API Token**.
8. On the next screen you will see:
   - **Access Key ID**
   - **Secret Access Key**  
   **Copy both immediately**; the secret is shown only once. Store them somewhere safe (e.g. password manager).

---

## 4. Get your R2 endpoint URL

1. In Cloudflare dashboard, go to **R2** → **Overview** (or your bucket).
2. In the right-hand panel, find **S3 API** or **Account details**.
3. Your **endpoint** is usually:
   ```text
   https://<ACCOUNT_ID>.r2.cloudflarestorage.com
   ```
   You can find **Account ID** in the Cloudflare dashboard URL when you’re in the account (e.g. `dash.cloudflare.com/<ACCOUNT_ID>/...`) or in **R2 → Overview**.

---

## 5. Set environment variables

In the project root, create or edit **`.env.local`** and add:

```env
# Cloudflare R2 (S3-compatible)
R2_ACCESS_KEY_ID="your_access_key_id_from_step_3"
R2_SECRET_ACCESS_KEY="your_secret_access_key_from_step_3"
R2_ENDPOINT="https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
R2_BUCKET="epaper"
```

- Replace `your_access_key_id_from_step_3` and `your_secret_access_key_from_step_3` with the values from step 3.
- Replace `<ACCOUNT_ID>` in `R2_ENDPOINT` with your Cloudflare account ID.
- Replace `epaper` in `R2_BUCKET` with the bucket name you used in step 2.

Save `.env.local`.

---

## 6. (Optional) CORS for direct browser uploads

If you later add direct uploads from the browser to R2, you’ll need CORS on the bucket. For the current app (server-side upload via Next.js API), CORS is **not** required. If you need it later:

1. Open your bucket in R2.
2. **Settings** → **CORS policy**.
3. Add a policy that allows your app’s origin (e.g. `http://localhost:3000` and your production domain).

---

## Summary – what to add in chat

You can paste here (in chat) the **names** of the variables and **placeholder** values, and we’ll plug in the real ones for local testing, for example:

- `R2_ACCESS_KEY_ID` = (paste or say “I’ll paste”)
- `R2_SECRET_ACCESS_KEY` = (paste or say “I’ll paste”)
- `R2_ENDPOINT` = `https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com`
- `R2_BUCKET` = `epaper`

Do **not** paste secret keys in public channels; only in a private chat. We’ll put them in `.env.local` and run the app to test uploads on localhost.

---

## Troubleshooting

| Issue | What to do |
|--------|------------|
| “Storage not configured” | Ensure all four R2 variables are set in `.env.local` and restart the dev server. |
| 403 Forbidden | Check API token has **Object Read & Write** and applies to the bucket. |
| Connection/SSL errors | Ensure `R2_ENDPOINT` is exactly `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` (no path, no trailing slash). |
| Upload works but read fails | The app uses presigned URLs; ensure the same token has read permission and the bucket name is correct. |
