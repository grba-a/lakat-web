# laktarenje.com — pre-order + 1.1 update (Petar, 5. 11. 2026)

Decisions: artifacts FWwPWyfHAExzrnTReDmNHJ (db `web/`, all 13 cards „da") and DAJgf4t8mS9EJmeRxVTRZC (db `hero/`: A „Lakat na šanku",
note: App Store button = real Apple badge). Branch `prednarudzba` in `~/Projects/lakat-web-privatnost`, dev :3007. Nothing deploys
without Petar's word. Animations: „web treba biti fora s dosta animacija (ne previše); mora biti brz na mobitelu" → CSS-first,
transform/opacity only, IntersectionObserver reveals with a visible resting state, `prefers-reduced-motion` = off, no GSAP on the hero,
no Lenis, no new dependencies.

## Timing (card `kad`)
Pre-order items go live with the pre-order deploy. Everything about 1.1 features is built now but gated: render only when
`process.env.NEXT_PUBLIC_LAKAT_11 === "1"` (local preview sets it; production gets it when Apple approves 1.1).

## Owner: main session
- Hero A (`components/hero-pre.jsx`): full-bleed scene `~/Projects/lakat-hero/out/01-lakat-na-sanku.png` → `public/img/hero/*`,
  „Ima li koga?", sub, `components/app-store-badge.jsx` (official badge `public/badges/app-store.svg`), Android link.

## Owner: implementation agent (all other cards)
koraci · lista · tura · jos11 · zvono · privatnost · gumbi · faq · mreze · meta · stojelakat · ispravci — card texts and visuals are in
the web artifact (read db `web/` and the artifact page source via the Artifact tool `read`). Petar's notes: koraci „ali druga slika za
3"; tura „sve novo da"; zvono „animiraj ovo; … mora biti brz na mobitelu".
