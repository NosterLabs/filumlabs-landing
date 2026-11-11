'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import Viewer from './Viewer';
import GlassTile from './GlassTile';
import { useCart } from './Cart';
import { ACCEPT, MAX_MB } from '@/lib/files';
import { loadModelFile } from '@/lib/load';
import { takePendingFile } from '@/lib/pending';
import { buildModel, buildViewModel, toZUp, type ModelId } from '@/lib/models';
import { meshStats, type MeshStats } from '@/lib/mesh';
import { quarterTurns, rotatedSize, type Turns } from '@/lib/orient';
import { DEFAULT_SETTINGS, combine, estimate, lineTotal, type PrintSettings } from '@/lib/pricing';
import Swatches from './Swatches';
import Price from './Price';
import { MATERIALS, PRICING, colorOf, colorsFor, type ColorId, type MaterialId } from '@/lib/config';
import { DEFAULT_PRINTER, PRINTERS } from '@/lib/printers';
import { duration, grams, list, money, size } from '@/lib/format';
import { WA_PENDING, orderMessage, waLink } from '@/lib/whatsapp';
import s from '@/app/cotizar/cotizar.module.css';

const SAMPLES: { id: ModelId; label: string }[] = [
  { id: 'maceta', label: 'Maceta' },
  { id: 'soporte', label: 'Soporte' },
  { id: 'llavero', label: 'Llavero' },
];

// a Bambu Studio project can hold several plates: each one is a separate print run.
// number: the plate's number in the slicer, which the order message quotes
type Model = { name: string; plates: { number: number; geometry: BufferGeometry; stats: MeshStats }[] };
type Status = { kind: 'idle' } | { kind: 'loading'; name: string; mb: number } | { kind: 'error'; message: string };

export default function Quoter() {
  const printer = DEFAULT_PRINTER;
  const cart = useCart();
  const [model, setModel] = useState<Model | null>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [drag, setDrag] = useState(false);
  const [turns, setTurns] = useState<Turns>([0, 0, 0]);
  const [scalePct, setScalePct] = useState(100);
  const [settings, setSettings] = useState<PrintSettings>(DEFAULT_SETTINGS);
  const [color, setColor] = useState<ColorId>('gris');
  const [qty, setQty] = useState(1);
  const [printP, setPrintP] = useState(1);
  const [plate, setPlate] = useState(0);
  const [skip, setSkip] = useState<number[]>([]); // plates left out of the order, by index

  const reset = () => {
    setTurns([0, 0, 0]);
    setScalePct(100);
    setPlate(0);
    setSkip([]);
  };

  // the quoter owns the plate geometries: the viewer shows one at a time and must not dispose the rest
  useEffect(() => () => model?.plates.forEach((p) => p.geometry.dispose()), [model]);

  const open = useCallback(async (file: File) => {
    setStatus({ kind: 'loading', name: file.name, mb: file.size / 1024 / 1024 });
    try {
      const plates = (await loadModelFile(file)).map((p) => {
        const g = new BufferGeometry();
        g.setAttribute('position', new Float32BufferAttribute(p.positions, 3));
        g.setAttribute('normal', new Float32BufferAttribute(p.normals, 3));
        return { number: p.plate, geometry: g, stats: p.stats };
      });
      setModel({ name: file.name.replace(/\.[^.]+$/, ''), plates });
      reset();
      setStatus({ kind: 'idle' });
    } catch (e) {
      setStatus({ kind: 'error', message: e instanceof Error ? e.message : 'No pudimos leer el archivo.' });
    }
  }, []);

  const openSample = useCallback((id: ModelId, label: string) => {
    const g = buildViewModel(id);
    setModel({ name: label, plates: [{ number: 1, geometry: g, stats: meshStats(toZUp(buildModel(id))) }] });
    reset();
    setStatus({ kind: 'idle' });
  }, []);

  useEffect(() => {
    const f = takePendingFile();
    if (f) {
      open(f);
      return;
    }
    // /cotizar?muestra=maceta opens a sample: handy for sharing a demo link
    const sample = SAMPLES.find((m) => m.id === new URLSearchParams(location.search).get('muestra'));
    if (sample) openSample(sample.id, sample.label);
  }, [open, openSample]);

  const k = scalePct / 100;
  const rotation = useMemo(() => quarterTurns(turns), [turns]);
  // rotation and scale are O(1): the box permutes, volume and area scale; the triangles are never touched
  const adjusted = (m: MeshStats): MeshStats => ({
    volume: m.volume * k ** 3,
    area: m.area * k ** 2,
    size: rotatedSize(m.size, turns).map((v) => v * k) as MeshStats['size'],
  });
  const plates = model?.plates ?? [];
  const many = plates.length > 1;
  const runs = plates.map((p) => estimate(adjusted(p.stats), settings, printer));
  const kept = plates.flatMap((_, i) => (skip.includes(i) ? [] : [i]));
  const numbers = (idx: number[]) => list([...idx].sort((a, b) => a - b).map((i) => plates[i].number));
  // the stage and its readouts show one plate; the price covers every plate still in the order
  const stats = plates[plate] ? adjusted(plates[plate].stats) : null;
  const shownEst = runs[plate] ?? null;
  const est = kept.length ? combine(kept.map((i) => runs[i]), settings.material) : null;
  const tooBig = kept.filter((i) => !runs[i].fits);
  const total = est ? lineTotal(est.unitPrice, qty, true) : 0;
  const colors = colorsFor(settings.material);
  const colorDef = colorOf(colors.includes(color) ? color : colors[0]);
  const skipped = skip.includes(plate);

  const fitMax = () => {
    if (!model) return;
    const room = kept.flatMap((j) => rotatedSize(plates[j].stats.size, turns).map((v, i) => (printer.volume[i] * 0.98) / v));
    setScalePct(Math.floor(Math.min(...room) * 100));
  };

  const set = <K extends keyof PrintSettings>(key: K, value: PrintSettings[K]) => setSettings((p) => ({ ...p, [key]: value }));

  // the order travels with the whole file, so it says which plates to print
  const which = !many
    ? size(stats?.size ?? [0, 0, 0])
    : skip.length
      ? `${kept.length > 1 ? 'Planchas' : 'Plancha'} ${numbers(kept)} del archivo (no imprimir ${skip.length > 1 ? 'las' : 'la'} ${numbers(skip)})`
      : `${plates.length} planchas`;
  const detail =
    est && stats
      ? `${which} · ${MATERIALS[settings.material].label} ${colorDef.label.toLowerCase()} · relleno ${Math.round(settings.infill * 100)}% · capa ${settings.layerHeight.toFixed(2).replace('.', ',')} mm · ${grams(est.grams)} · ${duration(est.seconds)} por pieza`
      : '';
  const item = model && est?.fits ? { kind: 'a-medida' as const, name: model.name, detail, unitPrice: est.unitPrice, qty } : null;
  const live = printP < 1;

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) open(f);
    e.target.value = '';
  };

  return (
    <div className={s.layout}>
      <div
        className={s.stage}
        data-drag={drag || undefined}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrag(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files[0];
          if (f) open(f);
        }}
      >
        <Viewer
          geometry={plates[plate]?.geometry ?? null}
          owned={false}
          pan
          color={colorDef.hex}
          scale={k}
          rotation={rotation}
          fits={shownEst?.fits ?? true}
          volume={printer.volume}
          print={1800}
          onProgress={setPrintP}
          label={model ? `Vista 3D de ${model.name}${many ? `, plancha ${plates[plate].number}${skipped ? ' (quitada del pedido)' : ''},` : ''} dentro del volumen de impresión` : 'Volumen de impresión vacío, de 18 × 18 × 18 cm'}
        />

        {many && (
          <div className={s.plates} role="group" aria-label="Planchas del archivo">
            <span>Plancha</span>
            {plates.map((p, i) => (
              <button
                key={i}
                type="button"
                aria-pressed={plate === i}
                aria-label={`Plancha ${p.number}${skip.includes(i) ? ', quitada' : ''}`}
                onClick={() => setPlate(i)}
                data-off={skip.includes(i) || undefined}
                data-warn={(!skip.includes(i) && !runs[i].fits) || undefined}
              >
                {p.number}
              </button>
            ))}
            {/* the last plate left cannot go: an order needs something to print */}
            <button
              type="button"
              className={s.plateToggle}
              onClick={() => setSkip((v) => (skipped ? v.filter((i) => i !== plate) : [...v, plate]))}
              disabled={!skipped && kept.length === 1}
              aria-label={`${skipped ? 'Volver a incluir' : 'Quitar'} la plancha ${plates[plate].number}`}
            >
              {skipped ? 'Volver a incluir' : 'Quitar'}
            </button>
          </div>
        )}

        {!model && status.kind !== 'loading' && (
          <div className={s.empty}>
            <h2 className={s.emptyTitle}>Soltá tu archivo acá</h2>
            <p>STL, 3MF u OBJ en milímetros, hasta {MAX_MB} MB.</p>
            <label className="btn">
              Elegir archivo
              <input type="file" accept={ACCEPT} hidden onChange={pickFile} />
            </label>
            <p className={s.samples}>
              ¿No tenés uno a mano? Probá con{' '}
              {SAMPLES.map((m, i) => (
                <span key={m.id}>
                  {i > 0 && (i === SAMPLES.length - 1 ? ' o ' : ', ')}
                  <button type="button" className="link" onClick={() => openSample(m.id, m.label)}>
                    {m.label.toLowerCase()}
                  </button>
                </span>
              ))}
              .
            </p>
          </div>
        )}

        {status.kind === 'loading' && (
          <div className={s.empty} role="status">
            <span className={s.loader} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <p className={s.emptyTitle}>Leyendo {status.name}</p>
            <p>{status.mb.toFixed(1).replace('.', ',')} MB, se procesa en tu navegador.</p>
          </div>
        )}

        {status.kind === 'error' && (
          <div className={s.error} role="alert">
            <p>{status.message}</p>
            <label className="link">
              Probar con otro archivo
              <input type="file" accept={ACCEPT} hidden onChange={pickFile} />
            </label>
          </div>
        )}

        {stats && shownEst && (
          <div className={s.readout}>
            <GlassTile icon="size" label="Medidas" value={size(stats.size)} />
            <GlassTile icon="spool" label="Filamento" value={grams(shownEst.grams * printP)} viz={{ kind: 'meter', value: printP }} live={live} />
            <GlassTile icon="clock" label="Impresión" value={duration(shownEst.seconds)} />
            <GlassTile icon="layers" label="Capas" value={String(Math.ceil(shownEst.layers * printP))} viz={{ kind: 'bars', value: printP }} live={live} />
          </div>
        )}
      </div>

      <aside className={s.panel} aria-label="Ajustes y precio">
        <div className={s.panelHead}>
          <h1 className={s.title}>{model ? model.name : 'Cotizá tu pieza'}</h1>
          {model && (
            <label className="link">
              Cambiar archivo
              <input type="file" accept={ACCEPT} hidden onChange={pickFile} />
            </label>
          )}
        </div>
        {!model && <p className={s.lede}>Tu archivo no se sube a ningún servidor: lo medimos acá, en tu navegador.</p>}

        <fieldset className={s.group} disabled={!model}>
          <legend>Impresora</legend>
          <select value={printer.id} onChange={() => {}} className={s.select} aria-describedby="printer-note">
            {PRINTERS.map((p) => (
              <option key={p.id} value={p.id} disabled={!p.available}>
                {p.name}
                {p.available ? '' : ' (próximamente)'}
              </option>
            ))}
          </select>
          <p id="printer-note" className={s.note}>
            Volumen máximo {printer.volume.join(' × ')} mm.
          </p>
        </fieldset>

        <fieldset className={s.group} disabled={!model}>
          <legend>Tamaño</legend>
          <div className={s.inline}>
            <input type="range" min={10} max={400} value={Math.min(scalePct, 400)} onChange={(e) => setScalePct(Number(e.target.value))} aria-label="Escala" />
            <label className={s.numberField}>
              <input type="number" min={1} max={5000} value={scalePct} onChange={(e) => setScalePct(Math.max(1, Number(e.target.value) || 100))} aria-label="Escala en porcentaje" />%
            </label>
          </div>
          <div className={s.chips}>
            <button type="button" onClick={() => setScalePct(100)}>Original</button>
            <button type="button" onClick={fitMax}>Al máximo</button>
            <button type="button" onClick={() => setScalePct(1000)}>Está en cm</button>
            <button type="button" onClick={() => setScalePct(2540)}>Está en pulgadas</button>
          </div>
          {tooBig.length > 0 && <p className={s.warn}>{many ? `No entra en la A1 mini: ${tooBig.length > 1 ? 'planchas' : 'plancha'} ${numbers(tooBig)}.` : 'No entra en la A1 mini.'} Bajá la escala o rotala.</p>}
          {stats && Math.max(...stats.size) < 8 && <p className={s.warn}>Parece muy chica. ¿El archivo está en centímetros o pulgadas?</p>}
        </fieldset>

        <fieldset className={s.group} disabled={!model}>
          <legend>Orientación</legend>
          <div className={s.chips}>
            {(['X', 'Y', 'Z'] as const).map((axis, i) => (
              <button key={axis} type="button" onClick={() => setTurns((t) => t.map((v, j) => (j === i ? (v + 1) % 4 : v)) as Turns)}>
                Girar en {axis}
              </button>
            ))}
            <button type="button" onClick={() => setTurns([0, 0, 0])}>Como vino</button>
          </div>
        </fieldset>

        <fieldset className={s.group} disabled={!model}>
          <legend>Material y color</legend>
          <div className={s.segmented} role="radiogroup" aria-label="Material">
            {printer.materials.map((m) => (
              <button key={m} type="button" role="radio" aria-checked={settings.material === m} onClick={() => set('material', m as MaterialId)}>
                {MATERIALS[m].label}
              </button>
            ))}
          </div>
          <p className={s.note}>{MATERIALS[settings.material].note}</p>
          <Swatches colors={colors} value={colorDef.id} onChange={setColor} />
        </fieldset>

        <fieldset className={s.group} disabled={!model}>
          <legend>Relleno y capa</legend>
          <label className={s.inline}>
            <span className={s.rangeLabel}>Relleno</span>
            <input type="range" min={5} max={100} step={5} value={Math.round(settings.infill * 100)} onChange={(e) => set('infill', Number(e.target.value) / 100)} />
            <span className={`${s.rangeValue} num`}>{Math.round(settings.infill * 100)}%</span>
          </label>
          <div className={s.chips} role="radiogroup" aria-label="Altura de capa">
            {printer.layerHeights.map((h) => (
              <button key={h} type="button" role="radio" aria-checked={settings.layerHeight === h} onClick={() => set('layerHeight', h)}>
                {h.toFixed(2).replace('.', ',')}
              </button>
            ))}
          </div>
          <p className={s.note}>Altura de capa en mm: menos es más liso y tarda más.</p>
        </fieldset>

        <div className={s.price}>
          <div className={s.priceRow}>
            <span>{!many ? 'Por pieza' : kept.length > 1 ? `Las ${kept.length} planchas` : `La plancha ${numbers(kept)}`}</span>
            {est ? <Price value={est.unitPrice} /> : <span>Subí un archivo</span>}
          </div>
          {many && est && (
            <p className={`${s.note} num`}>
              {skip.length > 0 && `Sin ${skip.length > 1 ? 'las planchas' : 'la plancha'} ${numbers(skip)}. `}
              {kept.length > 1 ? `Se imprimen por separado: ${grams(est.grams)} y ${duration(est.seconds)} en total.` : `${grams(est.grams)} y ${duration(est.seconds)}.`}
            </p>
          )}
          <div className={s.priceRow}>
            <label htmlFor="qty">Cantidad</label>
            <div className="qty">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Una menos">−</button>
              <input id="qty" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
              <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Una más">+</button>
            </div>
          </div>
          <p className={s.note}>Incluye {money(PRICING.setupPerLine)} de preparación del archivo.</p>
          <div className={`${s.priceRow} ${s.total}`}>
            <span>Total estimado</span>
            <span aria-live="polite">
              <Price value={est ? total : 0} />
            </span>
          </div>
          <button type="button" className="btn btn--full" disabled={!item} onClick={() => item && cart.add(item)}>
            Agregar al pedido
          </button>
          {item && (
            <a className="link" href={waLink(orderMessage([{ ...item, key: 'q' }]))} target="_blank" rel="noopener noreferrer">
              Consultar solo esta pieza por WhatsApp
            </a>
          )}
          {item && (
            <p className="file-note" role="note">
              <b>Importante:</b> el archivo no se envía solo. Mandá el mensaje y adjuntá tu archivo en el mismo chat de WhatsApp.
            </p>
          )}
          {item && WA_PENDING && <p className={s.note}>Número de WhatsApp pendiente: el mensaje se abre para que elijas el contacto.</p>}
          <p className={s.note}>Es una estimación hecha con la geometría del archivo. Te confirmamos el precio final antes de imprimir.</p>
        </div>
      </aside>
    </div>
  );
}
