import QRCode from "qrcode";
import { storeLink } from "@/lib/launch";

// Nakon lansiranja na desktopu (Petar q5): skeniraš mobitelom i ideš ravno na App Store.
// Crta se na serveru kao SVG, bez JS-a u pregledniku.
export async function StoreQR() {
  const url = storeLink("web-qr");
  if (!url) return null;
  const svg = await QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#09090B", light: "#F4F4F5" } });
  return (
    <div className="hidden items-center gap-4 md:flex">
      <div className="size-[112px] overflow-hidden rounded-xl bg-fg p-1.5" dangerouslySetInnerHTML={{ __html: svg }} aria-label="QR kod za App Store" role="img" />
      <p className="max-w-[18ch] text-[14px] text-muted">Skeniraj mobitelom i skini LAKAT.</p>
    </div>
  );
}
