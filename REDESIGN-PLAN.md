# FilumLabs · Plan de rediseño "Una impresión de arriba abajo"

**Estado: implementado (11 de noviembre de 2026).** Las seis fases están hechas. Diferencias con el plan:
- El cierre no es una sección nueva del home: es el pie de todas las páginas, con el video de Veo de fondo, porque ya era el último pedido de cada página.
- La página de producto ya no usa `useSearchParams`: su `<Suspense>` hacía que el visor apareciera en un segundo render y la tarjeta no podía transformarse en él. El `?v=` del carrito se lee al montar.
- Volver con el botón "atrás" del navegador no anima la transición (React resuelve esas navegaciones de forma síncrona). El enlace "Catálogo" de la página de producto sí la anima.
- Los componentes que reemplazó el tramo (`Process`, `Detail`, `HeroStage`) se quitaron del proyecto.
La dirección de marca sigue siendo la de `DESIGN.md`: cinemático oscuro, monocromo con vidrio, y el naranja `--hot` solo en momentos de impresión en vivo.

## Idea

El home cuenta un pedido como una sola toma: la pieza del hero es la misma que después se sube, se ajusta, se imprime y se pide. El scroll mueve la impresión. Quien no quiere la película tiene el cotizador y el catálogo a un click desde la primera pantalla y durante todo el recorrido.

## Decisiones tomadas

- Dirección A: escenario 3D fijo que avanza con el scroll.
- Paleta monocroma. La pieza del home no cambia de color.
- Sin librerías nuevas: CSS, React 19.3 y three, que ya están instalados.
- El formulario mayorista sale del home a su propia página (ver "Estructura").

## Estructura del sitio

| Página | Hoy | Después |
| --- | --- | --- |
| `/` | Hero, catálogo completo, proceso, detalle, formulario mayorista, preguntas | Hero, secuencia de impresión, 4 productos destacados, franja mayorista, preguntas, cierre |
| `/catalogo` | Grilla completa | Igual, con transición hacia el producto |
| `/catalogo/[slug]` | Visor y compra | Igual, con la imagen de la tarjeta convertida en visor y repintado por capas |
| `/cotizar` | Cotizador | Igual, con precio animado. Es la página de trabajo: casi sin movimiento |
| `/mayoristas` | No existe (es una sección del home) | Página nueva con el formulario actual y la vista previa de WhatsApp |

Motivo de separar mayoristas: con la secuencia fija el home se alarga, y el formulario es una herramienta que el mayorista quiere abrir directo. En el home queda una franja corta con un botón.
El enlace "Mayoristas" del menú pasa de `/#mayoristas` a `/mayoristas`. "Cómo funciona" apunta a la secuencia.

## Home, sección por sección

### 1. Hero (una pantalla)

- Queda el contenido actual: título, texto, "Subir archivo", "Ver el catálogo" y soltar el archivo en cualquier parte.
- La pieza se imprime sola una vez al cargar, como hoy. Es el gancho para quien no hace scroll.
- El título entra por líneas, como capas que se depositan (ya existe `data-reveal="layers"`).
- Se quitan los botones para elegir pieza y "Imprimir de nuevo": la secuencia de abajo ocupa ese lugar. Queda una sola pieza protagonista.
- Abajo, una marca discreta "Mirá cómo se hace" con una flecha, que desaparece al empezar a bajar.

### 2. Secuencia "Del archivo a la pieza" (tramo fijo)

Reemplaza a las secciones actuales `Process` y `Detail`.
El lienzo 3D del hero queda fijo en pantalla y el texto cambia por capítulos. Alto del tramo: unas 4 pantallas en computadora.

| Capítulo | Qué hace la pieza | Qué muestra el texto |
| --- | --- | --- |
| 1. Subís el archivo | Se vuelve malla de alambre sobre la cama, con sus tres medidas acotadas | Nombre del archivo y medidas |
| 2. Lo ajustás | Crece del 100 % al 130 % | El precio rueda de un valor a otro (números reales de `processDemo()`) |
| 3. Se imprime | El scroll sube el corte de capa de 0 a 100 %, con la banda naranja en la capa activa | Contador de capas, gramos y tiempo |
| 4. Lo pedís | Pieza terminada, la cámara se aleja | Burbuja de WhatsApp con el mensaje real y botón "Cotizar mi pieza" |

Reglas del tramo:
- No se frena ni se secuestra el scroll: es `position: sticky`, la rueda siempre avanza.
- Indicador de progreso de 4 pasos al costado. Cada paso es un enlace que salta a su capítulo.
- Enlace "Saltar al catálogo" visible durante todo el tramo.
- En celular el lienzo queda fijo en la mitad superior y los capítulos pasan por debajo. El tramo se acorta a unas 3 pantallas.
- Con "reducir movimiento", o sin WebGL, no hay tramo fijo: 4 bloques estáticos, cada uno con su imagen ya renderizada.

### 3. Destacados

- 4 tarjetas del catálogo (las mismas `ProductCard`) y un botón "Ver los 8".
- Las tarjetas entran escalonadas como hoy.

### 4. Franja mayorista

- Título, una línea y botón a `/mayoristas`.
- El mensaje de WhatsApp de ejemplo se escribe solo al entrar en pantalla, una vez.

### 5. Preguntas y cierre

- Preguntas: igual que hoy.
- Cierre: una pantalla con el título grande, "Subir archivo" y "Ver el catálogo". Es la última toma.

## Barra rápida

Al pasar el hero aparece una barra compacta fija: "Cotizar", "Catálogo" y el carrito. Es la versión reducida del menú actual, no un componente nuevo encima del menú.

## Componentes animados

| Componente | Animación | Dónde |
| --- | --- | --- |
| Precio | Los dígitos ruedan al cambiar | Cotizador, producto, capítulo 2 |
| Color | La pieza se repinta de abajo hacia arriba, por capas | Producto y cotizador, al elegir en `Swatches` |
| Tarjeta a producto | La imagen se agranda y pasa a ser el visor | Catálogo y destacados |
| Carrito | El contador late una vez al sumar | Menú |
| Títulos | Entrada por líneas | Todas las secciones |
| Mensaje de WhatsApp | Se escribe solo | Franja mayorista y capítulo 4 |

Límites: nada se anima en interacciones repetidas del cotizador (deslizadores, cantidad) salvo el precio. Ninguna animación dura más de 400 ms fuera de la secuencia.

## Notas técnicas para la implementación

Leer antes `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md` (lo exige `AGENTS.md`).

- **Progreso del scroll:** un solo valor de 0 a 1 por tramo, calculado en un `requestAnimationFrame` disparado por `scroll`. Se escribe como variable CSS `--p` en el contenedor y se pasa a `Stage`. Los elementos HTML se animan desde `--p`; three no puede leer líneas de tiempo CSS.
- **`lib/stage.ts`:** ya tiene `setCut`, `setScale`, `setTurn` y render a pedido. Falta:
  - `setView(view, t)`: interpolar entre dos vistas de cámara.
  - Modo malla de alambre para el capítulo 1.
  - Barrido de color por capas (reusa los uniformes `uCut` / `uBand` con un segundo color).
- **Un solo lienzo:** el `Viewer` del hero y el de la secuencia son el mismo. Queda en un contenedor `sticky` que abarca hero y tramo.
- **Entradas simples:** seguir con `Reveal` y `data-reveal`. No migrar a `animation-timeline`: lo que hay funciona en todos los navegadores.
- **Transición tarjeta a producto:** `<ViewTransition name={...}>` de React en `ProductCard` y en el visor del producto. Según la guía de Next 16 funciona sin configuración. El par solo se forma si la página destino ya está precargada.
- **Imágenes de respaldo:** ampliar `scripts/render-assets.mjs` para generar una imagen por capítulo. Se usan con "reducir movimiento", sin WebGL y como primera imagen en celular.
- **Rendimiento:**
  - El 3D se carga después de que la página esté libre, como hoy.
  - Durante el scroll solo cambian uniformes y cámara; nada de geometría nueva.
  - El lienzo deja de dibujar cuando el tramo sale de pantalla.
- **Accesibilidad:** cada capítulo es un `<section>` con su título real. El contenido completo está en el HTML aunque el 3D no cargue. Foco visible en el indicador de pasos.

## Fases

Cada fase termina con `npx tsc --noEmit`, `npm test`, `npx next build` y una prueba en navegador (Edge sin ventana, como hace `scripts/render-assets.mjs`) en 1440 px y 390 px.

1. **Base.** Utilidad de progreso de scroll, `Stage.setView`, malla de alambre, variables de duración y curva en `globals.css`.
   Listo cuando: una página de prueba mueve corte y cámara con el scroll sin saltos.
2. **Home.** Hero nuevo, tramo fijo con 4 capítulos, indicador de pasos, imágenes de respaldo, versión celular.
   Listo cuando: se puede llegar a `/cotizar` desde cualquier punto del tramo; con "reducir movimiento" se ven los 4 bloques estáticos; no hay desborde horizontal en 390 px.
3. **Estructura.** Página `/mayoristas`, franja en el home, destacados, cierre, enlaces del menú, barra rápida.
   Listo cuando: el formulario mayorista funciona igual que hoy en su página nueva y el mensaje de WhatsApp no cambió.
4. **Catálogo y producto.** Transición tarjeta a producto, repintado por capas, latido del carrito.
   Listo cuando: ida y vuelta entre catálogo y producto se ve continua, y sin soporte del navegador navega normal.
5. **Cotizador.** Precio con dígitos que ruedan (también en producto y capítulo 2).
   Listo cuando: el precio final mostrado coincide siempre con el calculado; el lector de pantalla anuncia el valor final, no los intermedios.
6. **Cierre.** Medir en un celular de gama media, revisar teclado y lector de pantalla, actualizar `DESIGN.md`.

## Video real (opcional, fuera de las fases)

No hay material propio. Lo encontrado:

- **Pexels** (uso comercial gratis, sin atribución): candidatos a revisar a ojo, no pude ver el contenido.
  - https://www.pexels.com/video/high-precision-3d-printing-in-action-40911930/
  - https://www.pexels.com/video/close-up-of-3d-printer-operating-in-lab-30170055/
  - https://www.pexels.com/video/3d-printer-head-19378586/
  - https://www.pexels.com/video/time-lapse-of-3d-printing-4437652/
- **Mixkit** (gratis, licencia propia a confirmar): https://mixkit.co/free-stock-video/3d-printer/
- **Bambu Lab:** no encontré un kit de prensa con permiso de uso. Su material tiene derechos; no usarlo sin autorización.

Problema: ningún video de archivo muestra una A1 mini, y el sitio dice que se imprime con una. Recomendación: grabar 10 segundos propios con el celular (primer plano de la boquilla, fondo oscuro, cámara fija). Iría como fondo del cierre o del capítulo 3, con grano y muy oscurecido.
Mientras no haya video propio, el plan no depende de ninguno.

### Video generado con Veo

El dueño va a generar un clip con Gemini Veo. Uso previsto: fondo del cierre o del capítulo 3, sin sonido, en bucle, oscurecido y con grano.
Es una ilustración, no un registro del taller: no acompañarlo con textos como "nuestra impresora trabajando". Sin logos de Bambu Lab en el cuadro.

```text
Cinematic macro shot, 8 seconds, 16:9, no audio. A compact desktop FDM 3D printer in the style of a small open-frame "bed slinger": single cantilever arm, light grey and white body, dark textured build plate about 18 cm wide, no logos or text anywhere. The print head glides smoothly left and right, laying thin precise layers of matte light-grey filament on a half-finished geometric lattice sculpture. The only warm color in the frame is a faint orange glow at the nozzle tip. Dark studio, near-black background, one soft key light from above left, subtle rim light on the edges of the machine, shallow depth of field, slow dolly-in toward the nozzle. Monochrome cool grey palette, fine film grain, anamorphic bokeh, premium product-film look. Realistic motion and physics, no people, no hands, no text, no watermark.
```

## Definido en la ronda 2

1. **Pieza protagonista:** una pieza futurista nueva, solo para el home. Propuesta: "torre diagrid", un hiperboloide de nervios en doble hélice que se cruzan formando rombos, hueca y calada. Al imprimirse capa por capa se ve a través de ella.
   - Es un modelo procedural nuevo en `lib/models.ts`, junto a los existentes, con su test de que la malla cierra y entra en 180 mm.
   - No se agrega al catálogo.
   - Entra en la fase 1.
2. **Destacados:** los primeros 4 del catálogo.
3. **Video:** generado con Veo (prompt arriba). El plan sigue sin depender de él.
4. **Tramo fijo:** 4 pantallas, aprobado.
