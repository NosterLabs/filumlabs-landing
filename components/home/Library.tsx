'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { LIMITS, WA_PENDING, waLink } from '@/lib/whatsapp';
import s from './Library.module.css';

// what the search field suggests, typed one after another while the section is on screen
const IDEAS = ['soporte para auriculares', 'maceta geométrica', 'organizador de cajón', 'gancho para bicicleta', 'repuesto de perilla'];

const search = (q: string) => `https://makerworld.com/es/search/models?keyword=${encodeURIComponent(q)}`;

// For people without a file: MakerWorld's library to find one, and a custom design when nothing fits.
// The plate prints itself in as it scrolls into view (CSS), and tilts a little under the mouse.
export default function Library() {
  const plate = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState('');
  const [hint, setHint] = useState(IDEAS[0]);

  // types the suggestions into the placeholder, only while the plate is visible
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer = 0, i = 0, n = 0;
    const tick = () => {
      const word = IDEAS[i];
      setHint(word.slice(0, ++n));
      if (n < word.length) timer = window.setTimeout(tick, 55);
      else {
        n = 0;
        i = (i + 1) % IDEAS.length;
        timer = window.setTimeout(tick, 1800);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      clearTimeout(timer);
      if (e.isIntersecting) timer = window.setTimeout(tick, 400);
    });
    io.observe(plate.current!);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // CSS variables, not state: tilt and glare follow the mouse without a render
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = plate.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${(0.5 - y) * 4}deg`);
    el.style.setProperty('--ry', `${(x - 0.5) * 5}deg`);
    el.style.setProperty('--gx', `${x * 100}%`);
    el.style.setProperty('--gy', `${y * 100}%`);
  };
  const leave = () => {
    plate.current!.style.setProperty('--rx', '0deg');
    plate.current!.style.setProperty('--ry', '0deg');
  };

  return (
    <>
      <div ref={plate} className={s.plate} onPointerMove={move} onPointerLeave={leave}>
        <div className={s.photo} aria-hidden="true">
          <Image src="/renders/plate.webp" alt="" fill sizes="(max-width: 1440px) 100vw, 1440px" />
        </div>
        <i className={s.nozzle} aria-hidden="true" />
        <div className={s.copy}>
          <p className={s.eyebrow}>¿No tenés el archivo?</p>
          <h2 id="disenos-title">Hay miles de diseños listos para imprimir.</h2>
          <p className={s.lede}>
            Buscalo en MakerWorld, la biblioteca de modelos 3D de Bambu Lab. Si encontrás uno, mandanos el link: revisamos que su licencia permita imprimirlo y te lo cotizamos.
          </p>
          <form
            className={s.search}
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              open(search(q.trim()), '_blank', 'noopener');
            }}
          >
            <input type="search" maxLength={LIMITS.short} aria-label="Qué diseño buscás" placeholder={`Buscá «${hint}»`} value={q} onChange={(e) => setQ(e.target.value)} />
            <button type="submit" className="btn">
              Buscar en MakerWorld
            </button>
          </form>
        </div>
      </div>

      <div className={s.custom}>
        {/* a drawing of a part with its dimensions, traced as it scrolls in */}
        <svg className={s.sketch} viewBox="0 0 132 108" aria-hidden="true">
          <path pathLength={1} d="M8 88H112V80H52L84 18L76 14L40 80H16V70H8Z" />
          <path pathLength={1} className={s.dim} d="M8 98H112M8 94V102M112 94V102M122 14V88M118 14H126M118 88H126" />
          <text x="60" y="107">104</text>
          <text x="128" y="54" transform="rotate(90 128 54)">74</text>
        </svg>
        <div className={s.customCopy}>
          <h3>¿No existe lo que buscás? Lo diseñamos.</h3>
          <p>Contanos qué necesitás, con medidas o una foto, y te armamos el modelo a medida para imprimirlo.</p>
        </div>
        <a className="btn btn--ghost" href={waLink('Hola FilumLabs, quiero un diseño a medida. Necesito: ')} target="_blank" rel="noopener noreferrer">
          Contar mi proyecto
        </a>
        {WA_PENDING && <p className="wa-note">Número de WhatsApp pendiente: el mensaje se abre para que elijas el contacto.</p>}
      </div>
    </>
  );
}
