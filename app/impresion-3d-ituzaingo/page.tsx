import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { UploadButton } from '@/components/Upload';
import { PRICING, SHOP } from '@/lib/config';
import { money } from '@/lib/format';
import { abs, breadcrumbs, faqPage } from '@/lib/seo';
import { waLink } from '@/lib/whatsapp';
import c from '../catalogo/catalogo.module.css';
import s from './local.module.css';

// The page for local searches ("impresión 3D Ituzaingó", "... zona oeste", "... cerca de mí"):
// one honest page for the whole delivery area, not one thin page per town.

export const metadata: Metadata = {
  title: 'Impresión 3D en Ituzaingó y Zona Oeste · FilumLabs',
  description: 'Impresión 3D a pedido en Ituzaingó con entrega en Castelar, Morón, Haedo, Hurlingham y más. Cotizá tu STL online al instante, en PLA o PETG.',
  alternates: { canonical: '/impresion-3d-ituzaingo' },
};

const STEPS = [
  ['Cotizás online', 'Subís tu STL, 3MF u OBJ al cotizador y ves medidas, gramos, tiempo y precio. Si no tenés archivo, elegís un modelo del catálogo.'],
  ['Lo pedís por WhatsApp', 'El pedido llega con el detalle de cada pieza y adjuntás tu archivo en el chat. Antes de imprimir te confirmamos el precio final.'],
  ['Te lo entregamos', `Imprimimos en ${SHOP.city} y coordinamos la entrega con vos. No tenemos local a la calle.`],
];

const USES = ['Repuestos y piezas de reemplazo', 'Prototipos y piezas de prueba', 'Organizadores, soportes y accesorios', 'Macetas, floreros y decoración', 'Llaveros y souvenirs por cantidad', 'Regalos de empresa con tu logo'];

const LOCAL_FAQ: [string, string][] = [
  ['¿Dónde hacen impresión 3D en Ituzaingó?', `FilumLabs imprime en ${SHOP.city}, ${SHOP.region}. Cotizás online en filumlabs.com y coordinamos la entrega por WhatsApp.`],
  ['¿A qué localidades entregan?', `A ${SHOP.areas.join(', ')}. Si estás en otra localidad, consultanos por WhatsApp.`],
  ['¿Cuánto cuesta imprimir en 3D?', `Depende del filamento y del tiempo de impresión de tu pieza: el cotizador lo calcula con tu archivo. El mínimo es ${money(PRICING.minimumPerPiece)} por pieza y cada archivo propio suma ${money(PRICING.setupPerLine)} de preparación.`],
  ['¿Qué tan grande puede ser la pieza?', 'Hasta 18 × 18 × 18 cm, el volumen de la Bambu Lab A1 mini. Una pieza más grande muchas veces se puede dividir en partes.'],
  ['¿Puedo retirar la pieza?', 'Por ahora no hay local a la calle. La entrega se coordina por WhatsApp cuando confirmás el pedido.'],
];

export default function LocalPage() {
  return (
    <main id="main" className="wrap">
      <JsonLd data={faqPage(LOCAL_FAQ)} />
      <JsonLd data={breadcrumbs([['Inicio', '/'], [`Impresión 3D en ${SHOP.city}`, '/impresion-3d-ituzaingo']])} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: `Impresión 3D en ${SHOP.city} y Zona Oeste`,
          serviceType: 'Impresión 3D a pedido',
          provider: { '@id': abs('/#negocio') },
          areaServed: SHOP.areas.map((name) => ({ '@type': 'City', name })),
          url: abs('/impresion-3d-ituzaingo'),
        }}
      />

      <header className={c.head}>
        <h1 className={c.title}>Impresión 3D en Ituzaingó y Zona Oeste</h1>
        <p className={c.lede}>Imprimimos tus piezas en PLA y PETG en {SHOP.city} y te las entregamos en la zona. Cotizás online al instante, desde una unidad.</p>
      </header>

      <div className={s.actions}>
        <UploadButton />
        <a className="btn btn--ghost" href={waLink('Hola FilumLabs, quiero consultar por una impresión 3D.')} target="_blank" rel="noopener noreferrer">
          Escribir por WhatsApp
        </a>
      </div>

      <section className={s.section} aria-labelledby="como">
        <h2 id="como">Cómo pedir desde la zona</h2>
        <ol className={s.steps}>
          {STEPS.map(([t, d], i) => (
            <li key={t} data-reveal="rise" style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>
              <span className="num">0{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${s.section} ${s.split}`} aria-labelledby="zona">
        <div>
          <h2 id="zona">Dónde entregamos</h2>
          <p>Imprimimos en {SHOP.city} y entregamos en estas localidades de la Zona Oeste del Gran Buenos Aires.</p>
        </div>
        <ul className={s.areas}>
          {SHOP.areas.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>

      <section className={`${s.section} ${s.split}`} aria-labelledby="que">
        <div>
          <h2 id="que">Qué imprimimos</h2>
          <p>
            Piezas de hasta 18 × 18 × 18 cm en PLA, para interior y decoración, o PETG, para calor, sol y humedad. Si ya tenés el archivo, <Link href="/cotizar">cotizalo acá</Link>; si no, mirá el <Link href="/catalogo">catálogo</Link>. Para series y
            souvenirs, armá un <Link href="/mayoristas">pedido por cantidad</Link>.
          </p>
        </div>
        <ul className={s.uses}>
          {USES.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      </section>

      <section className={`${s.section} ${s.split}`} aria-labelledby="faq-local">
        <h2 id="faq-local">Preguntas de la zona</h2>
        <dl className={s.faq}>
          {LOCAL_FAQ.map(([q, a]) => (
            <div key={q}>
              <dt>{q}</dt>
              <dd>{a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
