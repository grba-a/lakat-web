# LAKAT. web

Countdown landing for LAKAT, a Croatian social app launching on iPhone on 1 Dec 2026 at 12:00 (Europe/Zagreb).
After launch the page switches itself to the App Store button.

Next.js 16 (App Router, JavaScript) · Tailwind v4 · no smooth-scroll libraries · hero animation in CSS.

```bash
npm install
npm run dev -- -p 4410
```

Env (Vercel project settings, never in the repo): `BREVO_API_KEY`, `BREVO_LIST_ID`, `BREVO_DOI_TEMPLATE_ID`,
optional `BREVO_DOI_REDIRECT`, `NEXT_PUBLIC_APP_STORE_URL`, `SITE_URL`.

Decisions and open items: [`docs/PLAN.md`](docs/PLAN.md).
