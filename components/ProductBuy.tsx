'use client';

import { useEffect, useMemo, useState, ViewTransition } from 'react';
import Viewer from './Viewer';
import GlassTile from './GlassTile';
import { useCart } from './Cart';
import type { Product } from '@/lib/catalog';
import { buildViewModel } from '@/lib/models';
import Swatches from './Swatches';
import Price from './Price';
import { MATERIALS, colorOf, colorsFor, type ColorId, type MaterialId } from '@/lib/config';
import { DEFAULT_PRINTER } from '@/lib/printers';
import { lineTotal } from '@/lib/pricing';
import { LIMITS, clampQty } from '@/lib/whatsapp';
import { duration, grams, size } from '@/lib/format';
import s from '@/app/cotizar/cotizar.module.css';
import p from './ProductBuy.module.css';

type Quote = { unitPrice: number; grams: number; seconds: number; layers: number; size: [number, number, number] };

export default function ProductBuy({ product, quotes, poster, demo }: { product: Product; quotes: Record<string, Quote>; poster: string; demo: boolean }) {
  const cart = useCart();
  const [variant, setVariant] = useState(product.variants[Math.min(1, product.variants.length - 1)]);
  // ?v= comes from the cart's links back to a product. Read after mount, not with useSearchParams: that
  // needs a Suspense boundary, and a boundary makes the card's render miss its morph into the viewer.
  useEffect(() => {
    const v = product.variants.find((x) => x.id === new URLSearchParams(location.search).get('v'));
    if (v) setVariant(v);
  }, [product.variants]);
  const [material, setMaterial] = useState<MaterialId>(product.materials[0]);
  const [color, setColor] = useState<ColorId>(product.color);
  const [qty, setQty] = useState(1);
  const [printP, setPrintP] = useState(1);

  // shared by every variant: the scale is applied by the viewer, not baked into the geometry
  const geometry = useMemo(() => buildViewModel(product.model), [product.model]);
  const q = quotes[`${variant.id}:${material}`];
  const colors = colorsFor(material).filter((c) => product.colors.includes(c));
  const colorDef = colorOf(colors.includes(color) ? color : colors[0]);
  const variantLabel = product.variants.length > 1 ? ` ${variant.label}` : '';
  const live = printP < 1;

  return (
    <div className={`${s.layout} ${p.layout}`}>
      {/* its own grid item: above the viewer on phones, at the top of the options column on desktop */}
      <header className={p.head}>
        <p className={p.crumb}>{product.category}</p>
        <h1 className={p.title}>
          {product.name}
          {variantLabel}
        </h1>
        <p className={p.desc}>{product.description}</p>
      </header>

      <ViewTransition name={`product-${product.slug}`} share="morph" default="none">
        <div className={`${s.stage} ${p.stage}`}>
          <Viewer
            geometry={geometry}
            owned={false}
            color={colorDef.hex}
            scale={variant.scale}
            volume={DEFAULT_PRINTER.volume}
            poster={poster}
            print={2200}
            onProgress={setPrintP}
            label={`Vista 3D de ${product.name}${variantLabel} dentro del volumen de impresión de 18 cm`}
          />
          <div className={s.readout}>
            <GlassTile icon="size" label="Medidas" value={size(q.size)} />
            <GlassTile icon="spool" label="Filamento" value={grams(q.grams * printP)} viz={{ kind: 'meter', value: printP }} live={live} />
            <GlassTile icon="clock" label="Impresión" value={duration(q.seconds)} />
            <GlassTile icon="layers" label="Capas" value={String(Math.ceil(q.layers * printP))} viz={{ kind: 'bars', value: printP }} live={live} />
          </div>
        </div>
      </ViewTransition>

      <aside className={`${s.panel} ${p.panel}`} aria-label="Opciones de compra">
        {product.variants.length > 1 && (
          <fieldset className={s.group}>
            <legend>Tamaño</legend>
            <div className={s.chips} role="radiogroup" aria-label="Tamaño">
              {product.variants.map((v) => (
                <button key={v.id} type="button" role="radio" aria-checked={variant.id === v.id} onClick={() => setVariant(v)}>
                  {v.label} · {Math.round(quotes[`${v.id}:${material}`].size[2] / 10)} cm de alto
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset className={s.group}>
          <legend>Material y color</legend>
          <div className={s.segmented} role="radiogroup" aria-label="Material">
            {product.materials.map((m) => (
              <button key={m} type="button" role="radio" aria-checked={material === m} onClick={() => setMaterial(m)}>
                {MATERIALS[m].label}
              </button>
            ))}
          </div>
          <p className={s.note}>{MATERIALS[material].note}</p>
          <Swatches colors={colors} value={colorDef.id} onChange={setColor} />
        </fieldset>

        <div className={s.price}>
          <div className={s.priceRow}>
            <span>Por unidad</span>
            <Price value={q.unitPrice} />
          </div>
          <div className={s.priceRow}>
            <label htmlFor="qty">Cantidad</label>
            <div className="qty">
              <button type="button" onClick={() => setQty((n) => clampQty(n - 1))} aria-label="Una menos">−</button>
              <input id="qty" type="number" min={1} max={LIMITS.qty} value={qty} onChange={(e) => setQty(clampQty(Number(e.target.value)))} />
              <button type="button" onClick={() => setQty((n) => clampQty(n + 1))} aria-label="Una más">+</button>
            </div>
          </div>
          <div className={`${s.priceRow} ${s.total}`}>
            <span>Total</span>
            <Price value={lineTotal(q.unitPrice, qty, false)} />
          </div>
          <button
            type="button"
            className="btn btn--full"
            onClick={() =>
              cart.add({
                kind: 'catalogo',
                name: `${product.name}${variantLabel}`,
                detail: `${MATERIALS[material].label} ${colorDef.label.toLowerCase()}${product.pack > 1 ? ` · pack de ${product.pack}` : ''}`,
                unitPrice: q.unitPrice,
                qty,
                href: `/catalogo/${product.slug}?v=${variant.id}`,
              })
            }
          >
            Agregar al pedido
          </button>
          {demo && <p className={s.note}>Producto y precio de ejemplo.</p>}
        </div>
      </aside>
    </div>
  );
}
