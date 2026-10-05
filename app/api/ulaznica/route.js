import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { dbReady, poRefu } from "@/lib/lista";

// Ulaznica za šank (w05): 1080×1920 za Instagram story, s QR kodom na osobni link (w06).
export async function GET(request) {
  const url = new URL(request.url);
  const ref = url.searchParams.get("r");
  const row = dbReady() ? await poRefu(ref).catch(() => null) : null;
  if (!row) return new Response("Nema ulaznice", { status: 404 });
  const anton = await readFile(join(process.cwd(), "assets/Anton-Regular.ttf"));
  const link = `${url.origin}/?ref=${row.ref_kod}`;
  const qr = await QRCode.toString(link, { type: "svg", margin: 1, color: { dark: "#09090B", light: "#F3F1EA" } });
  const name = row.ime ? `@${row.ime}` : "Pajdaš";
  const mjesto = [row.kvart, row.grad].filter(Boolean).join(", ");

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at 50% 45%, #163a24 0%, #09090B 60%)", fontFamily: "Anton" }}>
        <div style={{ width: 860, display: "flex", flexDirection: "column", background: "#F3F1EA", borderRadius: 40, color: "#111", transform: "rotate(-3deg)" }}>
          <div style={{ display: "flex", flexDirection: "column", padding: "64px 64px 40px", borderBottom: "6px dashed #bbb" }}>
            <div style={{ display: "flex", fontSize: 40, letterSpacing: 6 }}>LAKAT. · ULAZ NA ŠANK</div>
            <div style={{ display: "flex", fontSize: 150, lineHeight: 1, marginTop: 30 }}>1. 12. · 12:00</div>
            <div style={{ display: "flex", fontSize: 74, marginTop: 24 }}>{name}</div>
            {mjesto && <div style={{ display: "flex", fontSize: 48, color: "#555", marginTop: 8 }}>{mjesto}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "40px 64px 56px" }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 44, lineHeight: 1.1, maxWidth: 420 }}>
              <span>Skeniraj i</span>
              <span>uđi sa mnom.</span>
            </div>
            <img src={`data:image/svg+xml;base64,${Buffer.from(qr).toString("base64")}`} width={260} height={260} alt="" />
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920, fonts: [{ name: "Anton", data: anton, style: "normal", weight: 400 }] }
  );
}
