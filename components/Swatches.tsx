import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ToggleEvent } from 'react';
import Icon from './Icon';
import { COLORS, type ColorId } from '@/lib/config';
import s from './Swatches.module.css';

const STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

// Ecofila colour picker: a field with the chosen spool that opens Hellbot's lines in a floating panel.
// Inside, one tab stop: arrows move the choice, Enter or a click picks and closes.
export default function Swatches({ colors, value, onChange, label = 'Color' }: { colors: readonly ColorId[]; value: ColorId; onChange: (c: ColorId) => void; label?: string }) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const shown = COLORS.filter((c) => colors.includes(c.id));
  const lines = [...new Set(shown.map((c) => c.line))];
  const current = shown.find((c) => c.id === value) ?? shown[0];

  const pick = (c: ColorId) => {
    onChange(c);
    panel.current?.hidePopover();
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = STEP[e.key];
    if (!step) return;
    e.preventDefault();
    const next = shown[(shown.indexOf(current) + step + shown.length) % shown.length];
    onChange(next.id);
    e.currentTarget.querySelector<HTMLElement>(`[data-id="${next.id}"]`)?.focus();
  };

  const onToggle = (e: ToggleEvent<HTMLDivElement>) => {
    if (e.newState === 'open') panel.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    else setHover(null);
  };

  return (
    // the panel is anchored to the field in CSS; the anchor name has to be unique per picker
    <div className={s.picker} style={{ '--anchor': `--colors${id.replace(/[^\w-]/g, '')}` } as CSSProperties}>
      <button type="button" className={s.trigger} popoverTarget={`${id}-colors`} aria-label={`${label}: ${current.label}`}>
        <i className={s.dot} style={{ background: current.hex }} />
        <span>{current.label}</span>
        {lines.length > 1 && <small>{current.line}</small>}
        <Icon name="chevron" />
      </button>
      <div ref={panel} id={`${id}-colors`} popover="auto" className={s.panel} onToggle={onToggle}>
        <p className={s.name} aria-hidden="true">{hover ?? current.label}</p>
        <div className={s.lines} role="radiogroup" aria-label={label} onKeyDown={onKey}>
          {lines.map((line) => (
            <div key={line} className={s.line}>
              {lines.length > 1 && <span>{line}</span>}
              <div>
                {shown
                  .filter((c) => c.line === line)
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      data-id={c.id}
                      aria-checked={current.id === c.id}
                      tabIndex={current.id === c.id ? 0 : -1}
                      aria-label={c.label}
                      onClick={() => pick(c.id)}
                      onPointerEnter={() => setHover(c.label)}
                      onPointerLeave={() => setHover(null)}
                      style={{ background: c.hex }}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
