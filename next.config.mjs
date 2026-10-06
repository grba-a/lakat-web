// Prelazak domene (Petar d1–d8, 2026-10-05): kad laktarenje.com pokazuje na ovaj projekt, sve što
// iOS aplikacija i mailovi trebaju ide tiho na stari projekt (LAKAT_API_ORIGIN, npr. https://api.laktarenje.com).
// Bez te varijable nema prosljeđivanja, pa lakat-web.vercel.app radi kao i prije.
const API = process.env.LAKAT_API_ORIGIN;
const PROXIED = [
  "/api/native/:path*",
  "/f/:path*",
  "/s/:path*",
  "/zaboravio-lozinku",
  "/reset-lozinka",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // Zasebna mapa za provjeru produkcijskog builda dok dev server radi (dijeljeni .next kvari Turbopack).
  distDir: process.env.NEXT_DIST || ".next",
  async rewrites() {
    if (!API) return [];
    return {
      beforeFiles: PROXIED.map((source) => ({ source, destination: `${API}${source}` })),
      // Stranice starog projekta (/f, /s, reset) traže svoje JS/CSS na istoj domeni. Što ovaj web
      // nema u svojim datotekama, uzme se sa starog projekta (imena su hashirana, ne sudaraju se).
      fallback: [
        { source: "/_next/static/:path*", destination: `${API}/_next/static/:path*` },
        { source: "/_next/image", destination: `${API}/_next/image` },
        { source: "/:file(icon-192\\.png|icon-512\\.png|icon-maskable-512\\.png|avatar-placeholder\\.png|manifest\\.webmanifest)", destination: `${API}/:file` },
        // Vercel Analytics starog projekta na proxyjanim stranicama (njegov hash, ne dira analitiku ovog weba).
        { source: "/dfcd78be713b0bc3/:path*", destination: `${API}/dfcd78be713b0bc3/:path*` },
      ],
    };
  },
  // Stare adrese web aplikacije (zabilješke, početni ekran, linkovi iz pusheva) nakon prelaska vode
  // na početnu, gdje instalirani web app vidi „Račun ti je spremljen“. Privremeno (307), da ne zaglavi u cacheu.
  async redirects() {
    const stare = ["/login", "/register", "/welcome", "/uskoro", "/mapa", "/rang", "/igre", "/liga", "/upute", "/profil/:path*", "/profil", "/korisnik/:path*"];
    return stare.map((source) => ({ source, destination: "/", permanent: false }));
  },
  async headers() {
    // Novi service worker mora stići odmah, inače stari na instaliranim web appovima čeka 24 h.
    return [
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
