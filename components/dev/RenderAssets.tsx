'use client';

import { useEffect, useState } from 'react';
import { PRODUCTS } from '@/lib/catalog';
import { buildViewModel } from '@/lib/models';
import { colorOf } from '@/lib/config';
import { DEFAULT_PRINTER } from '@/lib/printers';
import { FILM_VIEWS, HERO, HERO_SCALE } from '@/lib/hero';
import { Stage } from '@/lib/stage';

type Render = { file: string; data: string };

export default function RenderAssets() {
  const [renders, setRenders] = useState<Render[]>([]);

  useEffect(() => {
    const out: Render[] = [];
    // the part sits in the upper part of the card, clear of the glass plate over its base
    const card = new Stage(null, { volume: DEFAULT_PRINTER.volume, framing: 'model', view: { azimuth: 36, elevation: 22, pad: 0.98, shift: { x: 0, y: 0.09 } } });
    for (const p of PRODUCTS) {
      card.setModel(buildViewModel(p.model));
      card.setColor(colorOf(p.color).hex);
      card.setCut(1);
      out.push({ file: `${p.slug}.webp`, data: card.snapshot(1200, 1500) });
    }
    card.dispose();

    // the home film: its poster, then what each chapter shows without the live scene
    const film = new Stage(null, { volume: DEFAULT_PRINTER.volume, framing: 'model', view: FILM_VIEWS[0] });
    film.setModel(buildViewModel(HERO.model));
    film.setColor(colorOf(HERO.color).hex);
    film.setCut(1);
    out.push({ file: `hero-${HERO.slug}.webp`, data: film.snapshot(1500, 1600) });
    const chapters = [
      { wire: 1, k: 1, cut: 1 },
      { wire: 0, k: HERO_SCALE, cut: 1 },
      { wire: 0, k: HERO_SCALE, cut: 0.55 },
      { wire: 0, k: HERO_SCALE, cut: 1 },
    ];
    chapters.forEach((c, i) => {
      film.setView(FILM_VIEWS[i + 1]);
      film.setScale(c.k);
      film.setWire(c.wire);
      film.setCut(c.cut);
      out.push({ file: `film-${i + 1}.webp`, data: film.snapshot(1200, 1000) });
    });
    film.dispose();

    setRenders(out);
    (window as unknown as { __renders: Render[] }).__renders = out;
  }, []);

  return (
    <main style={{ padding: 24, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {renders.map((r) => (
        <figure key={r.file} style={{ margin: 0, width: 200 }}>
          <img src={r.data} alt={r.file} width={200} style={{ background: '#1a2128', height: 'auto' }} />
          <figcaption>{r.file}</figcaption>
        </figure>
      ))}
    </main>
  );
}
