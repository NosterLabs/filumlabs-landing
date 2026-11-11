import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inRow, packOnBed, type Box } from './plates.ts';

const BED: Box = [180, 180, 180];

test('plates that fit together keep their size', () => {
  const l = packOnBed([[60, 60, 20], [60, 60, 30]], BED);
  assert.equal(l.scale, 1);
  assert.ok(l.size[0] <= 180 * 0.98 && l.size[1] <= 180 * 0.98);
});

test('four full plates are shrunk into a 2 × 2 grid, not a long row', () => {
  const full: Box = [170, 170, 40];
  const l = packOnBed([full, full, full, full], BED);
  // a row would need 1/4 scale; the grid needs about 1/2
  assert.ok(l.scale > 0.45 && l.scale < 0.55, `scale ${l.scale}`);
  assert.ok(l.size[0] <= 180 * 0.98 + 1e-9 && l.size[1] <= 180 * 0.98 + 1e-9);
  assert.deepEqual(l.at[3], [175, 175]);
});

test('a part too tall for the bed is shrunk by its height', () => {
  const l = packOnBed([[50, 50, 360]], BED);
  assert.ok(Math.abs(l.size[2] - 176.4) < 1e-9);
});

test('the row view puts plates side by side', () => {
  const l = inRow([[100, 80, 10], [50, 120, 10]]);
  assert.deepEqual(l.at, [[0, 0], [120, 0]]);
  assert.deepEqual(l.size, [170, 120, 10]);
});
