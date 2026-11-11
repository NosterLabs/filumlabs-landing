import { SHOP } from './config.ts';
import { lineTotal, tierFor } from './pricing.ts';
import { money } from './format.ts';

export type CartItem = {
  key: string;
  kind: 'catalogo' | 'a-medida';
  name: string;
  detail: string; // variant, material, colour, settings
  unitPrice: number;
  qty: number;
  href?: string;
};

export const itemTotal = (i: CartItem) => lineTotal(i.unitPrice, i.qty, i.kind === 'a-medida');

export function orderMessage(items: CartItem[]) {
  const lines = items.map((i) => {
    const off = tierFor(i.qty);
    return [
      `• ${i.qty} × ${i.name}${i.kind === 'a-medida' ? ' (a medida)' : ''}`,
      `  ${i.detail}`,
      `  ${money(itemTotal(i))}${off ? ` (incluye ${Math.round(off.off * 100)}% por cantidad)` : ''}`,
    ].join('\n');
  });
  const total = items.reduce((n, i) => n + itemTotal(i), 0);
  // no line about files: the customer attaches them in the chat, the UI tells them so
  return [
    'Hola FilumLabs, quiero hacer este pedido:',
    '',
    ...lines,
    '',
    `Total estimado: ${money(total)}`,
  ]
    .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
    .join('\n')
    .trim();
}

// without a business number, wa.me opens the chat picker with the message ready
export const WA_PENDING = !SHOP.whatsapp;

export const waLink = (text: string) => `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(text)}`;

// a wa.me link opens everywhere up to about 2000 characters. The message travels encoded:
// a space takes 3, an accent 6, so the forms cap their fields and check the finished link too.
export const WA_MAX_URL = 2000;
export const LIMITS = { name: 60, short: 80, text: 500, qty: 9999 };
export const fitsWhatsApp = (text: string) => waLink(text).length <= WA_MAX_URL;
export const clampQty = (n: number) => Math.min(LIMITS.qty, Math.max(1, Math.round(n) || 1));
