import { test } from 'node:test';
import assert from 'node:assert/strict';
import { orderMessage, itemTotal, waLink } from './whatsapp.ts';

test('order message lists items and the total', () => {
  const items = [
    { key: 'a', kind: 'catalogo' as const, name: 'Maceta facetada M', detail: 'PLA gris', unitPrice: 9100, qty: 10 },
    { key: 'b', kind: 'a-medida' as const, name: 'soporte', detail: '90 × 70 × 72 mm', unitPrice: 7700, qty: 1 },
  ];
  assert.equal(itemTotal(items[0]), 91000); // no quantity tiers configured
  assert.equal(itemTotal(items[1]), 9200); // + file preparation
  const m = orderMessage(items);
  assert.match(m, /10 × Maceta facetada M/);
  assert.match(m, /1 × soporte \(a medida\)/);
  assert.match(m, /Total estimado: \$\s?100\.200/);
  assert.doesNotMatch(m, /archivo/); // the customer attaches files in the chat, the message never claims it
  assert.doesNotMatch(m, /por cantidad/);
  assert.ok(waLink(m).startsWith('https://wa.me/'));
});
