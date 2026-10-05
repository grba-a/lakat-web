# lakat-web — wow round (Petar's picks 2026-10-05)

Picks: https://claude.ai/artifact/5SEc2q9mk4ZJxm382GJ5px (db `wow/`). Agent reports: `~/Projects/lakat-web-plan/review/`.
Everything „Da“ except: w04 roleta (no answer → skipped, ask), w17 = „Karta tvoje ekipe. Tko je vani, tko stiže, tko časti.“,
w19 = checkbox stays + „Imam 18+“, w22 = pre-order once the build passes review, w24 = Vercel Web Analytics,
w25 = „Potvrda sad, a 1. 12. u podne jedan mail s linkom. Ništa više.“
Pushing to main deploys lakat-web.vercel.app (Petar asked to push 2026-10-04).

## Phase A — front end only (no backend), in this order
1. [x] w03 real split-flap timer (+ clack when sound on)
2. [x] w01 hero boot: splash → map slides in → 3 pins → pushes (keeps k3); w17 subline
3. [x] w02 mobile tour: big centred phone, Krigla as in-phone push, caption under, live layer per screen
       (wheel spins = circle crop of the runda screen, pins pulse, podium rises, film develops = w12); slalom stays on desktop
4. [x] w29 privacy lights word by word
5. [x] w18 sticky CTA opens a bottom sheet with the focused field; w21 catch points under game + film
6. [x] w15 success state (echo mail, spam hint, „Krivi mail? Ispravi.“, open mail, share, .ics, IG) + w16 /potvrdeno;
       w19 „Imam 18+“; w25 copy; w20 iPhone/Android choice (Brevo attribute PLATFORMA)
7. [x] w10 daily seeded game + share challenge (`/i/[r]` page with its own OG image)
8. [x] w11 daily noon reveal (polaroid develops; content from approved feature copy only)
9. [x] w26 Krigla docked to the CTA with a line per section (one pose for now; fill needs 3–5 poses)
10. [x] w27 dots → Adriatic coastline + desktop flashlight
11. [x] w23 launch kit: Smart App Banner (env app id), QR on desktop after launch, ct tokens on App Store links
12. [x] w24 Vercel Web Analytics + events + `?src=` → Brevo IZVOR

Notes: w26 has lines per section with one Krigla pose (fill waits for poses); w23 QR on desktop not built (needs a QR
dependency — ask) and needs `NEXT_PUBLIC_APP_STORE_URL` (+ optional `NEXT_PUBLIC_APP_STORE_PT`); w24 needs Web Analytics
switched on in the Vercel project (Analytics tab), custom events may need a paid plan (unverified).

## Phase B — needs a data decision (question in vault PITANJA-ZA-PETRA)
w05 ticket card with QR referral · w06 dovedi pajdaša · w07 kvartovski rat · w08 Napunite Kriglu · w09 rezerviraj ime ·
w28 tko je još ovdje (Supabase Realtime) · w14 gazda kvarta. Where does the waitlist live: LAKAT Supabase PROD (recommended:
usernames and rewards must match app accounts) or Brevo only / a separate project.

## Outside the web (Petar / campaign)
w13 Instagram countdown sticker + „Add Yours“ · w22 pre-order needs the paid Apple account + approved build (check noon release) ·
w23 Brevo launch mail at 12:00 · w26 Krigla poses (Codex, GPT-Image) · DEV recapture of screens without faces.

# Round 3 — decisions 2026-10-05 (https://claude.ai/artifact/9UVSXPfX98nEiUhCDsCi7k, db `odluke/`)
All „Da“. q1 Claude sets up Brevo via API · q2 A = LAKAT Supabase PROD (SQL file, Petar runs it) · q3 roleta yes · q4 Claude
tries Vercel API for Analytics · q5 QR yes · q6 no App Store link yet · q7 Codex poses: Claude writes a prompt + context folder ·
q8 later, but Claude may design people silhouettes instead of faces · q9 Claude drafts the /privatnost sentence ·
t1 BACK TO SCROLL with fluid, clean scroll-linked animations (native scroll, no Lenis) · n1–n8 all yes.

## Round 3A — no backend
1. [x] t1 scroll tour, scrubbed + lerp-smoothed (screens slide inside the phone, captions crossfade, progress rail)
2. [x] q3 roleta: last 60 min full-screen countdown, shutter at 12:00
3. [x] n2 friend greeting (?src=share/izazov) · n3 Krigla knows the time of day · n4 tab-title timer in the last 24 h
4. [x] n5 Krigla hunt (5 hidden Krigle → secret line + wallpaper later)
5. [x] n1 „Spremi za Story“ 9:16 „Još N dana“ image (next/og) + share
6. [x] n7 /press page
7. [x] q8 silhouettes instead of blurred faces in screens
8. [x] q5 QR on desktop after launch (`qrcode` dep)
9. [x] q9 /privatnost sentence draft (vault + PLAN) · q7 Codex prompt folder · q4 Vercel Analytics via API

## Round 3B — backend (Supabase PROD + Brevo)
- SQL `docs/supabase-lista1.sql`: table + security-definer RPCs for anon (upis, potvrda, kvart ranking, fill %, ime slobodno, ref count)
- Own double opt-in: token link mailed via Brevo transactional → /potvrdi?t= → confirmed in Supabase + contact into the Brevo list
- w05 ticket + QR referral · w06 dovedi pajdaša · w07 kvartovski rat · w08 Napunite Kriglu · w09 rezerviraj ime · w28 presence
- n6 wallpapers after Codex poses · n8 3D phone (Blender + r3f) last

### Round 3B state (2026-10-05)
Built behind flags (live site unchanged): `lib/lista.js`, `/api/lista` v2 (own double opt-in), `/potvrdi`, `/api/lista/ime`,
`/api/ulaznica`, ticket on `/potvrdeno`, `KvartRat` section, form fields (grad, kvart, @ime) when `NEXT_PUBLIC_LISTA_PRO=1`.
SQL `docs/supabase-lista1.sql` tested in PGlite (idempotent, view shows only kvarts with 3+, username check covers profiles + list).
To switch on (Vercel env of lakat-web): SUPABASE_URL, SUPABASE_SECRET_KEY, BREVO_API_KEY, BREVO_SENDER, BREVO_LIST_ID,
(BREVO_ATTRS=1 after creating PLATFORMA, IZVOR, GRAD, KVART), NEXT_PUBLIC_LISTA_PRO=1.
Blocked: Brevo key is a Sensitive Vercel var (not readable) and not in ~/.config → Petar adds a key; Petar runs the SQL;
OK to put the PROD service key into lakat-web. Not built yet: w08 Napunite Kriglu (needs thresholds + what unlocks),
w28 presence (needs supabase-js + anon key), n6 wallpapers (Codex poses), n8 3D phone.
