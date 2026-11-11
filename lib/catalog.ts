import { buildModel, toZUp, type ModelId } from './models.ts';
import { meshStats, scaleStats } from './mesh.ts';
import { estimate, DEFAULT_SETTINGS, type PrintSettings } from './pricing.ts';
import { DEFAULT_PRINTER } from './printers.ts';
import { COLORS, colorOf, type ColorId, type MaterialId } from './config.ts';

// Sample catalogue (SHOP.demoCatalog): names, sizes and copy are placeholders for the real models.

export type Variant = { id: string; label: string; scale: number };

export type Product = {
  slug: string;
  name: string;
  category: 'Hogar' | 'Escritorio' | 'Organización' | 'FilumLabs';
  model: ModelId;
  description: string;
  pack: number; // pieces per unit sold
  materials: MaterialId[];
  colors: ColorId[];
  color: ColorId; // the colour it is shown in
  settings: Partial<PrintSettings>;
  variants: Variant[];
};

const ALL: ColorId[] = COLORS.map((c) => c.id);

export const PRODUCTS: Product[] = [
  {
    slug: 'florero-torsion',
    name: 'Florero torsión',
    category: 'Hogar',
    model: 'florero',
    description: 'Ocho nervios que giran mientras sube. Pared de 2 mm: para flores secas, o con un tubo de vidrio adentro para agua.',
    pack: 1,
    materials: ['PLA', 'PETG'],
    colors: ALL,
    color: 'arena-pastel',
    settings: { infill: 0.1, layerHeight: 0.16 },
    variants: [
      { id: 's', label: 'S', scale: 0.65 },
      { id: 'm', label: 'M', scale: 0.85 },
      { id: 'l', label: 'L', scale: 1 },
    ],
  },
  {
    slug: 'maceta-facetada',
    name: 'Maceta facetada',
    category: 'Hogar',
    model: 'maceta',
    description: 'Ocho caras que toman la luz distinto a cada hora. Piso de 3 mm, para usar con un plato aparte.',
    pack: 1,
    materials: ['PLA', 'PETG'],
    colors: ALL,
    color: 'blanco',
    settings: { infill: 0.1 },
    variants: [
      { id: 's', label: 'S', scale: 0.7 },
      { id: 'm', label: 'M', scale: 1 },
      { id: 'l', label: 'L', scale: 1.4 },
    ],
  },
  {
    slug: 'organizador-tres',
    name: 'Organizador de tres',
    category: 'Escritorio',
    model: 'organizador',
    description: 'Una bandeja grande y dos chicas para cables, llaves y lo que se junta en el escritorio. 14 × 9 cm.',
    pack: 1,
    materials: ['PLA', 'PETG'],
    colors: ALL,
    color: 'gris',
    settings: {},
    variants: [{ id: 'u', label: 'Único', scale: 1 }],
  },
  {
    slug: 'soporte-celular',
    name: 'Soporte de celular',
    category: 'Escritorio',
    model: 'soporte',
    description: 'Respaldo inclinado y tope delantero de 12 mm. Sirve con funda, en vertical u horizontal.',
    pack: 1,
    materials: ['PLA', 'PETG'],
    colors: ALL,
    color: 'azul',
    settings: { infill: 0.2 },
    variants: [{ id: 'u', label: 'Único', scale: 1 }],
  },
  {
    slug: 'lapicero-hexagonal',
    name: 'Lapicero hexagonal',
    category: 'Escritorio',
    model: 'lapicero',
    description: 'Seis caras planas que no ruedan. Entran lápices, tijera y regla de 15 cm.',
    pack: 1,
    materials: ['PLA'],
    colors: ALL,
    color: 'negro',
    settings: {},
    variants: [{ id: 'u', label: 'Único', scale: 1 }],
  },
  {
    slug: 'gancho-pared',
    name: 'Gancho de pared',
    category: 'Organización',
    model: 'gancho',
    description: 'Para camperas, bolsos y auriculares. Se atornilla o se pega con cinta doble faz. Pack de dos.',
    pack: 2,
    materials: ['PETG'],
    colors: ['negro', 'blanco', 'gris'],
    color: 'blanco',
    settings: { material: 'PETG', infill: 0.4, walls: 3 },
    variants: [{ id: 'u', label: 'Pack ×2', scale: 1 }],
  },
  {
    slug: 'clip-cables',
    name: 'Clip para cables',
    category: 'Organización',
    model: 'clip',
    description: 'Abraza cables de hasta 12 mm. Base plana para cinta doble faz. Pack de diez.',
    pack: 10,
    materials: ['PETG'],
    colors: ['negro', 'blanco', 'gris'],
    color: 'gris',
    settings: { material: 'PETG', infill: 0.3 },
    variants: [{ id: 'u', label: 'Pack ×10', scale: 1 }],
  },
  {
    slug: 'llavero-encastre',
    name: 'Llavero Encastre',
    category: 'FilumLabs',
    model: 'llavero',
    description: 'La marca en la mano: el encastre en relieve de 1,2 mm sobre una placa de 3 mm.',
    pack: 1,
    materials: ['PLA'],
    colors: ALL,
    color: 'negro',
    settings: { layerHeight: 0.12 },
    variants: [{ id: 'u', label: 'Único', scale: 1 }],
  },
];

export const CATEGORIES = ['Hogar', 'Escritorio', 'Organización', 'FilumLabs'] as const;

export function productSettings(p: Product, material?: MaterialId): PrintSettings {
  return { ...DEFAULT_SETTINGS, ...p.settings, ...(material ? { material } : {}) };
}

const cache = new Map<ModelId, ReturnType<typeof meshStats>>();

// stats of the model at scale 1, measured once; variants scale them
function modelStats(id: ModelId) {
  if (!cache.has(id)) cache.set(id, meshStats(toZUp(buildModel(id))));
  return cache.get(id)!;
}

export function quoteVariant(p: Product, v: Variant, material?: MaterialId) {
  const stats = scaleStats(modelStats(p.model), v.scale);
  return { stats, ...estimate(stats, productSettings(p, material), DEFAULT_PRINTER, p.pack) };
}

// any scale, for the how-it-works demo
export function quoteScaled(p: Product, scale: number) {
  const stats = scaleStats(modelStats(p.model), scale);
  return { stats, ...estimate(stats, productSettings(p), DEFAULT_PRINTER, p.pack) };
}

export const findProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

export const fromPrice = (p: Product) => Math.min(...p.variants.map((v) => quoteVariant(p, v).unitPrice));

export const renderSrc = (p: Product) => `/renders/${p.slug}.webp`;

export type CardData = {
  slug: string;
  name: string;
  category: Product['category'];
  href: string;
  image: string;
  price: number;
  sizes: number;
  materials: string;
  colors: string[];
};

export const cardData = (): CardData[] =>
  PRODUCTS.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    href: `/catalogo/${p.slug}`,
    image: renderSrc(p),
    price: fromPrice(p),
    sizes: p.variants.length,
    materials: p.materials.join(' o '),
    colors: p.colors.map((c) => colorOf(c).hex),
  }));
