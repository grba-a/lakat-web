import { cookies } from "next/headers";
import { GRADOVI } from "@/lib/gradovi";
import { dbReady, postaviKvart } from "@/lib/lista";

// Grad i kvart nakon potvrde maila (j-kvart-poslije, forma-dva-koraka). Nije obavezno.
// Tko je tko zna samo kolačić postavljen u /potvrdi (token iz maila), nikad ref kod iz javnog linka.
export async function POST(request) {
  if (!dbReady()) return Response.json({ poruka: "Lista još nije spojena." }, { status: 503 });
  const token = (await cookies()).get("lakat_upis")?.value;
  if (!token) return Response.json({ poruka: "Otvori link iz maila pa probaj opet." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const grad = GRADOVI.includes(body?.grad) ? body.grad : null;
  const kvart = String(body?.kvart || "").replace(/[<>"`]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
  if (!grad) return Response.json({ poruka: "Odaberi grad." }, { status: 400 });
  if (kvart.length < 2) return Response.json({ poruka: "Upiši kvart." }, { status: 400 });
  try {
    const ok = await postaviKvart(token, grad, kvart);
    if (!ok) return Response.json({ poruka: "Otvori link iz maila pa probaj opet." }, { status: 401 });
    return Response.json({ ok: true });
  } catch (e) {
    console.error("kvart", String(e).slice(0, 200));
    return Response.json({ poruka: "Nešto je puklo kod nas. Probaj za minutu." }, { status: 502 });
  }
}
