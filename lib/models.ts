import {
  BufferGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  LatheGeometry,
  Quaternion,
  Shape,
  SplineCurve,
  Vector2,
  Vector3,
  type BufferGeometry as Geo,
} from 'three';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// All generators return y-up geometry in millimetres, resting on y = 0.

const v = (x: number, y: number) => new Vector2(x, y);

function lathe(profile: [number, number][], segments: number) {
  return new LatheGeometry(profile.map(([x, y]) => v(x, y)), segments);
}

// a cup: outer wall up, lip, inner wall down to the floor, closed at the axis
function cup(r0: number, r1: number, h: number, wall: number, floor: number): [number, number][] {
  return [[0, 0], [r0, 0], [r1, h], [r1 - wall, h], [r0 - wall + ((r1 - r0) * floor) / h, floor], [0, floor]];
}

// extrude a 2D shape (x, y) by depth along z, then stand it so the shape's y becomes height
function extrude(shape: Shape, depth: number) {
  const g = new ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 24 });
  return g;
}

function poly(points: [number, number][]) {
  const s = new Shape();
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
}

function roundedRect(x: number, y: number, w: number, h: number, r: number) {
  const s = new Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

// several closed meshes into one triangle soup; parts must not overlap or volume double counts
export function merge(parts: Geo[]) {
  const arrays = parts.map((p) => (p.index ? p.toNonIndexed() : p).getAttribute('position').array as Float32Array);
  const out = new Float32Array(arrays.reduce((n, a) => n + a.length, 0));
  let o = 0;
  for (const a of arrays) {
    out.set(a, o);
    o += a.length;
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(out, 3));
  g.computeVertexNormals();
  return g;
}

function vase() {
  // a smooth profile through six control points, so the silhouette has no kinks
  const curve = new SplineCurve([v(30, 0), v(40, 40), v(42, 70), v(30, 120), v(22, 150), v(26, 170)]);
  const outer = curve.getPoints(56).map((p) => [p.x, p.y] as [number, number]);
  const inner = outer.map(([x, y]) => [x - 2, Math.max(y, 2)] as [number, number]).reverse();
  const g = lathe([[0, 0], ...outer, ...inner, [0, 2]], 96);
  // twist the ribs as the vase rises
  const p = g.getAttribute('position');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 0.01) continue;
    const a = Math.atan2(z, x);
    const k = 1 + 0.06 * Math.cos(8 * (a + y / 60));
    p.setXYZ(i, (x / r) * r * k, y, (z / r) * r * k);
  }
  g.computeVertexNormals();
  return g;
}

function organizer() {
  const outline = roundedRect(0, 0, 140, 90, 10);
  for (const [x, y, w, h] of [[4, 4, 62, 82], [70, 4, 66, 39], [70, 47, 66, 39]]) {
    outline.holes.push(roundedRect(x, y, w, h, 7));
  }
  const walls = extrude(outline, 67).translate(0, 0, 3);
  const base = extrude(roundedRect(0, 0, 140, 90, 10), 3);
  // shape plane is x/y, extruded along z: lay it down so z becomes height
  return merge([walls, base]).rotateX(-Math.PI / 2);
}

function phoneStand() {
  const base = extrude(poly([[0, 0], [90, 0], [90, 6], [0, 6]]), 70);
  const lip = extrude(poly([[0, 6], [7, 6], [7, 18], [0, 18]]), 70);
  const arm = extrude(poly([[28, 6], [38, 6], [80, 72], [70, 72]]), 70);
  return merge([base, lip, arm]);
}

function hook() {
  const s = new Shape();
  s.moveTo(0, 90);
  s.lineTo(0, 24);
  s.absarc(22, 24, 22, Math.PI, Math.PI * 2, false);
  s.lineTo(44, 40);
  s.lineTo(36, 40);
  s.lineTo(36, 24);
  s.absarc(22, 24, 14, 0, -Math.PI, true);
  s.lineTo(8, 90);
  s.closePath();
  return extrude(s, 16);
}

function cableClip() {
  const s = new Shape();
  const a0 = (40 * Math.PI) / 180, a1 = (320 * Math.PI) / 180;
  s.absarc(0, 12, 10, a0, a1, false);
  s.absarc(0, 12, 6, a1, a0, true);
  s.closePath();
  const ring = extrude(s, 10);
  const tab = extrude(poly([[-12, 0], [12, 0], [12, 2], [-12, 2]]), 10);
  // the ring's lowest point sits at y = 2, right on top of the tab
  return merge([ring, tab]);
}

// the FilumLabs mark: an F and a bracket, traced from the 100-unit logo grid (svg y down)
function arc(pts: [number, number][], cx: number, cy: number, r: number, a0: number, a1: number) {
  const n = 10;
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
}

function logoShapes(scale: number, ox: number, oy: number) {
  const P = Math.PI;
  const f: [number, number][] = [];
  arc(f, 28, 28, 4, P, P * 1.5); // round outer corner
  arc(f, 60, 28, 4, -P / 2, P / 2); // top bar cap
  f.push([32, 32], [32, 42]);
  arc(f, 44, 46, 4, -P / 2, P / 2); // middle bar cap
  f.push([32, 50]);
  arc(f, 28, 64, 4, 0, P); // stem cap
  const l: [number, number][] = [];
  arc(l, 72, 38, 4, P, P * 2); // top cap
  arc(l, 72, 72, 4, 0, P / 2); // round corner
  arc(l, 44, 72, 4, P / 2, P * 1.5); // left cap
  l.push([68, 68]);
  const to = (pts: [number, number][]) => poly(pts.map(([x, y]) => [ox + x * scale, oy + (100 - y) * scale]));
  return [to(f), to(l)];
}

function keychain() {
  const tag = roundedRect(0, 0, 44, 52, 8);
  const hole = new Shape();
  hole.absarc(22, 46, 3, 0, Math.PI * 2, true);
  tag.holes.push(hole);
  const base = extrude(tag, 3);
  // logo grid 24–76 → 0.34 mm per unit, centred on the tag below the ring hole
  const marks = logoShapes(0.34, 22 - 50 * 0.34, 20 - 50 * 0.34).map((s) => extrude(s, 1.2).translate(0, 0, 3));
  return merge([base, ...marks]).rotateX(-Math.PI / 2);
}

// Diagrid tower: two families of straight struts between a base ring and a top ring, each turned
// the opposite way, so together they draw a hyperboloid (Shukhov's towers). Hollow, seen through.
// shortcut: struts cross each other and sink into the rings, so volume counts the crossings twice
// (a few % more grams); fine for the home demo, model it as one solid if it ever goes on sale.
function tower() {
  const n = 14, h = 120, rb = 42, rt = 34, twist = (115 * Math.PI) / 180;
  // ring profiles are closed loops, counter-clockwise, so their faces point out like the struts'
  const base = lathe([[rb - 5, 0], [rb + 4, 0], [rb + 4, 6], [rb - 5, 6], [rb - 5, 0]], 96);
  const top = lathe([[rt - 4, h - 5], [rt + 3, h - 5], [rt + 3, h], [rt - 4, h], [rt - 4, h - 5]], 96);
  const struts: Geo[] = [];
  for (const dir of [1, -1]) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (dir < 0 ? Math.PI / n : 0);
      const p0 = new Vector3(Math.cos(a) * (rb - 0.5), 3, Math.sin(a) * (rb - 0.5));
      const p1 = new Vector3(Math.cos(a + dir * twist) * (rt - 0.5), h - 2.5, Math.sin(a + dir * twist) * (rt - 0.5));
      const len = p0.distanceTo(p1);
      const g = new CylinderGeometry(1.6, 1.6, len, 6);
      g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), p1.clone().sub(p0).normalize()));
      struts.push(g.translate((p0.x + p1.x) / 2, (p0.y + p1.y) / 2, (p0.z + p1.z) / 2));
    }
  }
  return merge([base, top, ...struts]);
}

const GENERATORS = {
  torre: tower,
  maceta: () => lathe(cup(38, 48, 80, 2.4, 3), 8),
  florero: vase,
  lapicero: () => lathe(cup(36, 36, 100, 2.4, 3), 6),
  organizador: organizer,
  soporte: phoneStand,
  gancho: hook,
  clip: cableClip,
  llavero: keychain,
} satisfies Record<string, () => Geo>;

export type ModelId = keyof typeof GENERATORS;

// y-up geometry resting on the plate and centred on x/z
export function buildModel(id: ModelId, scale = 1) {
  const g = merge([GENERATORS[id]()]).scale(scale, scale, scale);
  g.computeBoundingBox();
  const b = g.boundingBox!;
  g.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
  return g;
}

// for display: smooth shading on curves, sharp edges kept (creases above 36°)
export function buildViewModel(id: ModelId, scale = 1) {
  return toCreasedNormals(buildModel(id, scale), Math.PI / 5);
}

// y-up three.js positions → z-up triangle soup for meshStats (rotation about x by +90°)
export function toZUp(g: Geo) {
  const a = (g.index ? g.toNonIndexed() : g).getAttribute('position').array;
  const out = new Float32Array(a.length);
  for (let i = 0; i < a.length; i += 3) {
    out[i] = a[i];
    out[i + 1] = -a[i + 2];
    out[i + 2] = a[i + 1];
  }
  return out;
}
