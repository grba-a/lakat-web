import { FeatureTour } from "./feature-tour";
import { FeatureTourMobile } from "./feature-tour-mobile";
import { HeroS6 } from "./hero-s6";
import { HuntNagrada } from "./hunt";
import { Faq, Film, Footer, Mreze, PlayGame, Privacy, TriKoraka, WaitlistSection } from "./sections";
import { LaunchTakeover } from "./launch-takeover";
import { Ozivi } from "./ozivi";
import { PwaSaved } from "./pwa-saved";
import { StickyCta } from "./sticky-cta";
import { APP_STORE, isLive } from "@/lib/launch";

// Cijela stranica, nova struktura (Petar, 15. 10., j-nova-struktura): devet sekcija, svaka s jednim poslom.
// 1 hero (što je i kad) · 2 tri koraka · 3 rezerviraj @ime · 4 tura · 5 privatnost + podsjetnik · 6 film · 7 igra · 8 FAQ · 9 mreže + podnožje.
// Obrazac je odmah ispod tri koraka (Codex/Claude 20. 10., a2): tko čita redom, ne mora proći turu od tri i pol ekrana.
// Napunite Kriglu, Kvart protiv kvarta i tapete su na /potvrdeno; Podne seli na Instagram.
// `challenge` = rezultat pajdaša kad netko dođe preko izazova (/i/37).
export function Home({ challenge = null }) {
  const live = isLive();
  return (
    <>
      <main className="overflow-x-clip">
        <HeroS6 live={live} />
        <TriKoraka live={live} />
        <WaitlistSection live={live && Boolean(APP_STORE)} />
        <FeatureTourMobile />
        <FeatureTour />
        <Privacy live={live} />
        <Film live={live} />
        <PlayGame challenge={challenge} live={live} />
        <Faq live={live} />
        <Mreze live={live} />
      </main>
      <Footer />
      <StickyCta live={live} />
      <LaunchTakeover />
      <PwaSaved live={live} />
      <HuntNagrada />
      <Ozivi />
    </>
  );
}
