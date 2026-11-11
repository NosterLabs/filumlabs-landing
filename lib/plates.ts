import { BufferGeometry, Float32BufferAttribute } from 'three';

// Several plates of one file, laid out together: in a row to look at them all,
// or packed onto a single bed, shrunk only as much as it takes to fit.

export type Box = [number, number, number]; // x, y, z in mm, z up (print axes)
type Layout = { at: [number, number][]; size: Box; scale: number };

// row-major grid with `cols` boxes per row; at = each box's corner on the bed, before scaling
function grid(boxes: Box[], cols: number, gap: number): Layout {
  const at: [number, number][] = [];
  let y = 0, w = 0;
  for (let r = 0; r * cols < boxes.length; r++) {
    const row = boxes.slice(r * cols, r * cols + cols);
    let x = 0;
    for (const b of row) {
      at.push([x, y]);
      x += b[0] + gap;
    }
    w = Math.max(w, x - gap);
    y += Math.max(...row.map((b) => b[1])) + gap;
  }
  return { at, size: [w, y - gap, Math.max(...boxes.map((b) => b[2]))], scale: 1 };
}

export const inRow = (boxes: Box[], gap = 20) => grid(boxes, boxes.length, gap);

// every column count is tried; the winner is the one that needs the least shrinking. Never grows.
export function packOnBed(boxes: Box[], bed: Box, gap = 5): Layout {
  let best: Layout | null = null;
  for (let cols = 1; cols <= boxes.length; cols++) {
    const g = grid(boxes, cols, gap);
    // 2 % margin on the bed, like "Al máximo"
    const scale = Math.min(1, (bed[0] * 0.98) / g.size[0], (bed[1] * 0.98) / g.size[1], (bed[2] * 0.98) / g.size[2]);
    if (!best || scale > best.scale) best = { at: g.at, size: g.size.map((v) => v * scale) as Box, scale };
  }
  return best!;
}

// The plates' triangles in one geometry, each moved to its corner and scaled. Viewer axes: y up,
// so the bed is x/z. Uniform scaling keeps the normals valid.
export function placed(geos: BufferGeometry[], layout: Layout) {
  const count = geos.reduce((n, g) => n + g.getAttribute('position').array.length, 0);
  const pos = new Float32Array(count);
  const nor = new Float32Array(count);
  let o = 0;
  geos.forEach((g, i) => {
    const p = g.getAttribute('position').array;
    const min = [Infinity, Infinity, Infinity];
    for (let j = 0; j < p.length; j++) min[j % 3] = Math.min(min[j % 3], p[j]);
    const [ax, az] = layout.at[i];
    for (let j = 0; j < p.length; j += 3) {
      pos[o + j] = (p[j] - min[0] + ax) * layout.scale;
      pos[o + j + 1] = (p[j + 1] - min[1]) * layout.scale;
      pos[o + j + 2] = (p[j + 2] - min[2] + az) * layout.scale;
    }
    nor.set(g.getAttribute('normal').array, o);
    o += p.length;
  });
  const out = new BufferGeometry();
  out.setAttribute('position', new Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return out;
}
