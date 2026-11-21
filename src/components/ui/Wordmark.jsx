// The NIBBLŌ wordmark: set in the display face, with the little leaf from the pack over the Ō.
export default function Wordmark({ className = "", title = true }) {
  return (
    <span className={className} aria-label={title ? "NIBBLŌ" : undefined} style={{ position: "relative", display: "inline-block", fontWeight: 800, letterSpacing: "-.02em" }}>
      <span aria-hidden="true">NIBBL</span>
      <span aria-hidden="true" style={{ position: "relative", display: "inline-block" }}>
        O
        <svg viewBox="0 0 40 28" aria-hidden="true" style={{ position: "absolute", left: "38%", top: "-.34em", width: ".52em", height: ".36em" }}>
          <path d="M4 26C4 12 14 3 30 2c0 14-10 24-26 24Z" fill="currentColor" />
          <path d="M22 12c6-4 11-5 16-5-4 3-9 8-13 15" fill="currentColor" opacity=".7" />
        </svg>
      </span>
    </span>
  );
}
