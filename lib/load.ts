import { Box3, Group, Vector3, type Object3D } from 'three';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js';
import { strFromU8, unzipSync } from 'three/examples/jsm/libs/fflate.module.js';
import { fromObject, parseSoup, prepare, type Prepared } from './process.ts';
import { MAX_MB } from './files.ts';

let worker: Worker | null | undefined;
let seq = 0;

function getWorker() {
  if (worker === undefined) {
    try {
      worker = new Worker(new URL('./model.worker.ts', import.meta.url), { type: 'module' });
    } catch {
      worker = null;
    }
  }
  return worker;
}

class WorkerUnavailable extends Error {}

function inWorker(msg: Record<string, unknown>): Promise<Prepared> {
  const w = getWorker();
  if (!w) return Promise.reject(new WorkerUnavailable());
  return new Promise((resolve, reject) => {
    const id = ++seq;
    const done = () => {
      w.removeEventListener('message', onMessage);
      w.removeEventListener('error', onError);
    };
    const onMessage = (e: MessageEvent) => {
      if (e.data.id !== id) return;
      done();
      if (e.data.ok) resolve(e.data);
      else reject(new Error(e.data.error));
    };
    const onError = () => {
      done();
      worker = null; // the script did not load: use the main thread from now on
      reject(new WorkerUnavailable());
    };
    w.addEventListener('message', onMessage);
    w.addEventListener('error', onError);
    w.postMessage({ id, ...msg }); // input is copied, not transferred, so the fallback can still use it
  });
}

const CONFIG = 'Metadata/model_settings.config';

// Bambu Studio and OrcaSlicer keep every plate of a project side by side in one 3MF, so the
// merged parts spill off the bed. Their model_settings.config says which build item is on which plate.
function bambuPlates(data: ArrayBuffer, items: Object3D[]): { number: number; items: Object3D[] }[] | null {
  const zip = new Uint8Array(data);
  const xml = (u8: Uint8Array) => new DOMParser().parseFromString(strFromU8(u8), 'application/xml');
  const config = unzipSync(zip, { filter: (f) => f.name === CONFIG })[CONFIG];
  if (!config) return null;
  const meta = (el: Element, key: string) => el.querySelector(`metadata[key="${key}"]`)?.getAttribute('value') ?? '0';
  // numbered as in the slicer, so "plancha 2" in the order is the same plate 2 the customer sees there
  const found = [...xml(config).querySelectorAll('plate')].map((p, i) => ({
    number: Number(p.querySelector('metadata[key="plater_id"]')?.getAttribute('value')) || i + 1,
    keys: [...p.querySelectorAll('model_instance')].map((m) => `${meta(m, 'object_id')}:${meta(m, 'instance_id')}`),
  })).filter((p) => p.keys.length);
  const plates = found.map((p) => p.keys);
  if (plates.length < 2) return null;
  // the loader adds one child per build item, in document order; repeated object ids are its instances
  const root = Object.values(unzipSync(zip, { filter: (f) => /^3D\/[^/]*\.model$/.test(f.name) }))[0];
  const ids = root ? [...xml(root).querySelectorAll('build > item')].map((i) => i.getAttribute('objectid')) : [];
  if (ids.length !== items.length) return null;
  const seen = new Map<string | null, number>();
  const where = ids.map((id) => {
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    const p = plates.findIndex((keys) => keys.includes(`${id}:${n}`));
    return p >= 0 ? p : plates.findIndex((keys) => keys.some((k) => k.startsWith(`${id}:`)));
  });
  // an item the config does not list goes to the plate whose parts sit closest to it
  const center = (o: Object3D) => new Box3().setFromObject(o).getCenter(new Vector3());
  const anchors = plates.map((_, p) => where.indexOf(p)).map((i) => (i >= 0 ? center(items[i]) : null));
  const out: Object3D[][] = plates.map(() => []);
  where.forEach((p, i) => {
    if (p < 0) {
      const c = center(items[i]);
      let best = Infinity;
      anchors.forEach((a, j) => {
        const d = a ? a.distanceTo(c) : Infinity;
        if (d < best) [best, p] = [d, j];
      });
    }
    if (p >= 0) out[p].push(items[i]);
  });
  const used = out.map((items, p) => ({ number: found[p].number, items })).filter((p) => p.items.length);
  return used.length > 1 ? used : null;
}

// File → one entry per plate (y-up geometry arrays plus print-space stats), parsed off the main thread when possible
export async function loadModelFile(file: File): Promise<(Prepared & { plate: number })[]> {
  if (file.size > MAX_MB * 1024 * 1024) throw new Error(`El archivo pesa más de ${MAX_MB} MB.`);
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext !== 'stl' && ext !== 'obj' && ext !== '3mf') throw new Error('Aceptamos archivos STL, 3MF u OBJ.');
  const data = await file.arrayBuffer();
  try {
    if (ext === '3mf') {
      const root = new ThreeMFLoader().parse(data); // needs DOMParser: main thread
      const plates = bambuPlates(data, [...root.children]) ?? [{ number: 1, items: [root] }];
      return await Promise.all(
        plates.map(async ({ number, items }) => {
          const positions = fromObject(new Group().add(...items));
          const p = await inWorker({ positions }).catch((e) => (e instanceof WorkerUnavailable ? prepare(positions) : Promise.reject(e)));
          return { ...p, plate: number };
        }),
      );
    }
    const p = await inWorker({ ext, data }).catch((e) => (e instanceof WorkerUnavailable ? prepare(parseSoup(ext, data)) : Promise.reject(e)));
    return [{ ...p, plate: 1 }];
  } catch (e) {
    const reason = e instanceof Error && e.message ? e.message : '';
    throw new Error(reason.startsWith('El archivo') || reason.startsWith('No encontramos') ? reason : `No pudimos leer el archivo. Revisá que sea un ${ext.toUpperCase()} válido.`);
  }
}
