import w from './Wholesale.module.css';

// What is left of a long field, shown only near its end. Also says when the whole message
// is too long for a WhatsApp link, which only happens with very accented text.
export default function Left({ used, max, fits = true }: { used: number; max: number; fits?: boolean }) {
  if (!fits)
    return (
      <p className={w.count} role="alert">
        El mensaje quedó muy largo para WhatsApp: acortalo un poco.
      </p>
    );
  if (used < max * 0.8) return null;
  return (
    <p className={`${w.count} num`} aria-live="polite">
      Te quedan {max - used} caracteres
    </p>
  );
}
