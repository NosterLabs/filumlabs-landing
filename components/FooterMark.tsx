'use client';

import { useRef } from 'react';

// The sign-off wordmark, printed layer by layer as the page ends (CSS, scroll-driven).
// Under a mouse the letters heat up around the pointer, nozzle orange, as if just extruded.
export default function FooterMark() {
  const ref = useRef<HTMLDivElement>(null);

  // CSS variables, not state: the heat follows every pointer move without a render
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = ref.current!.getBoundingClientRect();
    ref.current!.style.setProperty('--x', `${e.clientX - r.left}px`);
    ref.current!.style.setProperty('--y', `${e.clientY - r.top}px`);
  };

  // a hair space: at this size Urbanist's i dot touches the F's arm
  const word = (
    <>
      <b>F{' '}ilum</b>Labs
    </>
  );

  return (
    <div ref={ref} className="footer-mark" aria-hidden="true" onPointerMove={move}>
      <span>{word}</span>
      <span className="footer-heat">{word}</span>
    </div>
  );
}
