const ars = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export const money = (n: number) => ars.format(n);

export const grams = (g: number) => `${g < 10 ? g.toFixed(1).replace('.', ',') : Math.round(g)} g`;

export function duration(seconds: number) {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} h ${String(m % 60).padStart(2, '0')} min`;
}

const and = new Intl.ListFormat('es', { type: 'conjunction' });

export const list = (items: (string | number)[]) => and.format(items.map(String)); // "1, 2 y 4"

export const mm = (v: number) => `${Math.round(v)}`;

export const size = (s: [number, number, number]) => `${mm(s[0])} × ${mm(s[1])} × ${mm(s[2])} mm`;
