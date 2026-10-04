# lakat-web — build plan

Countdown landing for LAKAT (native app, launch **1 Dec 2026 12:00 Europe/Zagreb**). Later it takes over
laktarenje.com and stays as LAKAT's home after launch (timer → store badges).

Decisions (Petar, 2026-10-04):
- Plan + 37 answers: https://claude.ai/artifact/KqELrfJAzdgFQUX2x1HxXk (db `web/`)
- Section picks: https://claude.ai/artifact/5Mni2Qc56SYrKYPNqn1zZs (db `sekcije/`)
- He skipped the clickable prototype: „kreni sa izradom“. Dev server opens for him once the hero is done.

## Picks
| Section | Pick | Notes |
|---|---|---|
| Hero | B: headline top, phone, flip timer, CTA pinned to the bottom | „Šank se otvara za…“, CSS phone with LAKAT splash, follows pointer |
| Moving phone | A: slalom (try B „okret“ if he doesn't like it) | one sticky phone, switches side + rotates per feature, shows that feature's screen |
| Feature section | C: Krigla narrates in a bubble | order: Karta, Runda, Krigla, Igra dana, Ekipe, Film večeri |
| Secret | C: Krigla „Ima još nešto, ali ako ti rečem, šef će me razbit.“ | a 7th, not-yet-invented feature |
| Game | A: in the phone | real runner core from lakat-pwa; **don't name the game**: „primjer onoga što dolazi“ |
| Promo film | A: in the phone | better film comes later |
| Privacy | (no pick) A big sentence | ask Petar |
| Instagram | D: Krigla „Ne daš mail? Dobro. Onda me barem prati.“ | @lakat_app |
| Waitlist | D: Krigla asks | Brevo, double opt-in |
| FAQ | B: chat | his line: „Web je bio proba i bio je solidan. Tek sada dolazi nešto što para gaće.“ |
| Footer | C: Krigla waves | Privatnost, Uvjeti, support@laktarenje.com; no Digital Lab credit |
| After launch | A: badges instead of timer | automatic at TARGET |

Never: price, LAKAT+ (secret until January), invented numbers, Lenis, GSAP hero. Copy: Croatian, zajebantski but App-Store-safe.

## Phases
1. [x] Scaffold, tokens, fonts, hero (timer, phone, pinned CTA) → dev server on :4410, open for Petar
2. [x] Feature scroll (slalom), 6 features with Krigla bubbles and real screens
3. [x] Secret, game, film
4. [x] Privacy, Instagram, waitlist + `/api/lista` (Brevo DOI), FAQ, footer
5. [x] After-launch state, dynamic OG image, easter egg (5 taps → Krigla), sound toggle, metadata/robots/sitemap
6. [x] QA: Playwright WebKit 360/390/430 + desktop, overflow, reduced motion, `npm run build`
7. [ ] Report to Petar. GitHub (public `lakat-web`) + Vercel (`lakat-web`) only after his OK on the local build

## Domain switch (later, on his word)
lakat-web takes laktarenje.com and proxies `/api/*`, `/s/*`, `/f/*` to the old `lakat` project (iOS calls
`laktarenje.com/api/native/*`). `/privatnost` + `/uvjeti` move here. Ship a self-unregistering `sw.js` so installed PWAs
drop the cached app (old cache `lakat-v65`). After that the web app can be deleted (Petar, g3).

## State 2026-10-04 (evening)
Phases 1–6 done locally (dev :4410). Not committed, not pushed. Verified in Playwright WebKit 360/390/430/1440: no horizontal
overflow, no console errors; prod build passes; after-launch state checked with `LAKAT_FORCE_LIVE=1` on a separate build
(`NEXT_DIST=.next-live`). Waitlist answers 503 „Lista se još spaja“ until the Brevo env exists.
Screens: `public/img/scr-*.webp` (status bar cropped, faces blurred) — stand-ins until a DEV recapture.
Video: `public/video/najava.mp4` = „Cijeli Balkan (duga, 49 s)“ from the Desktop (Petar 2026-10-04), 540p, 3.3 MB; poster = 1 s lock-screen push.

## Open for Petar
- Brevo: a list + DOI template id + redirect page; env `BREVO_API_KEY`, `BREVO_LIST_ID`, `BREVO_DOI_TEMPLATE_ID`
- /privatnost must mention the waitlist (Brevo) before it goes live
- App Store URL → env `NEXT_PUBLIC_APP_STORE_URL`; official Apple badge SVG (couldn't download: tools.applemarketingtools.com did not resolve here)
- Privacy section had no pick — built A (big sentence)
- Recapture screens on DEV without real faces (film strip, rang) before the public deploy
- FAQ „Gdje radi?“ — which countries
