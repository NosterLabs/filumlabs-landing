'use client';

import { useEffect, useRef } from 'react';

// The closing shot behind the footer's drop zone: a printer at work, played once when it comes into view.
// It is a generated illustration (Veo), not footage of our workshop, so no copy refers to it.
// Reduced motion keeps the poster, which is the clip's last frame.
export default function EndShot() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current!;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div className="footer-film" aria-hidden="true">
      <video ref={ref} src="/video/a1-mini.mp4" poster="/video/a1-mini.webp" muted playsInline preload="none" />
    </div>
  );
}
