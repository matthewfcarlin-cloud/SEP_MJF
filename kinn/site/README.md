# Kinn teaser site + waitlist

A one-page teaser (scroll film hero, the problem, a first look at the renders, waitlist) served by a small Node server that saves waitlist signups to Postgres.

## Deploy on Vercel

The site is static files in `public/` plus a few API routes. On Vercel the CDN serves `public/` and the Express app in `app.js` runs as one serverless function (`api/index.js`); `vercel.json` sends `/api/*`, `/admin/*` and `/healthz` to it and every other unknown path to `index.html`.

1. At vercel.com, **Add New → Project → Import** the `SEP_MJF` GitHub repo.
2. Under **Root Directory**, click Edit and pick `kinn/site`. Leave the framework as **Other**. `vercel.json` already sets install (`npm ci`), no build step, and `public` as the output.
3. Still on the import screen, open **Environment Variables** and add `ADMIN_TOKEN` = any long random string (the password for downloading the list). Click **Deploy**.
4. Add the database. In the project, open **Storage → Create Database → Neon (Postgres)**, accept the free plan, and connect it to the project. Neon adds `DATABASE_URL` to the project's environment variables for you.
5. **Deployments → ⋯ on the latest → Redeploy**, so the function starts with `DATABASE_URL`.
6. Open `https://YOUR-PROJECT.vercel.app/healthz`. It should say `"store":"postgres"`. Then submit the form on the page once and check `/admin/stats?token=YOUR_ADMIN_TOKEN` shows it.
7. Optional variables, under **Settings → Environment Variables** (redeploy after adding): `RESEND_API_KEY` and `FROM_EMAIL` for the welcome email, `ANTHROPIC_API_KEY` for typed check-ins on `/learn`.
8. Own domain: **Settings → Domains → Add**, then set the DNS records Vercel shows at your registrar.

Every push to `main` redeploys. Pull requests get preview URLs that share the same database.

### Moving the signups from Railway

Railway's Postgres holds every signup so far. Copy them into Neon before switching Railway off:

1. In Railway, open the Postgres service → **Connect** (or **Variables**) and copy the **public** `DATABASE_URL` (the one with `proxy.rlwy.net`, not `railway.internal`).
2. In Vercel, **Storage → your Neon database → `.env.local` tab** and copy `DATABASE_URL`.
3. Run, from `kinn/site`:

```
SOURCE_DATABASE_URL='postgres://...railway...' DATABASE_URL='postgres://...neon...' node scripts/copy-waitlist.js
```

It prints how many rows it read and inserted. Rows are matched on email, so it is safe to run twice. Check `/admin/stats` on the Vercel URL shows the same total as it did on Railway, then delete the Railway project.

Two things work slightly differently on Vercel: the rate limit on `/api/waitlist` is per function instance rather than global (still fine for a waitlist form), and unknown paths return `index.html` with a 200 instead of a 404.

## Read the waitlist

- CSV download: `https://YOUR-DOMAIN/admin/waitlist.csv?token=YOUR_ADMIN_TOKEN`
- Quick counts: `https://YOUR-DOMAIN/admin/stats?token=YOUR_ADMIN_TOKEN`
- Or open the database in Vercel → **Storage → Neon → Open in Neon** → Tables → `waitlist`.

Each signup stores: email, role (patient / pt / supporting / other), injury (acl, meniscus, patella, other-knee, other-joint), sport (basketball, soccer, volleyball, skiing, running, tennis, football, gym, other, everyday), alert (yes / maybe / no), channel (clinic, teammate, online, social, event, other), optional note, source, referrer and time. `source` is `site` unless the page was opened with `?src=…` (for example `?src=flyer-usc` on a QR code), so each clinic, flyer or post can get its own link. A repeat signup with the same email updates the details and doesn't create a duplicate. Older rows may still hold the pre-Oct-26 values (athlete, knee-replacement, shoulder, ankle, not-injured).

## Optional: welcome email

Sign up at resend.com, verify a sending domain, then add:
- `RESEND_API_KEY` = your Resend key
- `FROM_EMAIL` = e.g. `Kinn <hello@yourdomain.com>`

New signups then get a short "You're on the waitlist" email. Without these variables, nothing is sent.

## The "How Kinn learns" page (/learn)

`public/learn/` is a built page: the interactive continual-learning demo from [`../learn/`](../learn/). Edit it there and run `npm run build` in `kinn/learn`, which writes into `public/learn/`. Typed check-ins on that page go to `POST /api/checkin`, where Claude reads them. To turn that on, add:
- `ANTHROPIC_API_KEY` = your Anthropic API key

Without it, the page reads check-ins on the device instead and still works.

## Run locally

```
cd kinn/site
npm install
ADMIN_TOKEN=dev npm start   # http://localhost:3000
```
Without `DATABASE_URL`, signups go to `data/waitlist.json`. That's for local testing only; on Vercel the filesystem is read-only, so `DATABASE_URL` is required there.

## Files
- `app.js`: the Express app: `/api/waitlist`, `/api/waitlist/count`, `/api/checkin`, `/admin/waitlist.csv`, `/admin/stats`, `/healthz`, and static files when not on Vercel
- `server.js`: runs the app as a normal process (`npm start`)
- `api/index.js`: the same app as a Vercel serverless function
- `vercel.json`: routing, cache headers and build settings for Vercel
- `scripts/copy-waitlist.js`: one-off copy of the waitlist between two Postgres databases
- `checkin.js`: the `/api/checkin` route (Claude reads a typed check-in for `/learn`)
- `public/learn/`: the built "How Kinn learns" page (source in `../learn/`)
- `public/progress/`: the build-progress page; its `img/app-*.webp` are simulator screenshots of the iOS app in `../app/apps/mobile`
- `public/index.html`: the page
- `public/vid/`: 97 frames of the Higgsfield pull-back, scrubbed by scroll
- `public/spin/`: 144 frames of the 360 turntable render
- `public/img/`: still renders
