import type { Metadata } from 'next';
import Link from 'next/link';
import Hero from '@/components/home/Hero';
import Faq from '@/components/home/Faq';
import Contact from '@/components/home/Contact';
import Library from '@/components/home/Library';
import ProductCard from '@/components/catalog/ProductCard';
import Typed from '@/components/Typed';
import { PRODUCTS, cardData } from '@/lib/catalog';
import { SHOP } from '@/lib/config';
import JsonLd from '@/components/JsonLd';
import { FAQ } from '@/components/home/Faq';
import { faqPage } from '@/lib/seo';
import c from '@/components/catalog/Catalog.module.css';
import s from './home.module.css';

// title and description come from the layout; each page names its own canonical URL
export const metadata: Metadata = { alternates: { canonical: '/' } };

// what a wholesale request looks like when it reaches WhatsApp, in the form's own wording
const WHOLESALE_SAMPLE = 'Hola FilumLabs, quiero un presupuesto por cantidad:\n• 50 × Llavero Encastre, color negro\nLo necesito para: fin de mes';

export default function Home() {
  const featured = cardData().slice(0, 4);
  return (
    <main id="main">
      <JsonLd data={faqPage(FAQ)} />
      <Hero />

      <section id="destacados" className={`wrap ${s.section}`} aria-labelledby="destacados-title">
        <div className={s.head}>
          <h2 id="destacados-title" data-reveal="rise">
            Listos para imprimir
          </h2>
          <p data-reveal="rise" style={{ '--d': '100ms' } as React.CSSProperties}>
            Elegís tamaño, material y color, y lo sumás al pedido. Si no está lo que buscás, <Link href="/cotizar">cotizás tu propio archivo</Link>.
          </p>
        </div>
        <div className={c.gridWrap} data-reveal="stagger">
          <div className={c.grid}>
            {featured.map((p, i) => (
              <ProductCard key={p.slug} p={p} index={i} />
            ))}
          </div>
        </div>
        <div className={s.more}>
          <Link href="/catalogo" className="btn btn--ghost">
            Ver los {PRODUCTS.length} modelos
          </Link>
          {SHOP.demoCatalog && <span className={s.note}>Catálogo, colores y precios de ejemplo.</span>}
        </div>
      </section>

      <section id="mayoristas" className={`wrap ${s.section}`} aria-labelledby="mayoristas-title">
        <div className={s.wholesale}>
          <div className={s.wholesaleCopy}>
            <h2 id="mayoristas-title" data-reveal="rise">
              Pedidos por cantidad
            </h2>
            <p data-reveal="rise" style={{ '--d': '100ms' } as React.CSSProperties}>
              Para tiendas, regalos de empresa o series de una misma pieza. Armás el pedido en un minuto y te pasamos el presupuesto por WhatsApp.
            </p>
            <Link href="/mayoristas" className="btn" data-reveal="rise" style={{ '--d': '180ms' } as React.CSSProperties}>
              Armar un pedido por cantidad
            </Link>
          </div>
          <div className={s.chat}>
            <Typed text={WHOLESALE_SAMPLE} className={s.msg} />
          </div>
        </div>
      </section>

      <section id="disenos" className={`wrap ${s.section}`} aria-labelledby="disenos-title">
        <Library />
      </section>

      <section id="preguntas" className={`wrap ${s.section} ${s.faq}`} aria-labelledby="preguntas-title">
        <h2 id="preguntas-title" data-reveal="rise">
          Antes de pedir
        </h2>
        <Faq />
      </section>

      <section id="contacto" className={`wrap ${s.section}`} aria-labelledby="contacto-title">
        <Contact />
      </section>
    </main>
  );
}
