'use client';

import { useEffect, useRef, useState } from 'react';
import type { BufferGeometry, Quaternion } from 'three';
import type { Stage, StageOptions } from '@/lib/stage';
import Icon from './Icon';
import s from './Viewer.module.css';

type Props = {
  geometry: BufferGeometry | null;
  owned?: boolean; // the viewer disposes the geometry when it is replaced
  color: string;
  scale?: number;
  rotation?: Quaternion;
  fits?: boolean;
  volume: [number, number, number];
  framing?: StageOptions['framing'];
  view?: StageOptions['view'];
  interactive?: boolean;
  pan?: boolean; // right drag moves the view, with a button to center it again
  poster?: string; // shown until the 3D scene is ready, and instead of it without WebGL
  print?: number; // ms: play the print once each time the geometry changes
  onProgress?: (p: number) => void;
  onReady?: (ok: boolean) => void;
  onStage?: (stage: Stage | null) => void; // direct access, for a parent that drives the scene itself
  label: string;
  className?: string;
};

// React wrapper around lib/stage.ts. three.js loads in its own chunk, after the page.
export default function Viewer({
  geometry,
  owned = true,
  color,
  scale = 1,
  rotation,
  fits = true,
  volume,
  framing = 'volume',
  view,
  interactive = true,
  pan = false,
  poster,
  print,
  onProgress,
  onReady,
  onStage,
  label,
  className = '',
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<Stage | null>(null);
  const shown = useRef<BufferGeometry | null>(null);
  const painted = useRef<string | null>(null);
  const stopPrint = useRef<(() => void) | null>(null);
  const progress = useRef(onProgress);
  progress.current = onProgress;
  const [state, setState] = useState<'loading' | 'ready' | 'unsupported'>('loading');
  // counts stages built: a rebuilt stage (new framing or volume) is 'ready' again with no state change,
  // so the part effect below keys on this to put the part on the new stage
  const [built, setBuilt] = useState(0);

  useEffect(() => {
    let alive = true;
    import('@/lib/stage')
      .then(({ Stage }) => {
        if (!alive || !host.current) return;
        stage.current = new Stage(host.current, { volume, framing, view, interactive, pan });
        setState('ready');
        setBuilt((n) => n + 1);
        onReady?.(true);
        onStage?.(stage.current);
      })
      .catch(() => {
        if (!alive) return;
        setState('unsupported');
        onReady?.(false);
      });
    return () => {
      alive = false;
      stopPrint.current?.();
      onStage?.(null);
      stage.current?.dispose();
      stage.current = null;
      shown.current = null;
      painted.current = null;
    };
    // the stage is rebuilt only when the printer volume or the framing changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume.join('x'), framing]);

  useEffect(() => {
    const st = stage.current;
    if (!st || state !== 'ready') return;
    // a colour picked for the part on screen repaints it from the base up
    st.setColor(color, painted.current !== null && geometry === shown.current && !matchMedia('(prefers-reduced-motion: reduce)').matches);
    painted.current = color;
    st.setScale(scale);
    if (rotation) st.setRotation(rotation);
    st.setFits(fits);
    if (geometry !== shown.current) {
      shown.current = geometry;
      stopPrint.current?.();
      st.setModel(geometry, owned);
      const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (geometry && print && !still) {
        st.setCut(0);
        stopPrint.current = st.print({ duration: print, onProgress: (p) => progress.current?.(p) });
      } else {
        st.setCut(1);
        progress.current?.(1);
      }
    }
  }, [geometry, owned, color, scale, rotation, fits, print, state, built]);

  return (
    <div className={`${s.viewer} ${className}`} data-state={state} data-static={!interactive || undefined} data-ui>
      <div ref={host} className={s.canvas} role="img" aria-label={label} />
      {poster && <img src={poster} alt="" className={s.poster} data-hide={(state === 'ready' && !!geometry) || undefined} />}
      {state === 'unsupported' && <p className={s.note}>Tu navegador no muestra 3D. Las medidas y el precio se calculan igual.</p>}
      {pan && state === 'ready' && geometry && (
        <div className={s.tools} data-view-tools>
          <button type="button" onClick={() => stage.current?.recenter()}>
            <Icon name="center" />
            Centrar
          </button>
          <span className={s.hint}>Click derecho para mover</span>
        </div>
      )}
    </div>
  );
}
