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
