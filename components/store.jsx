import { APP_STORE } from "@/lib/launch";

// Nakon lansiranja: App Store + „Android uskoro“ (Petar s6: iOS 1. 12., Android poslije).
// TODO prije 1. 12.: zamijeniti službenim Appleovim badgeom (SVG s developer.apple.com),
// „App Store“ se nikad ne prevodi, badge ne animiramo i ne naginjemo.
export function StoreButtons({ className = "" }) {
  return (
    <div className={`grid justify-items-center gap-3 md:justify-items-start ${className}`}>
      <a
        href={APP_STORE || "#lista"}
        className="inline-flex h-[54px] items-center gap-3 rounded-[12px] border border-[#a6a6a6] bg-black px-5 text-left text-white"
        aria-label="Preuzmi LAKAT na App Storeu"
      >
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
          <path d="M16.37 12.79c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.71-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.54 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.24 2.73 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.41 1.2-2.47-.03-.01-2.3-.88-2.32-3.52zM14.2 6.33c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.31-.56.65-1.05 1.69-.92 2.68.97.08 1.96-.49 2.56-1.23z" />
        </svg>
        <span className="leading-tight">
          <span className="block text-[11px]">Preuzmi na</span>
          <span className="block text-[19px] font-semibold tracking-tight">App Store</span>
        </span>
      </a>
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Android uskoro</span>
    </div>
  );
}
