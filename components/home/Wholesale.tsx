'use client';

import { useId, useState } from 'react';
import { Mark } from '../Brand';
import Icon from '../Icon';
import Swatches from '../Swatches';
import { COLORS, colorOf, type ColorId } from '@/lib/config';
import { money } from '@/lib/format';
import { WA_PENDING, waLink } from '@/lib/whatsapp';
import s from './Wholesale.module.css';

export type WholesaleItem = { slug: string; name: string; variants: { id: string; label: string; price: number }[]; colors: ColorId[] };

// Builds the wholesale request as the reader fills it in, shown as the WhatsApp chat it opens.
export default function Wholesale({ items, demo }: { items: WholesaleItem[]; demo: boolean }) {
  const id = useId();
  const [own, setOwn] = useState(false);
  const [slug, setSlug] = useState(items[0].slug);
  const [variant, setVariant] = useState(items[0].variants[0].id);
  const [piece, setPiece] = useState('');
  const [qty, setQty] = useState(50);
  const [color, setColor] = useState<ColorId>(items[0].colors[0]);
  const [when, setWhen] = useState('');
  const [notes, setNotes] = useState('');

  const item = own ? null : items.find((i) => i.slug === slug)!;
  const v = item?.variants.find((x) => x.id === variant) ?? item?.variants[0];
  const colors = item?.colors ?? COLORS.map((c) => c.id);
  const c = colorOf(colors.includes(color) ? color : colors[0]);
  const what = item
    ? `${item.name}${item.variants.length > 1 && v ? ` ${v.label}` : ''}`
    : `una pieza propia${piece.trim() ? ` (${piece.trim()})` : ''}`;

  // the file never goes in the message: WhatsApp cannot attach it from a link, so the customer attaches it in the chat
  const lines = [
    'Hola FilumLabs, quiero un presupuesto por cantidad:',
    `• ${qty} × ${what}, color ${c.label.toLowerCase()}`,
    when.trim() && `Lo necesito para: ${when.trim()}`,
    notes.trim() && `Notas: ${notes.trim()}`,
  ].filter(Boolean) as string[];

  const pick = (next: string) => {
    setSlug(next);
    const it = items.find((i) => i.slug === next)!;
    setVariant(it.variants[Math.min(1, it.variants.length - 1)].id);
    if (!it.colors.includes(color)) setColor(it.colors[0]);
  };

  return (
    <div className={s.layout}>
      <form className={s.form} onSubmit={(e) => e.preventDefault()}>
        <div className={s.field}>
          <span id={`${id}-k`}>Qué querés pedir</span>
          <div className={s.kind} role="radiogroup" aria-labelledby={`${id}-k`}>
            <button type="button" role="radio" aria-checked={!own} onClick={() => setOwn(false)}>
              <b>Del catálogo</b>
              <span>Un modelo listo para imprimir</span>
            </button>
            <button type="button" role="radio" aria-checked={own} onClick={() => setOwn(true)}>
              <b>Pieza propia</b>
              <span>Tu archivo STL, 3MF u OBJ</span>
            </button>
          </div>
        </div>

        {item ? (
          <div className={s.row}>
            <div className={s.field}>
              <label htmlFor={`${id}-p`}>Modelo</label>
              <select id={`${id}-p`} value={slug} onChange={(e) => pick(e.target.value)}>
                {items.map((i) => (
                  <option key={i.slug} value={i.slug}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
            {item.variants.length > 1 && (
              <div className={s.field}>
                <span id={`${id}-v`}>Tamaño</span>
                <div className={s.options} role="radiogroup" aria-labelledby={`${id}-v`}>
                  {item.variants.map((x) => (
                    <button key={x.id} type="button" role="radio" aria-checked={variant === x.id} onClick={() => setVariant(x.id)}>
                      {x.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={s.field}>
            <label htmlFor={`${id}-d`}>Qué pieza es (opcional)</label>
            <input id={`${id}-d`} type="text" placeholder="Por ejemplo, soporte para estante" value={piece} onChange={(e) => setPiece(e.target.value)} />
          </div>
        )}

        <div className={s.row}>
          <div className={s.field}>
            <label htmlFor={`${id}-q`}>Cantidad</label>
            <div className="qty">
              <button type="button" onClick={() => setQty((n) => Math.max(1, n - 10))} aria-label="Diez menos">−</button>
              <input id={`${id}-q`} type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
              <button type="button" onClick={() => setQty((n) => n + 10)} aria-label="Diez más">+</button>
            </div>
          </div>
          <div className={s.field}>
            <span>Color</span>
            <Swatches colors={colors} value={c.id} onChange={setColor} />
          </div>
        </div>

        <div className={s.field}>
          <label htmlFor={`${id}-w`}>Para cuándo (opcional)</label>
          <input id={`${id}-w`} type="text" placeholder="Por ejemplo, fin de mes" value={when} onChange={(e) => setWhen(e.target.value)} />
        </div>
        <div className={s.field}>
          <label htmlFor={`${id}-n`}>Notas (opcional)</label>
          <textarea id={`${id}-n`} rows={3} placeholder="Packaging, un color especial, una entrega en partes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </form>

      <div className={s.side}>
        <p className={s.sideLabel}>Así llega tu mensaje por WhatsApp</p>
        <figure className={s.chat} aria-label="Vista previa del mensaje de WhatsApp">
          <div className={s.chatHead}>
            <span className={s.avatar}>
              <Mark />
            </span>
            <span className={s.contact}>
              <b>FilumLabs</b>
              <small>WhatsApp</small>
            </span>
          </div>
          <div className={s.chatBody}>
            <p className={s.day}>Vista previa</p>
            <div className={s.msg} aria-live="polite">
              {lines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
              <span className={s.meta}>
                ahora
                <svg viewBox="0 0 18 12" aria-hidden="true">
                  <path d="M1 6.5 4.5 10 11 2M7 8.5 8.5 10 15 2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            {own && (
              <div className={s.attach}>
                <Icon name="file" />
                <span>Acá adjuntás tu archivo STL, 3MF u OBJ</span>
              </div>
            )}
          </div>
        </figure>

        {own && (
          <p className="file-note" role="note">
            <b>Importante:</b> el archivo no se envía solo. Cuando se abra WhatsApp, mandá el mensaje y adjuntá tu archivo en el mismo chat. Sin el archivo no podemos cotizar.
          </p>
        )}
        {item && v && (
          <p className={`${s.list} num`}>
            Precio de lista: {qty} × {money(v.price)} = {money(qty * v.price)}. El precio por cantidad te lo pasamos por WhatsApp.
          </p>
        )}
        <a className="btn btn--full" href={waLink(lines.join('\n'))} target="_blank" rel="noopener noreferrer">
          Abrir este mensaje en WhatsApp
        </a>
        {WA_PENDING && <p className="wa-note">Número de WhatsApp pendiente: el mensaje se abre para que elijas el contacto.</p>}
        {demo && item && <p className="wa-note">Productos y precios de ejemplo.</p>}
      </div>
    </div>
  );
}
