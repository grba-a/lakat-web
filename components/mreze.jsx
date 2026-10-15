// Ikone mreža, nacrtane u istoj liniji (2 px, zaobljeni krajevi) da stoje zajedno.
export function MrezaIkona({ id, size = 20 }) {
  const p = { viewBox: "0 0 24 24", width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (id === "instagram")
    return (
      <svg {...p}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
      </svg>
    );
  if (id === "tiktok")
    return (
      <svg {...p}>
        <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
        <path d="M14 3c.4 2.6 2.2 4.4 5 4.7" />
      </svg>
    );
  if (id === "facebook")
    return (
      <svg {...p}>
        <path d="M14.5 21v-7.5H17l.5-3h-3V8.8c0-.9.4-1.5 1.6-1.5h1.5V4.6c-.6-.1-1.4-.2-2.3-.2-2.4 0-3.8 1.4-3.8 3.9v2.2H9v3h2.5V21" />
      </svg>
    );
  return null;
}
