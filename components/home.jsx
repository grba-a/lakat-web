import { FeatureTour } from "./feature-tour";
import { FeatureTourMobile } from "./feature-tour-mobile";
import { HeroPre } from "./hero-pre";
import { HeroS6 } from "./hero-s6";
import { HuntNagrada } from "./hunt";
import { AppStoreBadge } from "./app-store-badge";
import { Jos11 } from "./jos-11";
import { Meni } from "./meni";
import { PrvoZvono } from "./prvo-zvono";
import { Reveal } from "./reveal";
import { Faq, Film, Footer, Mreze, PlayGame, Privacy, TriKoraka, WaitlistSection } from "./sections";
import { LaunchTakeover } from "./launch-takeover";
import { Ozivi } from "./ozivi";
import { PwaSaved } from "./pwa-saved";
import { StickyCta } from "./sticky-cta";
import { APP_STORE, LAKAT_11, isLive, isPreorder, prvoZvonoDolazi } from "@/lib/launch";

// Cijela stranica, nova struktura (Petar, 15. 10., j-nova-struktura): devet sekcija, svaka s jednim poslom.
// 1 hero (što je i kad) · 2 tri koraka · 3 rezerviraj @ime · 4 tura · 5 privatnost + podsjetnik · 6 film · 7 igra · 8 FAQ · 9 mreže + podnožje.
// Obrazac je odmah ispod tri koraka (Codex/Claude 20. 10., a2): tko čita redom, ne mora proći turu od tri i pol ekrana.
// Napunite Kriglu, Kvart protiv kvarta i tapete su na /potvrdeno; Podne seli na Instagram.
// `challenge` = rezultat pajdaša kad netko dođe preko izazova (/i/37).
export function Home({ challenge = null }) {
  const live = isLive();
  // Prednarudžba (5. 11.): jednostavan hero s gumbom za App Store umjesto scene „Tri petka".
  const preorder = !live && isPreorder();
  const zvono = prvoZvonoDolazi();
  // Izbornik (Petar 5. 11.): samo sekcije i stranice koje postoje u ovom stanju stranice.
  const linkovi = [
    ["#kako-radi", "Kako radi"],
    ["#lista", live || preorder ? "Imaš Android?" : "Javi mi prvi"],
    ["#tura", "Što stiže"],
    ...(LAKAT_11 ? [["#novo", "Još u 1.1"]] : []),
    ...(zvono ? [["#prvo-zvono", "Prvo zvono"]] : []),
    ["#privatnost", "Privatnost"],
    ["#faq", "Pitanja"],
    ["/sto-je-lakat", "Što je LAKAT"],
    ["/press", "Press"],
  ];
  const dno =
    preorder || (live && APP_STORE) ? (
      <>
        <p className="text-[15px] font-semibold text-soft">{preorder ? "Prednaruči, 1. 12. se sam skine." : "LAKAT je na App Storeu."}</p>
        <AppStoreBadge ct="web-meni" height={48} label={preorder ? "Prednaruči LAKAT na App Storeu" : "Skini LAKAT na App Storeu"} />
      </>
    ) : null;
  return (
    <>
      <main className="overflow-x-clip">
        {preorder ? <HeroPre /> : <HeroS6 live={live} />}
        <TriKoraka live={live} />
        <WaitlistSection live={live && Boolean(APP_STORE)} />
        <div id="tura" className="scroll-mt-4">
          <FeatureTourMobile />
          <FeatureTour />
        </div>
        {/* 1.1 (5. 11.): traka novosti ispod ture, pa Prvo zvono (pet 4. 12.) između ture i privatnosti. */}
        {LAKAT_11 && <Jos11 />}
        {zvono && <PrvoZvono />}
        <Privacy live={live} />
        <Film live={live} />
        <PlayGame challenge={challenge} live={live} />
        <Faq live={live} />
        <Mreze live={live} />
      </main>
      <Footer />
      <div className="md:hidden">
        <Meni linkovi={linkovi} dno={dno} />
      </div>
      <StickyCta live={live} />
      <LaunchTakeover />
      <PwaSaved live={live} />
      <HuntNagrada />
      <Ozivi />
      <Reveal />
    </>
  );
}
