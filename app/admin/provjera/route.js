// Faza U: pg_cron (Supabase) svakih 5 min šalje POST s tajnom iz Vaulta (x-uzbune-tajna). Bez točne tajne: 404.
// Ruta ne vraća nikakve podatke, samo koliko je uzbuna aktivno i poslano.
import { krug, tajnaOk } from "@/lib/uzbune-isporuka";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request) {
  if (!(await tajnaOk(request.headers.get("x-uzbune-tajna")))) return new Response("Not found", { status: 404 });
  try {
    return Response.json({ ok: true, ...(await krug()) });
  } catch (e) {
    console.error("provjera", String(e.message || e).slice(0, 200));
    return Response.json({ ok: false }, { status: 502 });
  }
}

export function GET() {
  return new Response("Not found", { status: 404 });
}
