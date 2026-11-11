import type { MetadataRoute } from 'next';
import { PRODUCTS } from '@/lib/catalog';
import { abs } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [
    ['/', 1],
    ['/cotizar', 0.9],
    ['/impresion-3d-ituzaingo', 0.9],
    ['/catalogo', 0.8],
    ['/mayoristas', 0.7],
    ['/terminos', 0.2],
  ];
  return [
    ...pages.map(([path, priority]) => ({ url: abs(path), changeFrequency: 'monthly' as const, priority })),
    ...PRODUCTS.map((p) => ({ url: abs(`/catalogo/${p.slug}`), changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}
