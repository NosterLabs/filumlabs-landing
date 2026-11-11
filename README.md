# FilumLabs · Landing & Cotizador 3D

> Plataforma web y cotizador online instantáneo de impresión 3D de precisión para **FilumLabs** (by NosterLabs), especializada en tecnología FDM (PLA y PETG) con base en Ituzaingó y Zona Oeste, Buenos Aires.

---

## ✨ Características

- **🎬 Experiencia 3D Interactiva:** Escenario cinemático desarrollado en **Three.js** con visualización reactiva al scroll (*"Del archivo a la pieza"*).
- **⏱️ Cotizador Online Instantáneo:** Análisis geométrico de modelos en tiempo real directo en el cliente (cálculo de volumen, masa en gramos, tiempo de máquina y costo estimado para archivos `.stl` y `.3mf`).
- **📦 Catálogo Interactivo:** Galería de productos prediseñados con visualizador 3D en vivo por capas, selección de colores y variantes de tamaño.
- **💬 Pedidos Directos por WhatsApp:** Carrito interactivo que genera el mensaje estructurado para coordinar el pedido y pago sin intermediarios.
- **🏭 Canal Mayorista:** Cotización ágil para pedidos por volumen y piezas corporativas con vista previa del mensaje de compra.
- **🚀 SEO Local & GEO (AI Search):** Optimización específica para búsquedas locales en Zona Oeste (`/impresion-3d-ituzaingo`), esquema semántico `JSON-LD`, metadatos OpenGraph y endpoint `/llms.txt`.

---

## 🛠️ Stack Tecnológico

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router, Turbopack)
- **UI & Lenguaje:** [React](https://react.dev/) 19 · [TypeScript](https://www.typescriptlang.org/)
- **Renderizado 3D:** [Three.js](https://threejs.org/)
- **Estilos:** CSS Modules puros, variables CSS nativas, estética dark glassmorphism (vidrio esmerilado con tipografías *Urbanist* e *IBM Plex Mono*)
- **Testing:** Node.js native test runner con type-stripping

---

## 🚀 Inicio Rápido

### Requisitos previos

- **Node.js** v22+
- **pnpm** o **npm**

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/NosterLabs/filumlabs-landing.git
   cd filumlabs-landing
   ```

2. Instala las dependencias:
   ```bash
   pnpm install
   # o
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   # o
   npm run dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📜 Scripts Disponibles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Inicia el entorno de desarrollo con Next.js (Turbopack). |
| `npm run build` | Compila y optimiza la aplicación para producción. |
| `npm run start` | Inicia el servidor de producción. |
| `npm run test` | Ejecuta la suite de pruebas unitarias nativas (`lib/*.test.ts`). |
| `npm run renders` | Genera los renders estáticos WebP de los productos del catálogo mediante Edge/Chrome headless. |

---

## 📂 Estructura del Proyecto

```text
filumlabs-landing/
├── app/                           # Rutas y páginas de Next.js App Router
│   ├── catalogo/                  # Catálogo general y detalle dinámico [slug]
│   ├── cotizar/                   # Herramienta de cotización online de piezas STL/3MF
│   ├── impresion-3d-ituzaingo/    # Landing optimizada para SEO local Zona Oeste
│   ├── mayoristas/                # Flujo y formulario para pedidos por mayor
│   ├── llms.txt/                  # Endpoint descriptivo para indexación en LLMs
│   └── render/                    # Vista de desarrollo para exportación de assets
├── brand/                         # Identidad visual, tipografías, logos y assets de marca
├── components/                    # Componentes modulares de UI y 3D
│   ├── catalog/                   # Grilla y tarjetas interactivas de producto
│   ├── dev/                       # Utilidades de renderizado en desarrollo
│   └── home/                      # Secciones de la landing principal (Hero, Film, Faq, Wholesale)
├── lib/                           # Utilidades de cálculo, cotizador, Three.js stage y tests
├── public/                        # Archivos estáticos, videos y renders WebP
└── scripts/                       # Scripts de automatización (render-assets.mjs)
```

---

## 📄 Licencia

Desarrollado para **FilumLabs** por [NosterLabs](https://github.com/NosterLabs). Todos los derechos reservados.

