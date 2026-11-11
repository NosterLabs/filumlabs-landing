import Icon, { type IconName } from './Icon';
import s from './GlassTile.module.css';

export type Viz = { kind: 'bars' | 'dots' | 'meter'; value: number; count?: number };

type Props = {
  icon: IconName;
  label: string;
  value: string;
  viz?: Viz;
  live?: boolean; // the value is moving right now (a print in progress)
  className?: string;
};

// The liquid-glass data tile from the brand references: icon ring and label on top, the figure below.
export default function GlassTile({ icon, label, value, viz, live, className = '' }: Props) {
  return (
    <div className={`${s.tile} glass ${className}`} data-live={live || undefined}>
      <div className={s.top}>
        <span className={s.ring}>
          <Icon name={icon} />
        </span>
        <span className={s.label}>{label}</span>
      </div>
      <div className={s.bottom}>
        <span className={`${s.value} num`}>{value}</span>
        {viz && <VizMark viz={viz} />}
      </div>
    </div>
  );
}

function VizMark({ viz }: { viz: Viz }) {
  const v = Math.max(0, Math.min(1, viz.value));
  if (viz.kind === 'meter') {
    return (
      <span className={s.meter} aria-hidden="true">
        <span style={{ transform: `scaleX(${v})` }} />
      </span>
    );
  }
  const n = viz.count ?? (viz.kind === 'bars' ? 8 : 12);
  const on = Math.round(v * n);
  return (
    <span className={viz.kind === 'bars' ? s.bars : s.dots} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <i key={i} data-on={i < on || undefined} style={viz.kind === 'bars' ? { height: `${34 + (i / (n - 1)) * 66}%` } : undefined} />
      ))}
    </span>
  );
}
