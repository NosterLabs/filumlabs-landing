import { parseSoup, prepare } from './process.ts';

// Parses and measures uploaded models off the main thread, so a 50 MB STL does not freeze the page.
self.onmessage = (e: MessageEvent) => {
  const { id, ext, data, positions } = e.data;
  try {
    const p = prepare(positions ?? parseSoup(ext, data));
    (self as unknown as Worker).postMessage({ id, ok: true, ...p }, [p.positions.buffer, p.normals.buffer]);
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
