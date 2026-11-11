import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Urbanist } from 'next/font/google';
import { CartProvider } from '@/components/Cart';
import { Mark, NosterLabs } from '@/components/Brand';
import Nav from '@/components/Nav';
import Reveal from '@/components/Reveal';
import EndShot from '@/components/EndShot';
import FooterMark from '@/components/FooterMark';
import JsonLd from '@/components/JsonLd';
import { business, website } from '@/lib/seo';
import { DropArea, UploadButton } from '@/components/Upload';
import { SHOP } from '@/lib/config';
import { WA_PENDING } from '@/lib/whatsapp';
import './globals.css';

// Urbanist: geometric with open, rounded strokes, the same drawing as the Encastre mark
const urbanist = Urbanist({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-urbanist' });

export const metadata: Metadata = {
  metadataBase: new URL(SHOP.site),
  title: 'Impresión 3D en Ituzaingó · Cotizá tu STL al instante | FilumLabs',
  description: 'Impresión 3D a pedido en Ituzaingó, Zona Oeste. Subí tu STL, 3MF u OBJ y sabé el precio al instante. PLA y PETG, desde una unidad o por cantidad.',
  openGraph: { type: 'website', locale: 'es_AR', siteName: 'FilumLabs' },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = { themeColor: '#0d1115' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={urbanist.variable} suppressHydrationWarning>
      <head>
        {/* lets CSS hide entrance-animated blocks only when script will reveal them */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <JsonLd data={business()} />
        <JsonLd data={website()} />
        <a className="skip" href="#main">Ir al contenido</a>
        <CartProvider>
          <Nav />
          {children}
          <footer className="footer wrap">
            <DropArea className="footer-drop" label="Cotizar un archivo">
              <EndShot />
              <h2 data-reveal="layers">¿Tenés el archivo listo?</h2>
              <p>Soltalo acá o elegilo, y en segundos ves medidas, gramos, tiempo y precio.</p>
              <UploadButton />
            </DropArea>
            <div className="footer-grid">
              <div className="footer-brand">
                <Link href="/" className="nav-brand" aria-label="FilumLabs, inicio">
                  <Mark />
                  <span>
                    <b>Filum</b>Labs
                  </span>
                </Link>
                <span className="footer-by">
                  by <NosterLabs />
                </span>
                <p className="footer-pitch">Impresión 3D a pedido en Ituzaingó. Del archivo a la pieza, con el precio antes de empezar.</p>
                {WA_PENDING ? (
                  <span className="wa-note">WhatsApp: número pendiente</span>
                ) : (
                  <a className="btn btn--ghost btn--sm" href={`https://wa.me/${SHOP.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    Escribinos por WhatsApp
                  </a>
                )}
              </div>
              <nav className="footer-cols" aria-label="Pie de página">
                <div>
                  <h3>Imprimir</h3>
                  <ul>
                    <li><Link href="/cotizar">Cotizar un archivo</Link></li>
                    <li><Link href="/catalogo">Catálogo</Link></li>
                    <li><Link href="/mayoristas">Mayoristas</Link></li>
                  </ul>
                </div>
                <div>
                  <h3>FilumLabs</h3>
                  <ul>
                    <li><Link href="/#como-funciona">Cómo funciona</Link></li>
                    <li><Link href="/#preguntas">Preguntas</Link></li>
                    <li><Link href="/#contacto">Consultas</Link></li>
                    <li><a href="#main">Volver arriba</a></li>
                  </ul>
                </div>
                <div>
                  <h3>Entregas</h3>
                  <p className="footer-areas">{SHOP.areas.join(' · ')}</p>
                  <Link href="/impresion-3d-ituzaingo">Ituzaingó y Zona Oeste</Link>
                </div>
              </nav>
            </div>
            <div className="footer-legal">
              <span>© 2026 FilumLabs. Impresión 3D en Ituzaingó, Zona Oeste del Gran Buenos Aires.</span>
              <span>Tus archivos se procesan en tu navegador y no se guardan en ningún servidor.</span>
              <span className="footer-terms">
                <Link href="/terminos">Términos y condiciones</Link>
                <Link href="/terminos#privacidad">Privacidad</Link>
              </span>
            </div>
            <FooterMark />
          </footer>
        </CartProvider>
        <Reveal />
      </body>
    </html>
  );
}
