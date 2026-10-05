import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { parseScore } from "@/lib/daily";

export const alt = "LAKAT. Izazov iz igre dana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const r = parseScore((await params).r) ?? 0;
  const anton = await readFile(join(process.cwd(), "assets/Anton-Regular.ttf"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "radial-gradient(ellipse at 78% 45%, #12301d 0%, #09090B 62%)", color: "#F4F4F5", fontFamily: "Anton" }}>
        <div style={{ display: "flex", fontSize: 48 }}>
          LAKAT<span style={{ color: "#4ADE80" }}>.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 44, color: "#8B8B94", textTransform: "uppercase" }}>Pajdaš ima</div>
          <div style={{ display: "flex", fontSize: 230, lineHeight: 0.9, color: "#4ADE80" }}>{r}</div>
          <div style={{ display: "flex", fontSize: 70, textTransform: "uppercase" }}>
            Možeš li bolje<span style={{ color: "#4ADE80" }}>?</span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Anton", data: anton, style: "normal", weight: 400 }] }
  );
}
