# laktarenje.com → lakat-web: switch-day runbook

Decisions: https://claude.ai/artifact/UB3wK4SRpdZaFtc4ohgdW3 (db `domena/`, Petar 2026-10-05).
Inventory of what iOS needs: `~/Projects/lakat-web-plan/review/pwa-inventory.md`.
When: only when Petar says, with everything below prepared and verified first (d6).

## Ready (2026-10-05)
- lakat-web: env-gated proxy in `next.config.mjs` — with `LAKAT_API_ORIGIN` set, `/api/native/*`, `/f/*`, `/s/*`,
  `/zaboravio-lozinku`, `/reset-lozinka` go to the old project; missing `/_next/static/*` and old icons fall back to it.
  Verified locally against production (read-only): native API answers 401 without a token, reset page renders with its assets.
- lakat-web: `/uvjeti` + `/privatnost` ported (d2); footer and form link to them.
- lakat-web: `public/sw.js` deletes all caches, unsubscribes push, unregisters and reloads open windows (old cache `lakat-v67`).
- lakat-web: „Račun ti je spremljen“ screen for installed web apps (standalone), copy per d4; preview `?pwa=demo`.
- lakat-pwa: local branch `prelazak-domene` (495e0bb, NOT pushed): reset shows „Lozinka promijenjena. Prijavi se u aplikaciji…“,
  forgot-password links home, `/f` CTA → waitlist (App Store after launch), `serverActions.allowedOrigins` incl. laktarenje.com.

## Still to prepare (needs Petar's word where marked)
1. [word] Add `api.laktarenje.com` to the Vercel project `lakat` (DNS: CNAME if the domain is not on Vercel DNS).
2. [word] Merge + deploy `prelazak-domene` on `lakat` (it is harmless before the switch, but changes /f for today's web users).
3. [word] Check Supabase Auth → URL configuration: Site URL `https://laktarenje.com`, `/reset-lozinka` on the redirect allowlist.
4. Rehearsal: preview of lakat-web with `LAKAT_API_ORIGIN=https://api.laktarenje.com` → test `/f/<real code>`, `/s/<real kod>`
   (incl. the „Dolazim“ action), reset mail end-to-end on a test account, native login from the iOS simulator against the preview URL.
5. iOS reset flow before 1 Dec (d3) — lives in lakat-ios; another session owns that repo now, ask who leads.

## Switch (minutes, reversible)
1. Vercel → lakat-web → Settings → Environment: `LAKAT_API_ORIGIN=https://api.laktarenje.com` → redeploy.
2. Vercel → Domains: move `laktarenje.com` + `www` from `lakat` to `lakat-web`.
3. `lakat` env `LAKAT_LOCKDOWN=1` → redeploy (mutes all web push; native + cron APIs bypass the proxy).
4. Checks: iOS login, round photos (`/api/native/slika`), friend request, `/uvjeti`, `/privatnost`, `/f/…`, `/s/…`, reset mail,
   crons still run (Vercel → lakat → Cron), an installed web app shows „Račun ti je spremljen“ and stops loading the old app,
   `support@laktarenje.com` still receives mail.
Rollback: move the domain back to `lakat` (one click), unset `LAKAT_LOCKDOWN`.

## After the checks (d8: immediately)
Delete the web UI from lakat-pwa (`app/(main)`, `/login`, `/register`, `/welcome`, web-only APIs `/api/slika`, `/api/roast`,
`/api/alibi`, `/api/kviz-pitanja`, `/api/sms-recenice`, push UI) and keep: `/api/native/*`, `/api/cron/*`, `/f`, `/s`, reset pages,
`lib/*` they use. Rename the project to `lakat-api` later. Claude's note: d8 removes the easy rollback for the web UI —
the git history keeps it.
