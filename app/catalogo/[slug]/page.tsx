import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PRODUCTS, findProduct, quoteVariant, renderSrc } from '@/lib/catalog';
import { SHOP } from '@/lib/config';
import ProductBuy from '@/components/ProductBuy';
import JsonLd from '@/components/JsonLd';
import { breadcrumbs, product } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = findProduct((await params).slug);
  if (!p) return { title: 'Página no encontrada · FilumLabs' }; // the not-found page's title
  return {
    title: `${p.name} en impresión 3D · FilumLabs`,
    description: `${p.description} En ${p.materials.join(' o ')}, con entrega en Ituzaingó y Zona Oeste.`,
    alternates: { canonical: `/catalogo/${p.slug}` },
    openGraph: { images: [{ url: renderSrc(p), width: 1200, height: 1500, alt: `Render 3D de ${p.name}` }] },
  };
}

export default async function ProductPage({ params }: Props) {
  const p = findProduct((await params).slug);
  if (!p) notFound();
  // prices per variant and material, from the same estimator as the quoter
  const quotes = Object.fromEntries(
    p.variants.flatMap((v) =>
      p.materials.map((m) => {
        const q = quoteVariant(p, v, m);
        return [`${v.id}:${m}`, { unitPrice: q.unitPrice, grams: q.grams * p.pack, seconds: q.seconds * p.pack, layers: q.layers, size: q.stats.size }];
      }),
    ),
  );
  return (
    <main id="main">
      <JsonLd data={product(p, renderSrc(p), p.variants.map((v) => quoteVariant(p, v).unitPrice))} />
      <JsonLd data={breadcrumbs([['Catálogo', '/catalogo'], [p.name, `/catalogo/${p.slug}`]])} />
      <nav aria-label="Ruta" className="wrap" style={{ paddingTop: 16, fontSize: 14, color: 'var(--ink-3)' }}>
        <Link href="/catalogo">Catálogo</Link> / {p.name}
      </nav>
      <ProductBuy product={p} quotes={quotes} poster={renderSrc(p)} demo={SHOP.demoCatalog} />
    </main>
  );
}
