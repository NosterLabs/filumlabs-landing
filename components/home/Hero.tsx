import Link from 'next/link';
import { UploadButton } from '../Upload';
import Film, { type FilmFigures } from './Film';
import { quoteScaled } from '@/lib/catalog';
import { SHOP, colorOf } from '@/lib/config';
import { HERO, HERO_SCALE } from '@/lib/hero';
import { size } from '@/lib/format';
import { orderMessage } from '@/lib/whatsapp';
import s from './Hero.module.css';

export default function Hero() {
  // real figures for the tower at 100 % and at the scale the film grows it to, from the quoter's estimator
  const fig = (k: number): FilmFigures => {
    const q = quoteScaled(HERO, k);
    return { size: q.stats.size, grams: q.grams, seconds: q.seconds, layers: q.layers, price: q.unitPrice };
  };
  const before = fig(1);
  const after = fig(HERO_SCALE);
  const color = colorOf(HERO.color);
  const message = orderMessage([
    { key: 'film', kind: 'a-medida', name: `${HERO.slug}.stl`, detail: `${size(after.size)} · PLA ${color.label.toLowerCase()}`, unitPrice: after.price, qty: 1 },
  ]);

  return (
    <Film data={{ file: `${HERO.slug}.stl`, name: HERO.name, color: color.hex, before, after, message, demo: SHOP.demoCatalog }}>
      <div className={s.copy}>
        <h1 className={s.title}>
          <span>
            <span>Tu pieza en 3D,</span>
          </span>
          <span>
            <span>cotizada al instante.</span>
          </span>
        </h1>
        <p className={s.lede}>
          Subí tu archivo STL, 3MF u OBJ, elegí tamaño, material y color, y sabé cuánto sale antes de pedir. Imprimimos en PLA y PETG con una Bambu Lab A1 mini, en Ituzaingó, Zona Oeste.
        </p>
        <div className={s.actions}>
          <UploadButton />
          <Link href="/catalogo" className="btn btn--ghost">
            Ver el catálogo
          </Link>
        </div>
        <p className={s.hint}>También podés soltar el archivo en cualquier parte de esta pantalla.</p>
        <ul className={s.facts}>
          <li>Piezas de hasta 18 × 18 × 18 cm</li>
          <li>Desde una unidad</li>
          <li>Tu archivo no sale de tu navegador</li>
        </ul>
        <a href="#como-funciona" className={s.cue}>
          Mirá cómo se hace
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </Film>
  );
}
