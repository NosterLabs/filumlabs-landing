import { test } from 'node:test';
import assert from 'node:assert/strict';
import { meshStats, scaleStats } from './mesh.ts';
import { combine, estimate, lineTotal, printCost, tierFor, DEFAULT_SETTINGS } from './pricing.ts';
import { DEFAULT_PRINTER } from './printers.ts';
import { rotatedSize } from './orient.ts';

// 12 triangles of an axis-aligned box from 0 to (x, y, z)
function box(x: number, y: number, z: number) {
  const v = [[0, 0, 0], [x, 0, 0], [x, y, 0], [0, y, 0], [0, 0, z], [x, 0, z], [x, y, z], [0, y, z]];
  const f = [[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5], [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7]];
  return f.flatMap((t) => t.flatMap((i) => v[i]));
}

test('box volume, area and size', () => {
  const s = meshStats(box(10, 20, 30));
  assert.ok(Math.abs(s.volume - 6000) < 1e-6);
  assert.ok(Math.abs(s.area - 2200) < 1e-6);
  assert.deepEqual(s.size, [10, 20, 30]);
});

test('scaling is cubic for volume, square for area', () => {
  const s = scaleStats(meshStats(box(10, 10, 10)), 2);
  assert.ok(Math.abs(s.volume - 8000) < 1e-6);
  assert.ok(Math.abs(s.area - 2400) < 1e-6);
});

test('estimate grows with infill and checks the build volume', () => {
  const s = meshStats(box(40, 40, 40));
  const lo = estimate(s, { ...DEFAULT_SETTINGS, infill: 0.1 }, DEFAULT_PRINTER);
  const hi = estimate(s, { ...DEFAULT_SETTINGS, infill: 0.6 }, DEFAULT_PRINTER);
  assert.ok(hi.grams > lo.grams && hi.unitPrice >= lo.unitPrice);
  assert.ok(lo.grams > 0 && lo.grams < 40 * 40 * 40 * 1.24e-3);
  assert.equal(lo.layers, 200);
  assert.equal(estimate(meshStats(box(181, 10, 10)), DEFAULT_SETTINGS, DEFAULT_PRINTER).fits, false);
});

test('quantity tiers apply only when configured', () => {
  assert.equal(tierFor(500), null); // no tiers in the shop config
  const tiers = [{ min: 10, off: 0.1 }, { min: 25, off: 0.15 }];
  assert.equal(tierFor(9, tiers), null);
  assert.equal(tierFor(30, tiers)?.off, 0.15);
  assert.equal(lineTotal(1000, 10, false, tiers), 9000);
  assert.equal(lineTotal(1000, 10, false), 10000);
});

test('quarter turns permute the bounding box', () => {
  const near = (a: number[], b: number[]) => a.every((v, i) => Math.abs(v - b[i]) < 1e-9);
  assert.ok(near(rotatedSize([10, 20, 30], [0, 0, 0]), [10, 20, 30]));
  assert.ok(near(rotatedSize([10, 20, 30], [1, 0, 0]), [10, 30, 20])); // about X: y and z swap
  assert.ok(near(rotatedSize([10, 20, 30], [0, 1, 0]), [30, 20, 10])); // about Y: x and z swap
  assert.ok(near(rotatedSize([10, 20, 30], [0, 0, 1]), [20, 10, 30])); // about Z: x and y swap
  assert.ok(near(rotatedSize([10, 20, 30], [2, 2, 2]), [10, 20, 30]));
});

test('print cost follows calculadora3d: filament + electricity + wear', () => {
  // 50 g, 2 h 30 min, PLA at $ 25.000/kg, 100 W at $ 200/kWh, wear $ 232/h
  assert.ok(Math.abs(printCost(50, 2.5 * 3600, 'PLA') - (1250 + 50 + 580)) < 1e-9);
  // PETG adds 15 % to electricity and 30 % to wear
  assert.ok(Math.abs(printCost(50, 2.5 * 3600, 'PETG') - (1600 + 57.5 + 754)) < 1e-9);
});

test('plates add up into one piece, minimum price once', () => {
  const s = meshStats(box(40, 40, 40));
  const one = estimate(s, DEFAULT_SETTINGS, DEFAULT_PRINTER);
  const two = combine([one, one], 'PLA');
  assert.equal(two.grams, one.grams * 2);
  assert.equal(two.seconds, one.seconds * 2);
  assert.equal(two.unitPrice, estimate(s, DEFAULT_SETTINGS, DEFAULT_PRINTER, 2).unitPrice);
  assert.equal(combine([one, { ...one, fits: false }], 'PLA').fits, false);
  assert.equal(combine([one], 'PLA'), one);
});
