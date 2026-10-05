import { dbReady, imeSlobodno } from "@/lib/lista";

// Je li ime slobodno za rezervaciju (w09).
export async function GET(request) {
  const u = String(new URL(request.url).searchParams.get("u") || "").toLowerCase();
  if (!dbReady()) return Response.json({ slobodno: null }, { status: 503 });
  if (!/^[a-z0-9_.]{3,20}$/.test(u)) return Response.json({ slobodno: false, poruka: "3 do 20 slova, brojki, točka ili donja crta." });
  const slobodno = await imeSlobodno(u).catch(() => null);
  return Response.json({ slobodno });
}
