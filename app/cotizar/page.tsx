import type { Metadata } from 'next';
import Quoter from '@/components/Quoter';

export const metadata: Metadata = {
  title: 'Cotizador de impresión 3D online: subí tu STL · FilumLabs',
  description: 'Subí tu STL, 3MF u OBJ, ajustá escala, material y relleno, y sabé el precio de tu impresión 3D al instante. Entregas en Ituzaingó y Zona Oeste.',
  alternates: { canonical: '/cotizar' },
};

export default function CotizarPage() {
  return (
    <main id="main">
      <Quoter />
    </main>
  );
}
