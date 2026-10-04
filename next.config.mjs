/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // Zasebna mapa za provjeru produkcijskog builda dok dev server radi (dijeljeni .next kvari Turbopack).
  distDir: process.env.NEXT_DIST || ".next",
};

export default nextConfig;
