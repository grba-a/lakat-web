// Generički mobitel u CSS-u. Namjerno nije iPhone: Appleove marketinške smjernice
// zabranjuju 3D prikaz ili simulaciju njihovih uređaja.
export function Phone({ width = 200, className = "", style, children }) {
  return (
    <div className={`phone ${className}`} style={{ "--w": typeof width === "number" ? `${width}px` : width, ...style }}>
      <div className="phone-screen">{children}</div>
      <div className="phone-glare" />
    </div>
  );
}

// LAKAT splash: metalni wordmark, zelena točka, polje točkica koje diše.
export function Splash() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-bg">
      <div className="dots breathe absolute -inset-[4%] opacity-75" />
      <div className="phone-punch" />
      <p
        className="relative font-display leading-none"
        style={{ fontSize: "calc(var(--w) * 0.2)" }}
        aria-label="Lakat"
      >
        <span className="metal">LAKAT</span>
        <span className="text-accent">.</span>
      </p>
    </div>
  );
}
