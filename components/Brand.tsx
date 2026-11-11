// The FilumLabs mark (encastre F) and the NosterLabs endorsement, from brand/logo/.

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="22 22 56 56" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28 64V28h32" />
        <path d="M32 46h12" />
        <path d="M72 38v34H44" />
      </g>
    </svg>
  );
}

export function NosterLabs({ className }: { className?: string }) {
  return (
    <svg viewBox="8 -0.5 394 62" className={className} role="img" aria-label="NosterLabs">
      <use href="/nosterlabs-mono.svg#mark" />
    </svg>
  );
}
