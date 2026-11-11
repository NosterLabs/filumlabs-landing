'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import type { BufferGeometry } from 'three';
import Viewer from '../Viewer';
import Icon from '../Icon';
import Price from '../Price';
import Typed from '../Typed';
import { DropArea, UploadButton } from '../Upload';
import type { Stage, StageView } from '@/lib/stage';
import { DEFAULT_PRINTER } from '@/lib/printers';
import { FILM_VIEWS, HERO_SCALE, filmStill, heroPoster } from '@/lib/hero';
import { duration, grams, money, size } from '@/lib/format';
import s from './Film.module.css';

export type FilmFigures = { size: [number, number, number]; grams: number; seconds: number; layers: number; price: number };
export type FilmData = { file: string; name: string; color: string; before: FilmFigures; after: FilmFigures; message: string; demo: boolean };

const CHAPTERS = [
  { step: 'Archivo', title: 'Subís el archivo', text: 'STL, 3MF u OBJ. Lo abrimos en tu navegador, medimos cada triángulo y lo ubicamos en el volumen real de la A1 mini. El archivo no sale de tu computadora.' },
  { step: 'Ajuste', title: 'Lo ajustás', text: 'Escala, material, color Ecofila, relleno y cantidad. Cada cambio recalcula gramos, tiempo y precio en el momento.' },
  { step: 'Impresión', title: 'Se imprime', text: 'Laminamos tu archivo y lo imprimimos capa por capa, en PLA o PETG. Te avisamos cuando está lista.' },
  { step: 'Pedido', title: 'Lo pedís', text: 'El pedido nos llega por WhatsApp con el detalle de cada pieza. Antes de imprimir te confirmamos el precio final.' },
];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// The part at film position f: 0 is the hero, 0 to 4 runs through the four chapters.
function shot(f: number) {
  const grow = smooth(1.3, 1.8, f);
  // chapter 3 clears the plate at its door, then the scroll prints the part again
  const cut = f < 1.85 ? 1 : f < 2.1 ? 1 - smooth(1.85, 2.05, f) : f < 3 ? clamp01((f - 2.1) / 0.8) : 1;
  return { wire: smooth(0.1, 0.5, f) * (1 - smooth(1.05, 1.35, f)), grow, k: mix(1, HERO_SCALE, grow), cut, hot: f >= 2.1, turn: f * 0.4 };
}

// narrow: the stage is the top half of a phone, the glass note covers its base, so the part sits higher;
// wide: the note covers the stage's left corner, so the part sits right of centre
function viewAt(f: number, narrow: boolean): StageView {
  const i = Math.min(3, Math.floor(f));
  const t = f >= 4 ? 1 : smooth(0, 0.7, f - i);
  const a = FILM_VIEWS[i], b = FILM_VIEWS[i + 1];
  const shift = narrow ? { x: 0, y: 0.12 } : { x: 0.1, y: 0.02 };
  return { azimuth: mix(a.azimuth, b.azimuth, t), elevation: mix(a.elevation, b.elevation, t), pad: mix(a.pad!, b.pad!, t), fit: HERO_SCALE, shift };
}

// The home page as one take: the hero piece stays on a sticky stage while the hero copy and four
// chapters scroll beside it, and the scroll turns, grows and prints it. Nothing stops the wheel.
// Reduced motion or no WebGL: no sticky stage, every chapter shows its own still image.
export default function Film({ data, children }: { data: FilmData; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const stageBox = useRef<HTMLDivElement>(null);
  const chapters = useRef<(HTMLElement | null)[]>([]);
  const printing = useRef(true);
  const [stage, setStage] = useState<Stage | null>(null);
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);
  const [live, setLive] = useState(false);
  const [still, setStill] = useState(false);
  const [printP, setPrintP] = useState(1);
  const [pos, setPos] = useState(0);

  // three.js loads after the page is idle; until then the poster render stands in
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return setStill(true);
    const start = () => setLive(true);
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(start, { timeout: 1500 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(start, 700);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!live) return;
    let alive = true;
    import('@/lib/models').then(({ buildViewModel }) => alive && setGeometry(buildViewModel('torre')));
    return () => {
      alive = false;
    };
  }, [live]);

  // one film position per frame, from where the chapters sit against a reading line: 60 % down the
  // screen beside the stage, or right under the stage on phones, where each chapter's text sticks
  useEffect(() => {
    if (still) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const narrow = innerWidth <= 960;
      const line = narrow ? stageBox.current!.getBoundingClientRect().bottom + 1 : innerHeight * 0.6;
      const f = chapters.current.reduce((n, el) => {
        if (!el) return n;
        const r = el.getBoundingClientRect();
        return n + clamp01((line - r.top) / r.height);
      }, 0);
      root.current?.toggleAttribute('data-moved', scrollY > 40);
      setPos(Math.round(f * 400) / 400);
      if (!stage || !geometry) return;
      // the hero's own print plays until the reader scrolls into the chapters
      if (f > 0) stage.skip();
      if (f > 0 || !printing.current) {
        const sh = shot(f);
        stage.setScale(sh.k);
        stage.setWire(sh.wire);
        stage.setCut(sh.cut, sh.hot);
        stage.setTurn(sh.turn);
      }
      stage.setView(viewAt(f, narrow));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [still, stage, geometry]);

  const onPrint = (p: number) => {
    printing.current = p < 1;
    setPrintP(p);
  };

  // the glass note reads the same position: what the quoter would show at this point of the film
  const sh = shot(pos);
  const { before: a, after: b } = data;
  const done = pos > 0 ? sh.cut : printP;
  const layers = Math.round(mix(a.layers, b.layers, sh.grow));
  const busy = done < 1 && (pos === 0 || pos >= 2.1);
  const status = busy ? 'Imprimiendo' : pos < 0.5 ? 'Lista' : pos < 1.5 ? 'Archivo leído' : pos < 2.1 ? 'Ajustando' : pos < 3.5 ? 'Lista' : 'En el pedido';
  const active = pos <= 0 ? 0 : Math.min(4, Math.floor(pos) + 1);

  return (
    <DropArea className={s.film} label="Cotizá tu pieza">
      <div ref={root} className={s.inner} data-still={still || undefined}>
        <div ref={stageBox} className={s.stage}>
          <div className={s.scene}>
            {live ? (
              <Viewer
                geometry={geometry}
                color={data.color}
                volume={DEFAULT_PRINTER.volume}
                framing="model"
                view={FILM_VIEWS[0]}
                interactive={false}
                poster={heroPoster}
                print={6500}
                onProgress={onPrint}
                onReady={(ok) => !ok && setStill(true)}
                onStage={setStage}
                label={`${data.name} en 3D, la pieza que acompaña cada paso`}
              />
            ) : (
              <img src={heroPoster} alt={`Render 3D de ${data.name}`} width={1500} height={1600} className={s.poster} fetchPriority="high" />
            )}
          </div>

          <div className={`${s.note} glass`}>
            <div className={s.noteHead}>
              <span>{data.name}</span>
              <span className={s.status} data-live={busy || undefined}>
                {status}
              </span>
            </div>
            <dl className={`${s.rows} num`}>
              <div data-row="size">
                <dt>Medidas</dt>
                <dd>{size(a.size.map((v) => v * sh.k) as FilmFigures['size'])}</dd>
              </div>
              <div>
                <dt>Capas</dt>
                <dd>{done < 1 ? `${Math.max(1, Math.ceil(layers * done))} de ${layers}` : layers}</dd>
              </div>
              <div data-row="grams">
                <dt>Filamento</dt>
                <dd>{grams(mix(a.grams, b.grams, sh.grow) * done)}</dd>
              </div>
              <div data-row="time">
                <dt>Tiempo</dt>
                <dd>{duration(mix(a.seconds, b.seconds, sh.grow) * done)}</dd>
              </div>
              <div>
                <dt>
                  Precio<span className={s.long}> estimado</span>
                </dt>
                <dd>
                  <Price value={sh.grow > 0.5 ? b.price : a.price} />
                </dd>
              </div>
            </dl>
            <p className={s.noteFoot}>Medido con el mismo cotizador que vas a usar.{data.demo ? ' Precio de ejemplo.' : ''}</p>
          </div>

          <nav className={s.steps} aria-label="Pasos del recorrido" data-on={(pos > 0 && pos < 4) || undefined}>
            <ol>
              {CHAPTERS.map((c, i) => (
                <li key={c.step}>
                  <a href={`#paso-${i + 1}`} aria-current={active === i + 1 ? 'step' : undefined}>
                    <span className="num">0{i + 1}</span>
                    <span>{c.step}</span>
                  </a>
                </li>
              ))}
            </ol>
            <a href="#destacados" className={s.skip}>
              Saltar al catálogo
            </a>
          </nav>
        </div>

        <div className={s.hero}>{children}</div>

        <section id="como-funciona" className={s.chapters} aria-labelledby="film-title">
          <h2 id="film-title" className={s.kicker}>
            Del archivo a la pieza
          </h2>
          {CHAPTERS.map((c, i) => (
            <article
              key={c.step}
              id={`paso-${i + 1}`}
              ref={(el) => {
                chapters.current[i] = el;
              }}
              className={s.chapter}
              data-active={active === i + 1 || undefined}
            >
              <img src={filmStill(i + 1)} alt="" width={1200} height={1000} loading="lazy" className={s.still} />
              <div className={s.text} data-reveal="rise">
                <p className={`${s.num} num`}>0{i + 1}</p>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                {i === 0 && (
                  <p className={s.chip}>
                    <Icon name="file" />
                    <span>{data.file}</span>
                    <span className="num">{size(a.size)}</span>
                  </p>
                )}
                {i === 1 && (
                  <p className={`${s.chip} num`}>
                    Escala 100 % a {Math.round(HERO_SCALE * 100)} %: de {money(a.price)} a {money(b.price)}
                  </p>
                )}
                {i === 2 && (
                  <ul className={s.specs}>
                    <li>
                      <b className="num">0,08 mm</b> la capa más fina
                    </li>
                    <li>
                      <b className="num">0,4 mm</b> de boquilla
                    </li>
                    <li>
                      <b className="num">18 cm</b> por lado, como máximo
                    </li>
                  </ul>
                )}
                {i === 3 && (
                  <>
                    <div className={s.bubble}>
                      <Typed text={data.message} />
                    </div>
                    <div className={s.actions}>
                      <UploadButton label="Cotizar mi pieza" />
                      <Link href="/catalogo" className="btn btn--ghost">
                        Ver el catálogo
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </article>
          ))}
        </section>
      </div>
    </DropArea>
  );
}
