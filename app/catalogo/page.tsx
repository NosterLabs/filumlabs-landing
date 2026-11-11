import type { Metadata } from 'next';
import CatalogGrid from '@/components/catalog/CatalogGrid';
import { UploadButton } from '@/components/Upload';
import { CATEGORIES, cardData } from '@/lib/catalog';
import { SHOP } from '@/lib/config';
import s from './catalogo.module.css';

export const metadata: Metadata = {
  title: 'Catálogo de piezas impresas en 3D · FilumLabs',
  description: 'Modelos listos para imprimir en PLA y PETG: macetas, floreros, organizadores y accesorios, con precio por unidad. Entregas en Ituzaingó y Zona Oeste.',
  alternates: { canonical: '/catalogo' },
};

export default function CatalogoPage() {
  return (
    <main id="main" className="wrap">
      <header className={s.head}>
        <h1 className={s.title}>Catálogo</h1>
        <p className={s.lede}>Modelos listos para imprimir en PLA y PETG. Elegís tamaño, material y color, y lo sumás al pedido.</p>
      </header>
      <CatalogGrid items={cardData()} categories={CATEGORIES} demo={SHOP.demoCatalog} />
      <section className={s.custom} aria-labelledby="a-medida">
        <div>
          <h2 id="a-medida">¿No está lo que buscás?</h2>
          <p>Subí tu propio modelo y en segundos ves medidas, gramos, tiempo y precio.</p>
        </div>
        <UploadButton />
      </section>
    </main>
  );
}
