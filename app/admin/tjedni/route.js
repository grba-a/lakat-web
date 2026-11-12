// Tjedni sažetak (faza 4): Vercel cron (vercel.json, ponedjeljak 06:00 UTC) šalje ga Petru.
// Cron dolazi s „Authorization: Bearer CRON_SECRET" (Vercel Sensitive). Prijavljen admin može vidjeti
// pregled bez slanja: /admin/tjedni?pregled=1. Ništa drugo ne radi.
import { timingSafeEqual } from "node:crypto";
import { adminUkljucen, jesamLiAdmin } from "@/lib/admin";
import { posaljiTjedni, tjedniSazetak } from "@/lib/tjedni";

export const dynamic = "force-dynamic";

function cronOk(request) {
  const tajna = process.env.CRON_SECRET;
  const dosao = request.headers.get("authorization") ?? "";
  if (!tajna) return false;
  const a = Buffer.from(dosao), b = Buffer.from(`Bearer ${tajna}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request) {
  if (!adminUkljucen()) return new Response("Not found", { status: 404 });
  const url = new URL(request.url);
  if (url.searchParams.get("pregled") === "1") {
    if (!(await jesamLiAdmin())) return new Response("Not found", { status: 404 });
    const { html } = await tjedniSazetak();
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
  }
  if (!cronOk(request)) return new Response("Not found", { status: 404 });
  try {
    const naslov = await posaljiTjedni();
    return Response.json({ ok: true, naslov });
  } catch (e) {
    console.error("tjedni", String(e.message || e).slice(0, 200));
    return Response.json({ ok: false }, { status: 502 });
  }
}
