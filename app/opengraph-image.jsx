import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { isLive, remaining } from "@/lib/launch";

// Slika za dijeljenje koja se mijenja svaki dan: „Još 57 dana.“ (Petar d1).
export const alt = "LAKAT. Šank se otvara 1. 12.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image() {
  const anton = await readFile(join(process.cwd(), "assets/Anton-Regular.ttf"));
  const live = isLive();
  const d = remaining().d;
  const big = live ? "Šank je otvoren" : d > 1 ? `Još ${d} dana` : d === 1 ? "Još 1 dan" : "Danas u podne";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "radial-gradient(ellipse at 80% 40%, #12301d 0%, #09090B 60%)",
          color: "#F4F4F5",
          fontFamily: "Anton",
        }}
      >
        <div style={{ display: "flex", fontSize: 48 }}>
          LAKAT<span style={{ color: "#4ADE80" }}>.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 150, lineHeight: 0.95, textTransform: "uppercase" }}>
            {big}
            <span style={{ color: "#4ADE80" }}>.</span>
          </div>
          <div style={{ display: "flex", fontSize: 40, color: "#8B8B94", marginTop: 18, textTransform: "uppercase" }}>
            {live ? "Na iPhoneu. Android uskoro." : "1. 12. u podne na iPhoneu"}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Anton", data: anton, style: "normal", weight: 400 }] }
  );
}
