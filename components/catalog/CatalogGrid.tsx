'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import ProductCard from './ProductCard';
import type { CardData } from '@/lib/catalog';
import s from './Catalog.module.css';

const ALL = 'Todo';

export default function CatalogGrid({ items, categories, demo }: { items: CardData[]; categories: readonly string[]; demo: boolean }) {
  const [cat, setCat] = useState(ALL);
  const [filtered, setFiltered] = useState(false); // after the first tab change the staggered entrance is replaced by a short fade
  const pick = (t: string) => {
    setCat(t);
    setFiltered(true);
  };
  const tabs = [ALL, ...categories];
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const list = cat === ALL ? items : items.filter((i) => i.category === cat);

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    pick(tabs[n]);
    refs.current[n]?.focus();
  };

  return (
    <div className={s.catalog}>
      <div role="tablist" aria-label="Categorías del catálogo" className={s.tabs}>
        {tabs.map((t, i) => (
          <button
            key={t}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`tab-${i}`}
            type="button"
            role="tab"
            aria-selected={cat === t}
            aria-controls="catalog-panel"
            tabIndex={cat === t ? 0 : -1}
            onClick={() => pick(t)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {t}
            <span className={`${s.count} num`}>{t === ALL ? items.length : items.filter((x) => x.category === t).length}</span>
          </button>
        ))}
      </div>
      <div className={s.gridWrap} data-reveal="stagger" data-filtered={filtered || undefined}>
        <div key={cat} id="catalog-panel" role="tabpanel" aria-labelledby={`tab-${tabs.indexOf(cat)}`} className={s.grid}>
          {list.map((p, i) => (
            <ProductCard key={p.slug} p={p} index={i} />
          ))}
        </div>
      </div>
      {demo && <p className={s.demo}>Catálogo, colores y precios de ejemplo, mientras cargamos los modelos reales.</p>}
    </div>
  );
}
