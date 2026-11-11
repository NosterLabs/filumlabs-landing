import s from './Faq.module.css';

// Questions a customer asks before sending a file; answers state only what the shop does.
export const FAQ: [string, string][] = [
  ['¿Qué archivos puedo subir?', 'STL, 3MF u OBJ, en milímetros. Si tu archivo está en centímetros o pulgadas, el cotizador tiene un botón para corregir la escala.'],
  ['¿Qué tamaño máximo puede tener una pieza?', 'Hasta 18 × 18 × 18 cm, el volumen de la Bambu Lab A1 mini. Si tu pieza es más grande, escribinos: muchas se pueden dividir en partes y unir después.'],
  ['¿El precio del cotizador es el final?', 'Es una estimación hecha con la geometría de tu archivo. Antes de imprimir laminamos la pieza y te confirmamos gramos, tiempo y precio final.'],
  ['¿PLA o PETG?', 'PLA para piezas de interior, decoración y prototipos. PETG si la pieza va a estar al sol, cerca del calor o en contacto con agua.'],
  ['¿Mi archivo queda guardado en algún lado?', 'No. El cotizador lo mide en tu navegador y no lo sube a ningún servidor. Nos lo mandás vos por WhatsApp cuando confirmás el pedido.'],
  ['¿Entregan en Ituzaingó y Zona Oeste?', 'Sí. Estamos en Ituzaingó y entregamos en Ituzaingó, Castelar, Morón, Haedo, Hurlingham, San Antonio de Padua y Merlo. La entrega se coordina por WhatsApp cuando confirmás el pedido.'],
  ['¿Cómo pago?', 'El pedido se cierra por WhatsApp. Pagás por transferencia o Mercado Pago.'],
  ['¿Cuándo está listo mi pedido?', 'Depende del tamaño, la cantidad y la cola de impresión. Te damos la fecha cuando confirmamos el pedido.'],
];

export default function Faq() {
  return (
    <div className={s.list}>
      {FAQ.map(([q, a], i) => (
        <details key={q} className={s.item} open={i === 0} data-reveal="rise">
          <summary>
            <span>{q}</span>
            <i aria-hidden="true" />
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}
