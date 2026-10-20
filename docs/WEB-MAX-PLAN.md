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
