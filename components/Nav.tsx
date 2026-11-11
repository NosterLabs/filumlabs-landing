'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mark } from './Brand';
import { CartButton } from './Cart';

const LINKS = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/#como-funciona', label: 'Cómo funciona' },
  { href: '/mayoristas', label: 'Mayoristas' },
  { href: '/#preguntas', label: 'Preguntas' },
];

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(false);

  // past the first screen the bar shrinks to a floating pill: Catálogo, Cotizar and the cart stay at hand
  useEffect(() => {
    const onScroll = () => {
      setScrolled(scrollY > 8);
      setCompact(scrollY > innerHeight * 0.7);
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="nav" data-scrolled={scrolled} data-compact={compact}>
      <div className="wrap nav-inner">
        <Link href="/" className="nav-brand" aria-label="FilumLabs, inicio">
          <Mark />
          <span>
            <b>Filum</b>Labs
          </span>
        </Link>
        <nav aria-label="Principal" className="nav-links-wrap">
          <ul className="nav-links">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={path === l.href ? 'page' : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-actions">
          <Link href="/cotizar" className="btn btn--sm nav-cta" aria-current={path === '/cotizar' ? 'page' : undefined}>
            Cotizar
          </Link>
          <CartButton />
          <button type="button" className="nav-cart nav-menu" aria-expanded={open} aria-controls="nav-sheet" onClick={() => setOpen((o) => !o)}>
            {open ? 'Cerrar' : 'Menú'}
          </button>
        </div>
      </div>
      <nav id="nav-sheet" className="nav-sheet" data-open={open} aria-label="Menú">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
        <Link href="/cotizar">Cotizar una pieza</Link>
      </nav>
    </header>
  );
}
