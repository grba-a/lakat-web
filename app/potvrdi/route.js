import { potvrdi, uListu } from "@/lib/lista";

// Kolačić s tokenom iz maila: samo onaj tko je kliknuo potvrdu smije poslije upisati svoj kvart (/api/lista/kvart).
const UPIS_COOKIE = "lakat_upis";

// Link iz maila za potvrdu: označi upis potvrđenim, doda kontakt u Brevo listu i vodi na ulaznicu.
export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("t");
  const row = await potvrdi(token).catch(() => null);
  if (!row) return Response.redirect(new URL("/potvrdeno?greska=1", url), 302);
  await uListu(row).catch((e) => console.error("brevo lista", String(e).slice(0, 200)));
  const secure = url.protocol === "https:" ? "; Secure" : "";
  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(`/potvrdeno?r=${row.ref_kod}`, url).toString(),
      "Set-Cookie": `${UPIS_COOKIE}=${row.token}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax${secure}`,
    },
  });
}
