'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { LIMITS, WA_PENDING, clampQty, itemTotal, orderMessage, waLink, type CartItem } from '@/lib/whatsapp';
import { tierFor } from '@/lib/pricing';
import { money } from '@/lib/format';

type Cart = {
  items: CartItem[];
  add: (item: Omit<CartItem, 'key'> & { key?: string }) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  added: number; // counts adds, so the badge beats once per add and not when the saved cart loads
};

const CartContext = createContext<Cart | null>(null);
const STORAGE = 'filumlabs-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE);
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  const save = useCallback((next: CartItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE, JSON.stringify(next));
    } catch {}
  }, []);

  const value = useMemo<Cart>(
    () => ({
      items,
      open,
      setOpen,
      added,
      add: (item) => {
        const key = item.key ?? `${item.name}|${item.detail}`;
        const found = items.find((i) => i.key === key);
        save(found ? items.map((i) => (i.key === key ? { ...i, qty: i.qty + item.qty } : i)) : [...items, { ...item, key }]);
        setAdded((n) => n + 1);
        setOpen(true);
      },
      setQty: (key, qty) => save(items.map((i) => (i.key === key ? { ...i, qty: clampQty(qty) } : i))),
      remove: (key) => save(items.filter((i) => i.key !== key)),
    }),
    [items, open, added, save],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error('useCart outside CartProvider');
  return c;
}

export function CartButton() {
  const { items, setOpen, added } = useCart();
  const count = items.reduce((n, i) => n + i.qty, 0);
  return (
    <button type="button" className="nav-cart" onClick={() => setOpen(true)} aria-label={`Carrito, ${count} productos`}>
      Carrito
      {count > 0 && (
        <span key={added} className="nav-count" data-bump={added > 0 || undefined}>
          {count}
        </span>
      )}
    </button>
  );
}

function CartDrawer() {
  const { items, open, setOpen, setQty, remove } = useCart();
  const total = items.reduce((n, i) => n + itemTotal(i), 0);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const back = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', onKey);
    return () => {
      removeEventListener('keydown', onKey);
      back?.focus();
    };
  }, [open, setOpen]);

  return (
    <div className="drawer" data-open={open} aria-hidden={!open}>
      <button type="button" className="drawer-scrim" tabIndex={-1} aria-label="Cerrar carrito" onClick={() => setOpen(false)} />
      <aside ref={panel} tabIndex={-1} className="drawer-panel" role="dialog" aria-modal="true" aria-label="Tu pedido" inert={!open}>
        <header className="drawer-head">
          <h2>Tu pedido</h2>
          <button type="button" className="link" onClick={() => setOpen(false)}>
            Cerrar
          </button>
        </header>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <p>Todavía no agregaste nada.</p>
            <p>
              <Link href="/catalogo" onClick={() => setOpen(false)}>Mirá el catálogo</Link> o{' '}
              <Link href="/cotizar" onClick={() => setOpen(false)}>cotizá tu pieza</Link>.
            </p>
          </div>
        ) : (
          <ul className="drawer-list">
            {items.map((i) => {
              const off = tierFor(i.qty);
              return (
                <li key={i.key}>
                  <div className="drawer-row">
                    <strong>{i.name}</strong>
                    <span className="num">{money(itemTotal(i))}</span>
                  </div>
                  <p className="drawer-detail">{i.detail}</p>
                  {i.kind === 'a-medida' && <p className="drawer-detail">Incluye la preparación del archivo.</p>}
                  {off && <p className="drawer-detail">{Math.round(off.off * 100)}% menos por cantidad.</p>}
                  <div className="drawer-row">
                    <div className="qty" role="group" aria-label={`Cantidad de ${i.name}`}>
                      <button type="button" onClick={() => setQty(i.key, i.qty - 1)} aria-label="Una menos">−</button>
                      <input type="number" min={1} max={LIMITS.qty} value={i.qty} onChange={(e) => setQty(i.key, Number(e.target.value) || 1)} aria-label="Cantidad" />
                      <button type="button" onClick={() => setQty(i.key, i.qty + 1)} aria-label="Una más">+</button>
                    </div>
                    <button type="button" className="link" onClick={() => remove(i.key)}>
                      Quitar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {items.length > 0 && (
          <footer className="drawer-foot">
            <div className="drawer-row drawer-total">
              <span>Total estimado</span>
              <span className="num">{money(total)}</span>
            </div>
            <a className="btn btn--full" href={waLink(orderMessage(items))} target="_blank" rel="noopener noreferrer">
              Enviar pedido por WhatsApp
            </a>
            {items.some((i) => i.kind === 'a-medida') && (
              <p className="file-note" role="note">
                <b>Importante:</b> los archivos de tus piezas a medida no se envían solos. Mandá el mensaje y adjuntalos en el mismo chat de WhatsApp.
              </p>
            )}
            {WA_PENDING && <p className="wa-note">Número de WhatsApp pendiente: el mensaje se abre para que elijas el contacto.</p>}
            <p className="wa-note">Te confirmamos el precio final y la forma de pago por WhatsApp antes de imprimir.</p>
          </footer>
        )}
      </aside>
    </div>
  );
}
