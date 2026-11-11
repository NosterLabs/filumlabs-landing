'use client';

import { useRef, ViewTransition, type CSSProperties, type PointerEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CardData } from '@/lib/catalog';
import { money } from '@/lib/format';
import s from './Catalog.module.css';

// Studio render of the model, with a liquid-glass plate over its base (the brand references' tiles).
export default function ProductCard({ p, index }: { p: CardData; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);

  // a small tilt toward the cursor; mouse only, touch scrolls normally
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`);
    ref.current.style.setProperty('--ry', `${(x * 7).toFixed(2)}deg`);
  };
  const onLeave = () => {
    ref.current?.style.setProperty('--rx', '0deg');
    ref.current?.style.setProperty('--ry', '0deg');
  };

  return (
    <Link ref={ref} href={p.href} className={s.card} style={{ '--i': index } as CSSProperties} onPointerMove={onMove} onPointerLeave={onLeave}>
      {/* the same name as the product page's viewer: opening a card grows its render into the viewer */}
      <ViewTransition name={`product-${p.slug}`} share="morph" default="none">
        <span className={s.media}>
          <Image src={p.image} alt={`Render 3D de ${p.name}`} width={1200} height={1500} sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw" className={s.img} />
        </span>
      </ViewTransition>
      <span className={`${s.plate} glass`}>
        <h3 className={s.name}>{p.name}</h3>
        <span className={s.row}>
          <span className={`${s.price} num`}>desde {money(p.price)}</span>
          {/* a full Hellbot range is too many dots for the card: say how many instead */}
          {p.colors.length > 6 ? (
            <span className={s.meta}>{p.colors.length} colores</span>
          ) : (
            <span className={s.swatches} aria-label={`${p.colors.length} colores`}>
              {p.colors.map((c) => (
                <i key={c} style={{ background: c }} />
              ))}
            </span>
          )}
        </span>
        <span className={s.meta}>
          {p.sizes > 1 ? `${p.sizes} tamaños` : 'Tamaño único'} · {p.materials}
        </span>
      </span>
    </Link>
  );
}
