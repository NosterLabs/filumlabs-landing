# FilumLabs · Estrategia de marketing para Ituzaingó y Zona Oeste

Noviembre 2026. Objetivo: que quien busque impresión 3D en Ituzaingó y alrededores encuentre FilumLabs en Google, en Google Maps y en las respuestas de las IA (ChatGPT, resúmenes de Gemini en Google, Perplexity), y que llegue al cotizador.

## Resumen

- Hay búsquedas reales con el nombre de la zona: Google autocompleta "impresión 3d ituzaingo", "... moron", "... castelar", "... haedo" y "... zona oeste".
- La competencia local casi no tiene sitio web: vive en Instagram y Facebook, y nadie ofrece cotización online al instante. Una página bien armada para la zona tiene lugar libre en Google.
- La palanca más grande no está en el sitio: es el **Perfil de Empresa de Google** con reseñas. Es lo que alimenta Google Maps, "cerca de mí" y buena parte de lo que responde Gemini.
- El sitio ya quedó preparado (sección "Qué se hizo en el sitio"). Lo que falta depende del dueño (sección "Plan de 90 días").

## Palabras clave

Fuente: sugerencias de Google para Argentina (consultadas el 11/11/2026). Que Google autocomplete una búsqueda indica que la gente la hace, pero no dice cuántas veces. Para volúmenes reales: Google Keyword Planner (gratis con una cuenta de Google Ads) y, a los 2 o 3 meses de publicado el sitio, Google Search Console.

| Búsqueda | Qué quiere quien busca | Evidencia | Página que la atiende | Prioridad |
| --- | --- | --- | --- | --- |
| impresión 3D Ituzaingó | Un servicio en su localidad | Autocompleta; además aparece como sugerencia de "impresión 3d cerca" | `/impresion-3d-ituzaingo` + Perfil de Google | Alta |
| impresión 3D zona oeste | Un servicio cerca, sin localidad exacta | Autocompleta | `/impresion-3d-ituzaingo` | Alta |
| impresión 3D Morón / Castelar / Haedo | Igual, en localidades vecinas | Autocompletan | `/impresion-3d-ituzaingo` (zonas de entrega) + áreas del Perfil de Google | Alta |
| impresión 3D Hurlingham / Merlo | Igual | Autocompletan, con menos señal | Igual | Media |
| impresión 3D cerca de mí | Lo más cercano en el mapa | Autocompleta | Perfil de Google (Maps), no el sitio | Alta |
| cotizar impresión 3D online / imprimir en 3D online / imprimir STL online / dónde imprimir STL | Saber el precio de su archivo | Autocompletan | `/cotizar` | Alta |
| impresión 3D precios / precio por gramo / precio por hora | Entender cuánto cuesta | Autocompletan | `/cotizar` + guía de precios (pendiente) | Media |
| impresión 3D personalizada | Una pieza a medida | Autocompleta | Home | Media |
| llaveros 3D personalizados / por mayor / egresados / día de la madre / día del maestro | Souvenirs por cantidad, con fecha | Autocompletan | `/mayoristas` | Media, estacional |
| impresión 3D resina / metal | Otra tecnología | Autocompletan | Ninguna: FilumLabs imprime FDM en PLA y PETG | No apuntar |
| curso impresión 3D zona oeste / Morón | Aprender | Autocompletan | Ninguna: no es el negocio | No apuntar |

Cómo usarlas:
- Una sola página para toda la zona (`/impresion-3d-ituzaingo`), no una por localidad. Páginas casi iguales para cada localidad Google las trata como relleno y pueden perjudicar al sitio entero.
- Los nombres de las localidades van donde son verdad: la lista de zonas de entrega, el Perfil de Google y las preguntas frecuentes.

## Competencia

Relevada en buscadores el 11/11/2026. Los datos de seguidores vienen de resultados de búsqueda y pueden estar desactualizados: verificar cada perfil antes de decidir.

| Quién | Dónde | Qué hace | Presencia | Qué significa para FilumLabs |
| --- | --- | --- | --- | --- |
| Erme3D Studio | Morón y CABA | Figuras impresas y pintadas, envíos al país | Instagram, unos 7.100 seguidores | La cuenta más fuerte de la zona, pero de figuras: otro producto |
| Diseños en 3D | Merlo | Objetos por pedido, gráfica y cartelería | Instagram, unos 3.500 seguidores | Competidor directo en piezas a pedido; sin cotizador |
| OEST3D | Morón | Autopartes Peugeot y Citroën | Instagram chico, web en construcción | Nicho distinto |
| Ec.impresion3d | Morón | Filamento y resina | Facebook | Competidor directo; presencia débil |
| Morón 3D | Morón | PLA y ABS | Facebook, pocos seguidores | Competidor directo; presencia débil |
| BYTEC Academy | Castelar | Cursos de impresión 3D y venta de insumos | Web e Instagram | Ocupa búsquedas de "curso"; posible aliado para derivar trabajos |
| El Mundo del PC | Merlo | Venta de impresoras Bambu Lab y filamentos | Web | No compite: vende máquinas. Posible aliado |
| Eze3d | Palermo, CABA | Presupuesto manual por archivo, PLA y PETG | Web y clasificados | El modelo más parecido, pero sin precio instantáneo y lejos |
| Trideo3d, Labor 3D, Kuttercraft | CABA | Industrial, diseño, repuestos | Web y directorios | Apuntan a empresas; no a la zona |
| Vendedores de Mercado Libre | Todo el país | Piezas y servicios de impresión | Mercado Libre | Compiten por precio; FilumLabs compite por rapidez y cercanía |

Ventajas para comunicar siempre, porque nadie más las tiene juntas:
1. Precio al instante con tu archivo, sin esperar presupuesto.
2. Entrega en la zona, coordinada por WhatsApp.
3. Desde una unidad, y también por cantidad.

## Qué se hizo en el sitio

SEO técnico y local:
- Dominio `https://filumlabs.com` en `lib/config.ts` (`SHOP.site`), junto con la localidad, la región y las 9 localidades de entrega (`SHOP.areas`). Todo lo demás se genera desde ahí.
- Títulos y descripciones de cada página con la búsqueda que atienden. Cada página indica su URL canónica.
- `/sitemap.xml` con todas las páginas y productos, y `/robots.txt` que deja entrar a todos, incluidos los rastreadores de IA.
- Página nueva `/impresion-3d-ituzaingo`: cómo pedir desde la zona, dónde se entrega, qué se imprime y preguntas de la zona. Está enlazada desde el pie de todas las páginas.
- La zona aparece en el texto del hero, en el pie de página y en una pregunta frecuente nueva sobre entregas.
- Imagen para compartir en redes y buscadores (`app/opengraph-image.png`), tomada del hero real.

Datos estructurados (schema.org en JSON-LD, lo que leen Google y las IA para entender el negocio sin adivinar):
- En todas las páginas: `LocalBusiness`, como negocio con zona de cobertura, sin dirección publicada, con teléfono, zonas, medios de pago y servicios. También `WebSite`.
- Home: `FAQPage` con las preguntas frecuentes.
- Página local: `Service`, `FAQPage` y `BreadcrumbList`.
- Productos: `Product` y `BreadcrumbList`. Los precios **no** se publican mientras `SHOP.demoCatalog` sea `true`, para que ningún precio de ejemplo termine en Google o en una respuesta de IA.

Para las IA:
- `/llms.txt`: el negocio resumido en una página para asistentes de IA. Incluye qué hace, dónde, máquina, materiales, cómo se calcula el precio, privacidad, pago y contacto. Se genera desde la configuración, así que nunca contradice al sitio.
- Las respuestas de las preguntas frecuentes y de la página local dan datos concretos: medidas máximas, mínimo por pieza, materiales, zonas. Es el formato que las IA citan.

## Fuera del sitio: lo que más mueve

### 1. Perfil de Empresa de Google (la prioridad)
- Crearlo en business.google.com como **negocio de zona de cobertura**: sin dirección visible, con las 9 localidades de `SHOP.areas` como áreas.
- Categoría principal: "Servicio de impresión 3D". Secundarias, si existen en el listado: "Servicio de diseño 3D", "Tienda de regalos personalizados".
- Mismo nombre, teléfono y web que el sitio, siempre: "FilumLabs", +54 9 11 7365-0421, filumlabs.com.
- Fotos reales: la impresora trabajando, piezas terminadas, el empaque. Mínimo 10 al abrir y 2 por mes después.
- Cargar los productos del catálogo y los dos servicios (a pedido y por cantidad).
- Una publicación por semana: una pieza hecha, una fecha especial o una oferta para la zona.
- Google suele pedir verificación por video: tenerlo listo mostrando la impresora y algo con el nombre del negocio.

### 2. Reseñas
- Pedir reseña después de cada entrega, con el enlace directo del Perfil en el mismo chat de WhatsApp.
- Meta: 10 reseñas en los primeros 60 días y 30 al cabo de 6 meses.
- Responder todas, mencionando qué se imprimió y la localidad ("Gracias, Laura: el repuesto de la persiana quedó perfecto. Saludos a Castelar.").
- Gemini y Google Maps leen esas reseñas cuando alguien pregunta "¿dónde imprimo en 3D en Ituzaingó?".

### 3. Bing y Apple (ChatGPT busca con Bing)
- Bing Webmaster Tools: importar el sitio desde Search Console y enviar el sitemap. La búsqueda de ChatGPT usa el índice de Bing.
- Bing Places for Business: mismo alta que en Google, en 10 minutos importando el Perfil de Google.
- Apple Business Connect: para Mapas de Apple y Siri.

### 4. Redes y menciones
- Crear Instagram y Facebook con el mismo nombre (sugerido: @filumlabs) y agregarlos a `SHOP.profiles` en `lib/config.ts`. Así pasan a los datos estructurados y Google y las IA conectan las cuentas con el sitio.
- Contenido para Instagram: videos de 10 segundos de impresión en timelapse, antes y después (archivo y pieza), y el cotizador en uso.
- Grupos de Facebook de vecinos de Ituzaingó, Castelar y Morón: presentarse una vez con una pieza real, y responder cuando alguien pide "¿alguien que imprima en 3D?". No publicar avisos repetidos.
- Directorios: 3Dnatives (directorio de servicios de impresión 3D) y Servidos.ar. Mismo nombre, teléfono y web.
- Alianzas: BYTEC Academy (Castelar) y El Mundo del PC (Merlo) atienden a gente que pregunta por servicios de impresión. Ofrecerles derivación.

## Visibilidad en las IA: cómo medirla

Una vez por mes, en una ventana privada, hacer estas preguntas en ChatGPT (con búsqueda), en Gemini y en Google, y anotar si aparece FilumLabs y qué dice:
1. ¿Dónde puedo imprimir en 3D en Ituzaingó?
2. Servicio de impresión 3D en Zona Oeste, Buenos Aires
3. ¿Cuánto cuesta imprimir una pieza en 3D en Buenos Aires?
4. ¿Dónde imprimo un archivo STL cerca de Morón?
5. Llaveros impresos en 3D por cantidad en Castelar

Si una IA dice algo equivocado del negocio, corregirlo en la fuente que usa: el Perfil de Google, el sitio o `llms.txt`.

## Contenido por escribir (no está en el sitio todavía)

Cuatro guías, una por mes. Responden búsquedas de la tabla de palabras clave y son el tipo de texto que las IA citan:
1. **Cuánto cuesta imprimir en 3D en Argentina:** la fórmula del cotizador (filamento, energía, desgaste y margen), con ejemplos reales.
2. **PLA o PETG: cuál elegir:** con casos de la zona (piezas al sol, cocina, repuestos).
3. **Cómo preparar tu archivo STL para imprimir:** escala, unidades, tamaño máximo.
4. **Souvenirs y llaveros impresos en 3D por cantidad:** con las fechas fuertes. Día del Padre en junio, Día del Maestro en septiembre, Día de la Madre en octubre, egresados y fin de año en noviembre y diciembre. Publicarla 6 a 8 semanas antes de cada fecha.

## Plan de 90 días

| Cuándo | Qué | Quién |
| --- | --- | --- |
| Semana 1 | Publicar el sitio en filumlabs.com. Alta en Google Search Console y Bing Webmaster Tools, y enviar el sitemap | Dueño |
| Semana 1 | Crear el Perfil de Empresa de Google y empezar la verificación | Dueño |
| Semana 2 | Instagram y Facebook; agregarlos a `SHOP.profiles` | Dueño, con ayuda para el código |
| Semana 2 | Bing Places y Apple Business Connect | Dueño |
| Semanas 2 a 4 | Primeras 10 fotos y primeras reseñas de clientes conocidos | Dueño |
| Mes 2 | Catálogo real (`SHOP.demoCatalog: false`): los precios pasan a los datos estructurados | Dueño, con ayuda para el código |
| Mes 2 | Guía 1, de precios | Por escribir |
| Mes 2 | Presentación en grupos de vecinos y en directorios | Dueño |
| Mes 3 | Guía 2 y primera medición en IA con las 5 preguntas | Por escribir / dueño |
| Mes 3 | Revisar en Search Console qué búsquedas traen visitas y ajustar títulos | Con ayuda |

Medición mínima:
- Search Console: búsquedas, clics y posición media de las páginas principales.
- Perfil de Google: llamadas, clics a la web y pedidos de ruta.
- WhatsApp: preguntar "¿cómo nos conociste?" en cada pedido nuevo.

## Pendiente del dueño

- Publicar el sitio en filumlabs.com. El dominio ya está configurado en `lib/config.ts`.
- Crear el Perfil de Google, las redes sociales y las altas en Bing y Apple.
- Confirmar las localidades de entrega en `SHOP.areas` y agregar o quitar las que correspondan.
- Fotos reales del trabajo.
