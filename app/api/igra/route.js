import { createHmac } from "node:crypto";
import { dbReady, igraLjestvica, igraUpis } from "@/lib/lista";
import { cistiNadimak, provjeriNadimak } from "@/lib/nadimak";

// Javna ljestvica igre dana (Petar, 15. 10.). Bez mailova; nadimak, rezultat i dan.
// Dok Petar ne pokrene docs/supabase-igra1.sql, obje rute vraćaju 503 i ljestvice na stranici nema.

export async function GET() {
  if (!dbReady()) return Response.json({ ok: false }, { status: 503 });
  try {
    const lista = await igraLjestvica();
    return Response.json({ ok: true, lista }, { headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60" } });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}

export async function POST(request) {
  if (!dbReady()) return Response.json({ ok: false }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  if (body?.web) return Response.json({ ok: true });
  const greska = provjeriNadimak(body?.ime);
  if (greska) return Response.json({ poruka: greska }, { status: 400 });
  const rezultat = Number(body?.rezultat);
  if (!Number.isInteger(rezultat) || rezultat < 1 || rezultat > 999) return Response.json({ poruka: "Taj rezultat ne ide." }, { status: 400 });
  // Otisak IP-a s tajnim ključem servera (ne sama adresa), samo da jedan uređaj ne zatrpa ljestvicu.
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "nepoznato";
  const otisak = createHmac("sha256", process.env.SUPABASE_SECRET_KEY || "lakat").update(ip).digest("hex").slice(0, 32);
  try {
    const r = await igraUpis(cistiNadimak(body.ime), rezultat, otisak);
    if (r === "ok") return Response.json({ ok: true });
    if (r === "cesto") return Response.json({ poruka: "Polako, prvak. Probaj za par minuta." }, { status: 429 });
    return Response.json({ poruka: r === "ime" ? "Taj nadimak ne ide na ljestvicu. Probaj drugi." : "Taj rezultat ne ide." }, { status: 400 });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
