# Kinn teaser site + waitlist

A one-page teaser (scroll film hero, the problem, a first look at the renders, waitlist) served by a small Node server that saves waitlist signups to Postgres.

## Deploy on Railway

1. **New project → Deploy from GitHub repo** → pick `SEP_MJF`.
2. In the service's **Settings → Source**, set **Root Directory** to `kinn/site`. Railway then finds `package.json` and runs `npm start`.
3. In the project, click **+ New → Database → PostgreSQL**.
4. In the web service's **Variables**, add:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (use the reference picker so it links to the database)
   - `ADMIN_TOKEN` = any long random string (this is the password for downloading the list)
5. **Settings → Networking → Generate Domain** to get a public URL, or add your own domain there.
6. Open `https://YOUR-DOMAIN/healthz`. It should say `"store":"postgres"`.

## Read the waitlist

- CSV download: `https://YOUR-DOMAIN/admin/waitlist.csv?token=YOUR_ADMIN_TOKEN`
- Quick counts: `https://YOUR-DOMAIN/admin/stats?token=YOUR_ADMIN_TOKEN`
- Or open the Postgres service in Railway → **Data** tab → `waitlist` table.

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
Without `DATABASE_URL`, signups go to `data/waitlist.json`. That's for local testing only, because Railway's disk resets on every deploy.

## Files
- `server.js`: static site + `/api/waitlist`, `/api/waitlist/count`, `/api/checkin`, `/admin/waitlist.csv`, `/admin/stats`, `/healthz`
- `checkin.js`: the `/api/checkin` route (Claude reads a typed check-in for `/learn`)
- `public/learn/`: the built "How Kinn learns" page (source in `../learn/`)
- `public/index.html`: the page
- `public/vid/`: 97 frames of the Higgsfield pull-back, scrubbed by scroll
- `public/spin/`: 144 frames of the 360 turntable render
- `public/img/`: still renders
