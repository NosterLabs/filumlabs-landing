import { BufferGeometry, Float32BufferAttribute, Mesh, type Object3D } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { meshStats, type MeshStats } from './mesh.ts';

// Runs in the model worker (and on the main thread as a fallback): no DOM access here.

export type Prepared = {
  positions: Float32Array; // y-up, for the viewer
  normals: Float32Array;
  stats: MeshStats; // z-up, print axes
  triangles: number;
};

// above this many triangles, flat normals keep memory and time down
const CREASE_LIMIT = 400_000;

// STL and OBJ (z-up, mm) → triangle soup. 3MF needs DOMParser, so lib/load.ts reads it on the main thread.
export function parseSoup(ext: 'stl' | 'obj', data: ArrayBuffer) {
  if (ext === 'stl') return soup(new STLLoader().parse(data));
  return fromObject(new OBJLoader().parse(new TextDecoder().decode(data)));
}

export function soup(g: BufferGeometry) {
  const a = (g.index ? g.toNonIndexed() : g).getAttribute('position')?.array as Float32Array | undefined;
  if (!a || a.length < 9) throw new Error('El archivo no tiene triángulos.');
  return Float32Array.from(a);
}

export function fromObject(root: Object3D) {
  root.updateMatrixWorld(true);
  const parts: Float32Array[] = [];
  root.traverse((o) => {
    if (o instanceof Mesh) parts.push(soup((o.geometry as BufferGeometry).clone().applyMatrix4(o.matrixWorld)));
  });
  if (!parts.length) throw new Error('No encontramos ninguna pieza dentro del archivo.');
  const out = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

export function prepare(zup: Float32Array): Prepared {
  const stats = meshStats(zup);
  const yup = new Float32Array(zup.length);
  for (let i = 0; i < zup.length; i += 3) {
    yup[i] = zup[i];
    yup[i + 1] = zup[i + 2];
    yup[i + 2] = -zup[i + 1];
  }
  let g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(yup, 3));
  const triangles = yup.length / 9;
  if (triangles <= CREASE_LIMIT) g = toCreasedNormals(g, Math.PI / 6);
  else g.computeVertexNormals();
  return {
    positions: g.getAttribute('position').array as Float32Array,
    normals: g.getAttribute('normal').array as Float32Array,
    stats,
    triangles,
  };
}
