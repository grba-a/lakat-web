import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { isLive, remaining } from "@/lib/launch";

// „Spremi za Story“ (Petar n1): slika 1080×1920 „Još N dana do LAKTA.“ s Kriglom, svaki dan nova brojka.
export const revalidate = 3600;

export async function GET() {
  const [anton, krigla] = await Promise.all([
    readFile(join(process.cwd(), "assets/Anton-Regular.ttf")),
    readFile(join(process.cwd(), "assets/krigla-og.png")),
  ]);
  const d = remaining().d;
  const big = isLive() ? "Šank je otvoren" : d > 1 ? `Još ${d} dana` : d === 1 ? "Još 1 dan" : "Danas u podne";
  const src = `data:image/png;base64,${krigla.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "140px 80px 170px",
          background: "radial-gradient(ellipse at 50% 62%, #163a24 0%, #09090B 58%)",
          color: "#F4F4F5",
          fontFamily: "Anton",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", fontSize: 72 }}>
          LAKAT<span style={{ color: "#4ADE80" }}>.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 190, lineHeight: 0.92, textTransform: "uppercase" }}>{big}</div>
          <div style={{ display: "flex", fontSize: 120, lineHeight: 1, textTransform: "uppercase", color: "#4ADE80" }}>
            {isLive() ? "" : "do LAKTA."}
          </div>
        </div>
        <img src={src} width={520} height={520} style={{ width: 520, height: 520 }} alt="" />
        <div style={{ display: "flex", fontSize: 46, color: "#8B8B94", letterSpacing: 2 }}>
          {isLive() ? "Na App Storeu" : "1. 12. u podne · iPhone"}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: [{ name: "Anton", data: anton, style: "normal", weight: 400 }],
    }
  );
}
