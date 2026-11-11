// Business settings. Prices are samples in ARS until the owner sets real ones.

export const SHOP = {
  name: 'FilumLabs',
  // WhatsApp number: country code, no +, no spaces. NosterLabs' line for now (+54 9 11 7365-0421).
  // If emptied, every WhatsApp button opens the chat picker and the UI says the number is pending.
  whatsapp: '5491173650421',
  // the catalogue and its prices are examples; set false when the real ones are loaded
  demoCatalog: true,
  // canonical address of the site: sitemap, canonical URLs, structured data for Google and AI answers
  site: 'https://filumlabs.com',
  // a service-area business: no street address is published, these are the places it delivers to
  city: 'Ituzaingó',
  region: 'Zona Oeste del Gran Buenos Aires',
  areas: ['Ituzaingó', 'Villa Udaondo', 'Parque Leloir', 'Castelar', 'Morón', 'Haedo', 'Hurlingham', 'San Antonio de Padua', 'Merlo'],
  // public profiles, for the structured data's sameAs; empty until they exist
  profiles: [] as string[],
};

export type MaterialId = 'PLA' | 'PETG';

// pricePerKg: filament, ARS per kg. extraPower / extraWear: what the material adds over PLA
// to electricity and machine wear (calculadora3d: PETG +15 % power, +30 % wear).
export const MATERIALS: Record<MaterialId, { label: string; density: number; pricePerKg: number; extraPower: number; extraWear: number; note: string }> = {
  PLA: { label: 'PLA', density: 1.24, pricePerKg: 25000, extraPower: 0, extraWear: 0, note: 'Rígido y con buen detalle. Para uso en interior.' },
  PETG: { label: 'PETG', density: 1.27, pricePerKg: 32000, extraPower: 0.15, extraWear: 0.3, note: 'Aguanta más calor, golpes y humedad.' },
};

// Hellbot Ecofila (LOCK V2 spool), the PLA colours from hellbot.com.ar. Hellbot publishes no hex codes:
// these are close to the spool, for the swatch and the 3D view. Delete a line to stop offering a colour.
export const COLORS = [
  { id: 'blanco', label: 'Blanco', hex: '#e9ecee', line: 'Clásicos' },
  { id: 'blanco-intenso', label: 'Blanco intenso', hex: '#f7f8f8', line: 'Clásicos' },
  { id: 'hueso', label: 'Hueso', hex: '#e6dcc5', line: 'Clásicos' },
  { id: 'piel', label: 'Piel', hex: '#e8bf9c', line: 'Clásicos' },
  { id: 'amarillo', label: 'Amarillo', hex: '#f2c418', line: 'Clásicos' },
  { id: 'naranja', label: 'Naranja', hex: '#ee6a1f', line: 'Clásicos' },
  { id: 'rojo', label: 'Rojo', hex: '#c8222b', line: 'Clásicos' },
  { id: 'fucsia', label: 'Fucsia', hex: '#d42a83', line: 'Clásicos' },
  { id: 'rosa', label: 'Rosa', hex: '#ef8fb4', line: 'Clásicos' },
  { id: 'violeta', label: 'Violeta', hex: '#6a3d9a', line: 'Clásicos' },
  { id: 'cobalto', label: 'Cobalto', hex: '#1f3f9a', line: 'Clásicos' },
  { id: 'azul', label: 'Azul', hex: '#2156b0', line: 'Clásicos' },
  { id: 'celeste', label: 'Celeste', hex: '#3f9ddd', line: 'Clásicos' },
  { id: 'aqua', label: 'Aqua', hex: '#18a7a8', line: 'Clásicos' },
  { id: 'verde-claro', label: 'Verde claro', hex: '#7cc242', line: 'Clásicos' },
  { id: 'verde', label: 'Verde', hex: '#1f8a4c', line: 'Clásicos' },
  { id: 'capibara', label: 'Marrón claro (Capibara)', hex: '#a37b58', line: 'Clásicos' },
  { id: 'marron', label: 'Marrón', hex: '#6b4430', line: 'Clásicos' },
  { id: 'marmol', label: 'Mármol', hex: '#c9c7c2', line: 'Clásicos' },
  { id: 'gris', label: 'Gris', hex: '#8a939b', line: 'Clásicos' },
  { id: 'gris-grafito', label: 'Gris grafito', hex: '#43494f', line: 'Clásicos' },
  { id: 'negro', label: 'Negro', hex: '#1b1f23', line: 'Clásicos' },
  { id: 'vainilla-pastel', label: 'Vainilla pastel', hex: '#f3e3a6', line: 'Pastel' },
  { id: 'arena-pastel', label: 'Arena pastel', hex: '#cdbd9e', line: 'Pastel' },
  { id: 'rosa-pastel', label: 'Rosa pastel', hex: '#f2c3cf', line: 'Pastel' },
  { id: 'lavanda-pastel', label: 'Lavanda pastel', hex: '#c9b6e2', line: 'Pastel' },
  { id: 'indigo-pastel', label: 'Índigo pastel', hex: '#9aa3d8', line: 'Pastel' },
  { id: 'celeste-pastel', label: 'Celeste pastel', hex: '#a9d3ee', line: 'Pastel' },
  { id: 'aqua-pastel', label: 'Aqua pastel', hex: '#a5ddd6', line: 'Pastel' },
  { id: 'menta-pastel', label: 'Menta pastel', hex: '#b4e3c3', line: 'Pastel' },
  { id: 'kiwi-pastel', label: 'Kiwi pastel', hex: '#cde39a', line: 'Pastel' },
  { id: 'natural-cristal', label: 'Natural cristal', hex: '#dfe3dc', line: 'Traslúcidos' },
  { id: 'diamante', label: 'Diamante traslúcido', hex: '#d6e6ee', line: 'Traslúcidos' },
  { id: 'rubi', label: 'Rubí traslúcido', hex: '#a3132b', line: 'Traslúcidos' },
  { id: 'esmeralda', label: 'Esmeralda traslúcido', hex: '#0f8a5a', line: 'Traslúcidos' },
  { id: 'zafiro', label: 'Zafiro traslúcido', hex: '#1d4c9c', line: 'Traslúcidos' },
  { id: 'amarillo-fluo', label: 'Amarillo fluo', hex: '#e4f222', line: 'Fluo UV' },
  { id: 'naranja-fluo', label: 'Naranja fluo', hex: '#ff6a2a', line: 'Fluo UV' },
  { id: 'verde-fluo', label: 'Verde fluo', hex: '#5cf03a', line: 'Fluo UV' },
  { id: 'dorado', label: 'Dorado', hex: '#c9a14a', line: 'Metalizados' },
  { id: 'plateado', label: 'Plateado', hex: '#b8bdc2', line: 'Metalizados' },
  { id: 'bronce', label: 'Bronce', hex: '#a66a3a', line: 'Metalizados' },
] as const;

export type ColorId = (typeof COLORS)[number]['id'];

// Ecofila PETG LOCK V2 comes in fewer colours than the PLA
const PETG_COLORS: ColorId[] = ['blanco', 'amarillo', 'naranja', 'rojo', 'rosa', 'violeta', 'azul', 'celeste', 'verde', 'marron', 'marmol', 'gris', 'gris-grafito', 'negro', 'natural-cristal', 'plateado'];

export const colorsFor = (m: MaterialId): ColorId[] => COLORS.map((c) => c.id).filter((id) => m !== 'PETG' || PETG_COLORS.includes(id));

export const colorOf = (id: ColorId) => COLORS.find((c) => c.id === id)!;

// Same rule as calculadora3d.com.ar: (filament + electricity + machine wear) × margin.
export const PRICING = {
  kwhPrice: 200, // electricity, ARS per kWh
  printerWatts: 100, // A1 mini average draw
  // machine wear per hour = printerPrice × wearMarkup ÷ printerLifeHours ($ 232 / h with these)
  printerPrice: 580000,
  wearMarkup: 1.2,
  printerLifeHours: 3000,
  margin: 4, // x4, "Standard" on calculadora3d
  setupPerLine: 1500, // file check and slicing, once per custom part
  minimumPerPiece: 2500,
  // quantity discounts, { min, off }: none for now, wholesale is quoted by WhatsApp
  tiers: [] as { min: number; off: number }[],
};
