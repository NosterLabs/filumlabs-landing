import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS, quoteScaled, quoteVariant } from './catalog.ts';
import { HERO, HERO_SCALE } from './hero.ts';

test('every catalogue variant is a closed solid that fits the A1 mini', () => {
  for (const p of PRODUCTS) {
    for (const v of p.variants) {
      const q = quoteVariant(p, v);
      console.log(p.slug, v.id, q.stats.size.map(Math.round).join('x'), Math.round(q.stats.volume / 1000) + 'cm3', q.grams.toFixed(1) + 'g', Math.round(q.seconds / 60) + 'min', '$' + q.unitPrice);
      assert.ok(q.stats.volume > 0, p.slug);
      assert.ok(q.fits, `${p.slug} ${v.id} fits`);
    }
  }
});

test('the home tower is a solid that still fits the A1 mini at the scale the film grows it to', () => {
  const at1 = quoteScaled(HERO, 1);
  const big = quoteScaled(HERO, HERO_SCALE);
  console.log('torre', at1.stats.size.map(Math.round).join('x'), Math.round(at1.stats.volume / 1000) + 'cm3', at1.grams.toFixed(1) + 'g', '$' + at1.unitPrice, '→ $' + big.unitPrice);
  // rings ≈ 22 cm³ and 28 struts ≈ 28 cm³: an open ring or a strut facing in would throw this off
  assert.ok(at1.stats.volume > 40_000 && at1.stats.volume < 65_000, `volume ${Math.round(at1.stats.volume)}`);
  assert.ok(big.fits, 'fits at the grown scale');
  assert.ok(big.unitPrice > at1.unitPrice);
});
