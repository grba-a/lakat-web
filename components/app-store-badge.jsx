import { storeLink } from "@/lib/launch";

// Službeni Appleov badge (toolbox.marketingtools.apple.com, „Download on the App Store", crni; Petar 5. 11. „mora biti kao pravi
// app store button"). Apple ga ne nudi na hrvatskom ni kao „Pre-order", pa iznad njega po potrebi stoji naš natpis.
// Pravila: ne mijenjati boje ni proporcije, ne animirati badge, „App Store" se ne prevodi; visina na ekranu ≥ 40 px.
export function AppStoreBadge({ ct = "web", height = 54, className = "", label = "Prednaruči LAKAT na App Storeu" }) {
  const href = storeLink(ct);
  if (!href) return null;
  const width = Math.round((height * 119.66407) / 40);
  return (
    <a href={href} aria-label={label} className={`inline-block rounded-[10px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${className}`}>
      <img src="/badges/app-store.svg" alt="Download on the App Store" width={width} height={height} className="block" style={{ height, width }} />
    </a>
  );
}
