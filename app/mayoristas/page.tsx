import type { Metadata } from 'next';
import Wholesale, { type WholesaleItem } from '@/components/home/Wholesale';
import { PRODUCTS, quoteVariant } from '@/lib/catalog';
import { SHOP } from '@/lib/config';
import s from '../catalogo/catalogo.module.css';

export const metadata: Metadata = {
  title: 'Impresión 3D por mayor: souvenirs, llaveros y series · FilumLabs',
  description: 'Impresión 3D por cantidad en Ituzaingó y Zona Oeste: series de una misma pieza, llaveros, souvenirs y regalos de empresa. Presupuesto por WhatsApp.',
  alternates: { canonical: '/mayoristas' },
};

function wholesaleItems(): WholesaleItem[] {
  return PRODUCTS.map((p) => ({
    slug: p.slug,
    name: p.name,
    variants: p.variants.map((v) => ({ id: v.id, label: v.label, price: quoteVariant(p, v).unitPrice })),
    colors: p.colors,
  }));
}

export default function MayoristasPage() {
  return (
    <main id="main" className="wrap">
      <header className={s.head}>
        <h1 className={s.title}>Pedidos por cantidad</h1>
        <p className={s.lede}>Para tiendas, regalos de empresa o series de una misma pieza. Armá el pedido acá y te pasamos el presupuesto por WhatsApp.</p>
      </header>
      <Wholesale items={wholesaleItems()} demo={SHOP.demoCatalog} />
    </main>
  );
}
