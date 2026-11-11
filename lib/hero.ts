import type { Product } from './catalog.ts';
import type { StageView } from './stage.ts';

// The home's protagonist: a piece made for the film on the home page. It is not in the catalogue.
export const HERO: Product = {
  slug: 'torre-diagrid',
  name: 'Torre diagrid',
  category: 'FilumLabs',
  model: 'torre',
  description: 'Dos familias de nervios rectos, giradas en sentidos opuestos, que juntas dibujan una torre hiperbólica.',
  pack: 1,
  materials: ['PLA'],
  colors: ['gris'],
  color: 'gris',
  settings: { infill: 0.15 },
  variants: [{ id: 'u', label: 'Única', scale: 1 }],
};

// chapter 2 grows the part to this scale; every view frames it at this size, so the growth shows
export const HERO_SCALE = 1.3;

// one camera per moment of the film: the hero, then the four chapters
export const FILM_VIEWS: StageView[] = [
  { azimuth: 32, elevation: 16, pad: 1.18, fit: HERO_SCALE },
  { azimuth: 58, elevation: 42, pad: 1.22, fit: HERO_SCALE },
  { azimuth: 18, elevation: 14, pad: 1.12, fit: HERO_SCALE },
  { azimuth: 40, elevation: 6, pad: 0.92, fit: HERO_SCALE },
  { azimuth: 74, elevation: 24, pad: 1.4, fit: HERO_SCALE },
];

export const heroPoster = '/renders/hero-torre-diagrid.webp';
// what each chapter shows, for reduced motion and browsers without WebGL
export const filmStill = (chapter: number) => `/renders/film-${chapter}.webp`;
