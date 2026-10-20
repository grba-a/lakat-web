# Web na maksimum — plan (branch `web-max`, worktree ~/Projects/lakat-web-max)

Petar, 2026-10-20: „ti i Codex dovedite laktarenje.com na maksimalan nivo za konverzije, s Higgsfieldom“.
Round 1 artifact https://claude.ai/artifact/Fep2tavoCoQL7HaDM6xKUi (db `webmax/`). His verdict: not good enough,
„možemo puno bolje osmisliti i isplanirati“; hero is „prestatično“, needs a wow that Higgsfield makes possible; film needs
much better animation. Both Claude sessions work on lakat-web („obe“), so this round lives on its own branch; merge only on
his word. Nothing pushed.

## Done on this branch
- `eca8d69` a2 form right after Tri koraka + reminder under privacy · a3 „Otvori Gmail“ is the only green button until the
  mail is confirmed · a4 CatchPoints after launch go to the App Store (was a dead button). WebKit 360/390/430 clean,
  post-launch checked on a forced-live build.

## Open
- **a5 measurement:** Vercel team is on **Hobby** → every `track()` call on the site collects nothing (custom events are
  Pro/Enterprise only). The funnel today = Vercel page views → `lista_cekanja` rows → `potvrdeno_at`, per `izvor`.
  PROD on 20. 10.: 19 real sign-ups, 16 confirmed (plus 1 test row). Decision for Petar: Vercel Pro, or a tiny own events
  table (needs SQL on PROD = his word).
- **a1 hero:** waits for the wow-hero round (a visible benefit line goes into whichever hero he picks).
- **Round 2 artifact:** four wow heroes as real prototypes with Codex keyframes (Job 25, `~/vault/00-Inbox/codex-lakat/
  2026-10-20-web-hero/`): A Krigla izlazi iz mobitela · B Šank (chalkboard timer) · C Grad se pali · D Ti si još na kauču.
  Plus b5 three Krigle at the bar (variant A mixed drinks, B they clink themselves), film v2 storyboard on real frames.
- Hero technique (research 20. 10.): poster image is the LCP, muted loop fades in over it after load (poke.com pattern),
  mobile-only encode ≤ ~1 MB, headline in CSS (blur/rise in). iOS Low Power Mode blocks autoplay → poster must stand alone.
  Scroll-scrubbed video stutters on iOS unless all-intra; image sequence on canvas is the safe route. Tap-reactive Krigla =
  Rive; one-off reactions = dotLottie or tiny MP4. Higgsfield gives MP4 only (no alpha) → render Krigla on #09090b.
- Who runs Higgsfield (MCP / Petar / Codex stills) — unanswered.

## State 2026-10-20 ~12:30 (after rounds 2 and 3)
Branch `web-max` rebased onto origin/main (the other session's 2 local „Privatnost v4“ commits are NOT in it).
- `b40e94e` a2/a3/a4 · `d20f107` three Krigle at the bar + own counter `web_koraci` (PROD table + rpc, created 20. 10.)
- `8f5d745` section Krigle animate on enter (CSS, 0 credits)
**Push rule (Petar):** one push only after Codex is back, the Higgsfield question is settled and every agreed change is built.

## Waiting for Codex (limit until 15:31; resume scheduled 15:37 if this session is still open)
1. Finish Job 25: hero-c-end, sank-krigle-b, align hero-a-end with hero-a-start.
2. **Four NEW scroll-driven hero examples** (round 3 S1–S4 are kept as examples: kauč→grad→šank, roleta, ulet u mobitel,
   spust na grad). Petar picks one → that one is built with Higgsfield (MCP, he picked „spoji na Claudea“).
3. **More film scenarios**; scenario B „Treći petak“ is saved (scripts: session scratchpad higgs-web/film/{a,b,c}.txt —
   B: Petak, 22:40. Ekipa je vani bez tebe. / Treći petak zaredom. / „Ante je vani u Gružu.“ / Krigla skoči s kauča. /
   Vrata. Stube. Grad se pali. / Ekipa za šankom. Kava, limunada, pivo. / 1. 12. u podne. / Idući petak kauč je prazan.)
4. Then a1 (benefit pill) goes into the chosen hero; build hero + film; QA; one push.
Artifacts: round 1 Fep2tavoCoQL7HaDM6xKUi (`webmax/`), round 2 VQoSh5GDkh442vdeSjHWSG (`runda2/`), round 3 Phfqeh7Qp9S4EdVSQENHcm (`runda3/`).

## Film scripts (docs/film/, one on-screen card per line, timed with ig-reel beats.py, all loop back to the hook)
A „Di ste?“ 16,4 s · B „Treći petak“ 16,4 s (**Petar saved it**) · C „Roleta“ 17,5 s · new: D „Zaključani ekran“ 17,5 s
(pairs with hero N1) · E „Karta“ 13,4 s (N2) · F „Od 18 do 23“ 17,5 s (N4). Codex Job 27 = frames for the four new heroes N1–N4.

## Next deliverable (Petar 2026-10-20 ~16:30)
Codex Job 28 = frames for four „jaw-drop" heroes W1 Neon (your @ime in neon) · W2 Svjetla (each lit window = a real confirmed
sign-up, 16 on 20. 10.) · W3 Diorama (4 depth layers) · W4 Kucni se (pick your drink, drag to clink). When it lands, ship
**two artifacts**: (1) all **12 heroes** as live scroll prototypes (S1–S4 round 3, N1–N4 round 4, W1–W4), one pick;
(2) all **scenarios** (A–F + new G–J for the W heroes), one pick. Petar then chooses; that hero is built with Higgsfield.

## Hero S6 „Tri petka" — Petar's final pick (2026-10-20 evening)
Round 5 artifact https://claude.ai/artifact/UHzJJrDg58VC8gX9TH1tGR (db `runda5/`): hero **S6**, film **L**. Clips by Codex in
Higgsfield (Job 30), all in `~/vault/00-Inbox/codex-lakat/2026-10-20-higgsfield-s6/izlaz/` (Kling Omni Frames Pro, 1080×1920;
66.25 credits total; polish list in its README „za poliranje"). Petar: no more generations, polish in assembly.
Chain (scroll order): c1 petak-1→2 · c2 petak-2→3 (face-down) · c3a (trim first ~2 s) face-down→looks at phone ·
c3b phone→jumps up · c3c **v1 reserve** cut before he exits the frame · c5 he waves in the open door · c4 three Krigle clink
(16:9 with side margins, draw contain on #09090b) → „Šank se otvara za…" + timer.
Build: `components/hero-s6.jsx` (client), canvas image sequence (webp, ~6 fps per clip, cross-blend neighbouring frames),
poster `<img>` = first frame for LCP, sticky stage; mobile full-bleed, desktop text left + 9:16 panel right (no 16:9 clips —
saves credits; revisit if Petar wants). Reduced motion: poster + text, no scroll track. Old `hero.jsx` kept.
