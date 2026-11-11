import { notFound } from 'next/navigation';
import RenderAssets from '@/components/dev/RenderAssets';

// Development only: draws the catalogue and hero images that scripts/render-assets.mjs saves to public/renders.
export default function RenderPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <RenderAssets />;
}
