import { SHOP } from './config.ts';
import { HERO } from './hero.ts';
import type { Product } from './catalog.ts';

// Structured data (schema.org JSON-LD) for Google and for AI answers: who the shop is, where it
// delivers, what it sells and its FAQ, stated once here and read by every page.

export const abs = (path: string) => new URL(path, SHOP.site).toString();

// 5491173650421 → +54 9 11 7365-0421
export const phone = (n = SHOP.whatsapp) => `+${n.slice(0, 2)} ${n.slice(2, 3)} ${n.slice(3, 5)} ${n.slice(5, 9)}-${n.slice(9)}`;

const BUSINESS_ID = abs('/#negocio');

export function business() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': BUSINESS_ID,
    name: SHOP.name,
    alternateName: `${SHOP.name} by NosterLabs`,
    description: `Impresión 3D a pedido en ${SHOP.city}, ${SHOP.region}. Subís tu archivo STL, 3MF u OBJ y ves el precio al instante. Piezas en PLA y PETG con una Bambu Lab A1 mini, desde una unidad o por cantidad.`,
    url: SHOP.site,
    logo: abs('/icon.png'),
    image: abs(`/renders/hero-${HERO.slug}.webp`),
    telephone: phone(),
    priceRange: '$$',
    currenciesAccepted: 'ARS',
    paymentAccepted: 'Transferencia bancaria, Mercado Pago',
    // service-area business: the locality only, no street address
    address: { '@type': 'PostalAddress', addressLocality: SHOP.city, addressRegion: 'Buenos Aires', addressCountry: 'AR' },
    areaServed: SHOP.areas.map((name) => ({ '@type': 'City', name })),
    knowsAbout: ['Impresión 3D', 'Impresión 3D FDM', 'PLA', 'PETG', 'Archivos STL', 'Archivos 3MF', 'Prototipado'],
    makesOffer: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Impresión 3D a pedido desde tu archivo', description: 'Cotización al instante de archivos STL, 3MF u OBJ, en PLA o PETG.', url: abs('/cotizar') } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Impresión 3D por cantidad', description: 'Series, souvenirs, llaveros y regalos de empresa con presupuesto por WhatsApp.', url: abs('/mayoristas') } },
    ],
    parentOrganization: { '@type': 'Organization', name: 'NosterLabs' },
    ...(SHOP.profiles.length ? { sameAs: SHOP.profiles } : {}),
  };
}

export function website() {
  return { '@context': 'https://schema.org', '@type': 'WebSite', '@id': abs('/#sitio'), name: SHOP.name, url: SHOP.site, inLanguage: 'es-AR', publisher: { '@id': BUSINESS_ID } };
}

export function faqPage(items: [string, string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}

export function breadcrumbs(items: [string, string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
  };
}

// prices go out only once the catalogue is real: example prices must not reach Google or an AI answer
export function product(p: Product, image: string, prices: number[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: abs(image),
    brand: { '@type': 'Brand', name: SHOP.name },
    material: p.materials.join(', '),
    ...(SHOP.demoCatalog
      ? {}
      : {
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'ARS',
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
            availability: 'https://schema.org/MadeToOrder',
            seller: { '@id': BUSINESS_ID },
          },
        }),
  };
}
