import { Matrix4, Quaternion, Vector3 } from 'three';

export type Turns = [number, number, number]; // quarter turns about print X, Y, Z

// Print space is z-up, three.js is y-up: print X → X, print Y → -Z, print Z → Y.
// Applies X, then Y, then Z.
export function quarterTurns([rx, ry, rz]: Turns) {
  const qx = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), (rx * Math.PI) / 2);
  const qy = new Quaternion().setFromAxisAngle(new Vector3(0, 0, -1), (ry * Math.PI) / 2);
  const qz = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), (rz * Math.PI) / 2);
  return new Quaternion().multiply(qz).multiply(qy).multiply(qx);
}

// Bounding box size (z-up) after quarter turns. A quarter turn maps the box onto a box,
// so this is exact and O(1): no need to touch the triangles.
export function rotatedSize(size: [number, number, number], turns: Turns): [number, number, number] {
  const m = new Matrix4().makeRotationFromQuaternion(quarterTurns(turns)).elements; // column-major
  const b = [size[0], size[2], size[1]]; // to three.js axes
  const d = [0, 1, 2].map((i) => [0, 1, 2].reduce((s, j) => s + Math.abs(m[j * 4 + i]) * b[j], 0));
  return [d[0], d[2], d[1]]; // back to print axes
}
