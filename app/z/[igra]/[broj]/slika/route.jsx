import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { procitaj } from "@/lib/izazov";

// Pretpregled izazova u chatu (/z/[igra]/[broj]?od=…): „Gajba: mate ima 120." + „Sruši to.".
// Ruta, ne opengraph-image, jer ta ne dobije ?od=. Isti izgled kao app/opengraph-image.jsx i
// pozivnica /f u lakat-pwa: Anton, LAKAT. sa zelenom točkom, Krigla desno. Na slici je samo ono što
// je i u linku (igra, broj, ime), pa za isti URL slika uvijek ista.

const SIZE = { width: 1200, height: 630 };
const ZELENA = "#4ADE80";

// Najduža riječ (dug nadimak) mora stati u jedan red lijevo od Krigle; Anton je ~0,5 em po znaku u verzalu, manje u malim slovima.
function velicina(tekst) {
  const n = tekst.length;
  const tier = n <= 12 ? 124 : n <= 22 ? 104 : n <= 36 ? 84 : 68;
  // Široka slova (m, w) broje se kao 0,75 em, ostala 0,5 em: i „wwww…" od 24 znaka stane.
  const sirina = (r) => [...r].reduce((a, c) => a + (/[mwMW]/.test(c) ? 0.75 : 0.5), 0);
  const najdulja = Math.max(...tekst.split(/\s+/).map(sirina), 1);
  return Math.min(tier, Math.floor(630 / najdulja));
}

export async function GET(request, { params }) {
  const z = procitaj(await params, { od: request.nextUrl.searchParams.get("od") });
  if (!z) return new Response("Nema", { status: 404 });

  const [anton, krigla] = await Promise.all([
    readFile(join(process.cwd(), "assets/Anton-Regular.ttf")),
    readFile(join(process.cwd(), "assets/krigla-og.png"), "base64"),
  ]);
  const naslov = `${z.naziv}: ${z.od} ima ${z.broj}`;
  const rijeci = naslov.split(/\s+/);
  const fs = velicina(naslov);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "radial-gradient(ellipse at 80% 45%, #12301d 0%, #09090B 62%)",
          color: "#F4F4F5",
          fontFamily: "Anton",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse ne zna za next/image */}
        <img src={`data:image/png;base64,${krigla}`} width={430} height={429} style={{ position: "absolute", right: 44, bottom: 56 }} alt="" />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 720, height: "100%", padding: "64px 0 64px 72px" }}>
          <div style={{ display: "flex", fontSize: 48 }}>
            LAKAT<span style={{ color: ZELENA }}>.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexWrap: "wrap", fontSize: fs, lineHeight: 0.98 }}>
              {rijeci.map((r, i) => (
                <span key={i} style={{ display: "flex", marginRight: i === rijeci.length - 1 ? 0 : fs * 0.22 }}>
                  {r}
                  {i === rijeci.length - 1 ? <span style={{ color: ZELENA }}>.</span> : null}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", fontSize: 64, marginTop: 18, textTransform: "uppercase" }}>
              Sruši to<span style={{ color: ZELENA }}>.</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...SIZE, fonts: [{ name: "Anton", data: anton, style: "normal", weight: 400 }] }
  );
}
