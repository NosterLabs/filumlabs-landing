'use client';

import { useEffect, useRef, useState } from 'react';
import s from './Typed.module.css';

// A chat message that types itself the first time it comes into view.
// The full text sits underneath, invisible, so the bubble never changes size while it types.
export default function Typed({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [n, setN] = useState(text.length);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setN(0);
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        let i = 0;
        timer = window.setInterval(() => {
          i = Math.min(text.length, i + 3);
          setN(i);
          if (i >= text.length) clearInterval(timer);
        }, 16);
      },
      { threshold: 0.5 },
    );
    io.observe(ref.current!);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
  }, [text]);

  return (
    <p ref={ref} className={`${s.typed} ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={s.ghost}>
        {text}
      </span>
      <span aria-hidden="true">
        {text.slice(0, n)}
        {n < text.length && <i className={s.caret} />}
      </span>
    </p>
  );
}
