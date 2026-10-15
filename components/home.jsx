import { FeatureTour } from "./feature-tour";
import { FeatureTourMobile } from "./feature-tour-mobile";
import { Hero } from "./hero";
import { Faq, Film, Footer, Mreze, PlayGame, Privacy, TriKoraka, WaitlistSection } from "./sections";
import { LaunchTakeover } from "./launch-takeover";
import { PwaSaved } from "./pwa-saved";
import { StickyCta } from "./sticky-cta";
import { APP_STORE, isLive } from "@/lib/launch";

// Cijela stranica, nova struktura (Petar, 15. 10., j-nova-struktura): devet sekcija, svaka s jednim poslom.
// 1 hero (što je i kad) · 2 tri koraka · 3 tura · 4 privatnost · 5 rezerviraj @ime · 6 film · 7 igra · 8 FAQ · 9 mreže + podnožje.
// Napunite Kriglu, Kvart protiv kvarta i tapete su na /potvrdeno; Podne seli na Instagram.
// `challenge` = rezultat pajdaša kad netko dođe preko izazova (/i/37).
export function Home({ challenge = null }) {
  const live = isLive();
  return (
    <>
      <main className="overflow-x-clip">
        <Hero live={live} />
        <TriKoraka live={live} />
        <FeatureTourMobile />
        <FeatureTour />
        <Privacy />
        <WaitlistSection live={live && Boolean(APP_STORE)} />
        <Film />
        <PlayGame challenge={challenge} />
        <Faq live={live} />
        <Mreze live={live} />
      </main>
      <Footer />
      <StickyCta live={live} />
      <LaunchTakeover />
      <PwaSaved live={live} />
    </>
  );
}
