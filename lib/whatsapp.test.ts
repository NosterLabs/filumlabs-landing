import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LIMITS, clampQty, fitsWhatsApp, orderMessage, itemTotal, waLink } from './whatsapp.ts';

// Spanish as people write it: spaces, accents, question marks
const prose = (n: number) => '¿Podés imprimir una pieza así, con más detalle y en qué tamaño? '.repeat(20).slice(0, n);

test('a form filled to every limit still makes a WhatsApp link that opens', () => {
  const contact = `Hola FilumLabs, soy ${prose(LIMITS.name)}. Tengo una consulta sobre otra consulta:\n\n${prose(LIMITS.text)}`;
  const wholesale = [
    'Hola FilumLabs, quiero un presupuesto por cantidad:',
    `• ${LIMITS.qty} × una pieza propia (${prose(LIMITS.short)}), color marrón claro (capibara)`,
    `Lo necesito para: ${prose(LIMITS.short)}`,
    `Notas: ${prose(LIMITS.text)}`,
  ].join('\n');
  assert.ok(fitsWhatsApp(contact), `${waLink(contact).length}`);
  assert.ok(fitsWhatsApp(wholesale), `${waLink(wholesale).length}`);
  assert.ok(!fitsWhatsApp('á'.repeat(LIMITS.text))); // all accents: too long, the forms say so instead of sending
  assert.deepEqual([clampQty(0), clampQty(NaN), clampQty(2.6), clampQty(1e9)], [1, 1, 3, LIMITS.qty]);
});

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
