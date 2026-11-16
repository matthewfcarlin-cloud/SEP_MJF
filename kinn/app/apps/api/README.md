# RECO server

Accounts, the patient's sealed record, patient-controlled sharing with a PT, and published plans. What it is for and how it fits: [docs/how-reco-works.md](../../../docs/how-reco-works.md). Reference: [docs/backend.md](../../../docs/backend.md).

## Run it on a laptop

From `kinn/app`:

```bash
npm ci
```

```bash
npm run api
```

That starts the server on http://localhost:8787 in development mode: an embedded Postgres under `apps/api/.data/`, stand-in secrets made on first run, and sign-in codes shown on the sign-in page instead of emailed. Nothing to set up.

In a second terminal, fill it with four sample patients who share with one PT:

```bash
npm run seed:local -w reco-api
```

Then run the clinic site against it and sign in as `dana@clinic.example`:

```bash
VITE_API_URL=http://localhost:8787 npm run clinic
```

And the patient app (browser build) against it:

```bash
cd apps/mobile && EXPO_PUBLIC_API_URL=http://localhost:8787 EXPO_PUBLIC_WEB_REAL=1 npx expo start
```

## Test it

```bash
npm run test -w reco-api
```

65 tests. They run the real routes against PGlite (Postgres compiled to run in-process), and `postgres.test.ts` puts the same engine behind a socket and drives the server through `pg`, the production driver.

## What a hosted server needs

Production is the default. With `RECO_ENV` unset, the server refuses to start unless all of these are set:

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Postgres 14 or newer (Neon through Vercel Storage works) |
| `AUTH_SECRET` | 32+ random characters. Signs sign-in and sharing codes. `openssl rand -base64 48` |
| `DATA_KEY` | 32 random bytes, base64. Seals every record and plan. `openssl rand -base64 32`. **Losing it loses the data; keep a copy somewhere safe.** |
| `RESEND_API_KEY`, `FROM_EMAIL` | Sends the sign-in email |
| `CORS_ORIGINS` | The clinic site's address, e.g. `https://reco-clinic.vercel.app` |
| `PT_ALLOWLIST` | Who may open a PT account: emails and `@domains`, comma separated. Empty means nobody. |

Optional: `PORT` (8787), `TRUST_PROXY=true` when behind one proxy that sets `X-Forwarded-For` (on by default on Vercel).

The database tables are created on first start (`src/migrations.ts`).

## Deploy

**Any Node host** (Railway, Render, Fly):

```bash
npm ci --workspace reco-api && npm run build -w reco-api && node apps/api/dist/server.mjs
```

**Vercel:** a new project on the same GitHub repo with Root Directory `kinn/app/apps/api`. `vercel.json` installs the workspace and runs the build, which writes one function to `.vercel/output` (Build Output API). Add a Postgres database from the Storage tab and the variables above. This path builds locally but has not been run on Vercel yet.

Then point the apps at it: `VITE_API_URL` on the clinic site's Vercel project (and redeploy), `EXPO_PUBLIC_API_URL` in the app's build profile. With neither set, the clinic site stays on sample patients and the app's sharing screen says it isn't in this build.

## Before real patients

See "What is not proven yet" in [how-reco-works.md](../../../docs/how-reco-works.md#9-what-is-not-proven-yet): the privacy policy, a health-data law review, a native app build, and a first real sign-in email all come first.
