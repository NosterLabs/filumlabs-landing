import type { Metadata } from 'next';
import Link from 'next/link';
import s from './not-found.module.css';

export const metadata: Metadata = { title: 'Página no encontrada · FilumLabs' };

// Any unknown address, and a catalogue product that does not exist: a print that stopped halfway,
// the outline of what never got printed above the hot nozzle.
export default function NotFound() {
  return (
    <main id="main" className={`wrap ${s.page}`}>
      <div className={s.print} aria-hidden="true">
        <span className={s.ghost}>404</span>
        <span className={s.printed}>404</span>
        <i className={s.nozzle} />
      </div>
      <div className={s.copy}>
        <p className={s.eyebrow}>Error 404</p>
        <h1>Esta página no se terminó de imprimir.</h1>
        <p className={s.lede}>El link puede estar mal escrito, o la página ya no existe. Seguí por acá:</p>
        <div className={s.actions}>
          <Link href="/cotizar" className="btn">
            Cotizar un archivo
          </Link>
          <Link href="/catalogo" className="btn btn--ghost">
            Ver el catálogo
          </Link>
        </div>
        <Link href="/" className="link">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
