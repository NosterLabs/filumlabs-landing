export type MeshStats = {
  volume: number; // mm³
  area: number; // mm²
  size: [number, number, number]; // bounding box x, y, z in mm, z up
};

// positions: flat xyz triangle soup (non-indexed), z up, in mm.
export function meshStats(positions: ArrayLike<number>): MeshStats {
  let volume = 0;
  let area = 0;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i + 8 < positions.length; i += 9) {
    const ax = positions[i], ay = positions[i + 1], az = positions[i + 2];
    const bx = positions[i + 3], by = positions[i + 4], bz = positions[i + 5];
    const cx = positions[i + 6], cy = positions[i + 7], cz = positions[i + 8];
    // signed tetrahedron volume against the origin
    volume += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
    const ux = bx - ax, uy = by - ay, uz = bz - az;
    const vx = cx - ax, vy = cy - ay, vz = cz - az;
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    area += Math.sqrt(nx * nx + ny * ny + nz * nz) / 2;
    for (let k = 0; k < 9; k += 3) {
      for (let d = 0; d < 3; d++) {
        const v = positions[i + k + d];
        if (v < min[d]) min[d] = v;
        if (v > max[d]) max[d] = v;
      }
    }
  }
  return {
    volume: Math.abs(volume),
    area,
    size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]],
  };
}

export function scaleStats(s: MeshStats, k: number): MeshStats {
  return { volume: s.volume * k ** 3, area: s.area * k ** 2, size: s.size.map((v) => v * k) as MeshStats['size'] };
}
