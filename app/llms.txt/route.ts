import { PRICING, SHOP } from '@/lib/config';
import { DEFAULT_PRINTER } from '@/lib/printers';
import { money } from '@/lib/format';
import { abs, phone } from '@/lib/seo';

// The site in one page for AI assistants (llmstxt.org). Built from the config, so prices and
// places never drift from what the site shows.
export const dynamic = 'force-static';

export function GET() {
  const [x, y, z] = DEFAULT_PRINTER.volume.map((mm) => mm / 10);
  const text = `# ${SHOP.name}

> Impresión 3D a pedido en ${SHOP.city}, ${SHOP.region} (Argentina). El cliente sube su archivo STL, 3MF u OBJ en ${abs('/cotizar')}, ajusta escala, material, color y cantidad, y ve el precio al instante. El pedido se confirma por WhatsApp. ${SHOP.name} es parte de NosterLabs.

## Datos clave

- Qué hace: impresión 3D FDM a pedido, desde una unidad o por cantidad (series, llaveros, souvenirs, regalos de empresa).
- Dónde: ${SHOP.city}, con entrega en ${SHOP.areas.join(', ')}. No tiene local a la calle: la entrega se coordina por WhatsApp.
- Impresora: Bambu Lab A1 mini. Tamaño máximo de una pieza: ${x} × ${y} × ${z} cm. Capa desde 0,08 mm, boquilla de 0,4 mm.
- Materiales: PLA (interior, decoración, prototipos) y PETG (calor, sol, humedad, uso diario), en colores Hellbot Ecofila.
- Precio: se calcula con la geometría del archivo (filamento, tiempo de impresión, energía y desgaste de la máquina). Mínimo de ${money(PRICING.minimumPerPiece)} por pieza; cada archivo propio suma ${money(PRICING.setupPerLine)} de preparación. El precio final se confirma antes de imprimir.
- Privacidad: el cotizador mide el archivo en el navegador; el archivo no se sube a ningún servidor.
- Pago: transferencia o Mercado Pago. Contacto: WhatsApp ${phone()}.

## Páginas

- [Cotizador online](${abs('/cotizar')}): subí un STL, 3MF u OBJ y obtené medidas, gramos, tiempo y precio.
- [Impresión 3D en ${SHOP.city} y Zona Oeste](${abs('/impresion-3d-ituzaingo')}): zona de entrega, cómo pedir y preguntas frecuentes.
- [Catálogo](${abs('/catalogo')}): modelos listos para imprimir.
- [Pedidos por cantidad](${abs('/mayoristas')}): presupuesto mayorista por WhatsApp.
`;
  return new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
