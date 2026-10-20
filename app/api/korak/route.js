import { korak } from "@/lib/lista";

// Brojač koraka (lib/korak.js šalje sendBeaconom). Uvijek 204: stranica nikad ne čeka niti vidi grešku.
export async function POST(request) {
  try {
    const b = await request.json();
    await korak(String(b?.k || ""), b?.izvor, b?.v);
  } catch (e) {
    console.error("korak", String(e).slice(0, 200));
  }
  return new Response(null, { status: 204 });
}
