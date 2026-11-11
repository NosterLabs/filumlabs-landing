# FilumLabs · Dirección de diseño

Transcripción de lo que definió el dueño de la marca durante el proyecto. Es dirección, no código.

## Identidad
- Marca: FilumLabs by NosterLabs.
- Qué es: impresión 3D a pedido. El cliente sube su modelo, hace ajustes básicos y ve la cotización al momento. Además hay un catálogo de modelos listos para imprimir.
- Impresora: Bambu Lab A1 mini por ahora; más perfiles de Bambu Lab después.
- Público: minorista y mayorista, en Argentina.
- Sensación buscada: premium, exclusivo.

## Referencias elegidas por el dueño
- notmid.ar: estructura de tienda.
- Dos imágenes de liquid glass: tarjetas de vidrio esmerilado sobre una foto con grano, y un botón de vidrio tipo píldora.
- bambulab.com/en/a1-mini: página de producto.
- Dirección de "premium": cinemático oscuro, combinado con las referencias anteriores.

## Marca (hoja de marca v1, aprobada)
- Logo: isotipo "Encastre F" (variante 21·A) + wordmark FilumLabs + "by" con el logo de NosterLabs en monocromo.
- Paleta: monocromo + vidrio. Ink #0D1115, Slate #26333D, Fog #4D6576, Mist #B9C7D2, Paper #E6EAEE. Vidrio: blanco al 6–16 %.
- Tipografía: Urbanist.

## Pedidos del dueño para el sitio
- Motion graphics y animaciones en cada sección.
- Hero orientada a conversión.
- Catálogo con cards con imágenes, estilo catálogo, usando liquid glass como en las referencias.
- Conservar el visualizador 3D y optimizarlo.

## Datos de negocio (estado actual)
- WhatsApp: todavía no hay número. Los botones funcionan y muestran el aviso de número pendiente.
- Catálogo y precios: son de ejemplo y se muestran con una nota que lo dice.
- Mayoristas: sin escalas de descuento por ahora; el presupuesto se pide por WhatsApp.

Dial: ENERGY 3 / RHYTHM 3 / MOTION 3

## Rediseño "Una impresión de arriba abajo" (noviembre 2026)
Plan completo y decisiones en `REDESIGN-PLAN.md`. Lo que quedó en el sitio:
- Home: la torre diagrid (`lib/hero.ts`, modelo `torre` en `lib/models.ts`) queda en un escenario fijo mientras pasan el hero y cuatro capítulos (`components/home/Film.tsx`). El scroll la convierte en malla, la agranda al 130 %, la reimprime capa por capa y aleja la cámara. Nunca se frena la rueda.
- Las cifras del escenario (medidas, capas, gramos, tiempo, precio) salen del mismo estimador que el cotizador.
- Mayoristas tiene página propia (`/mayoristas`); en el home queda una franja con un mensaje que se escribe solo.
- Cierre: el pie de todas las páginas reproduce una vez el video generado con Veo (`public/video/a1-mini.mp4`). Es una ilustración: ningún texto lo presenta como el taller.
- Menú: al pasar la primera pantalla se vuelve una píldora de vidrio con Catálogo, Cotizar y Carrito.
- Movimiento compartido: precio con dígitos que ruedan (`components/Price.tsx`), repintado por capas al cambiar de color (visor), tarjeta del catálogo que se transforma en el visor del producto (`<ViewTransition>` de React), latido del contador del carrito.
- Con "reducir movimiento" o sin WebGL: sin escenario fijo, cada capítulo muestra su imagen (`public/renders/film-*.webp`, generadas con `npm run renders`), el video queda en su último cuadro.

Dial: ENERGY 4 / RHYTHM 3 / MOTION 4
