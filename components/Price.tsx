import { money } from '@/lib/format';
import s from './Price.module.css';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// A price whose digits roll to the new value, like a counter. Screen readers get the plain figure.
export default function Price({ value, className = '' }: { value: number; className?: string }) {
  const text = money(value);
  const chars = [...text];
  return (
    <span className={`num ${className}`}>
      <span className="sr-only">{text}</span>
      <span className={s.roll} aria-hidden="true">
        {chars.map((ch, i) => {
          // keyed from the right: the units column stays the units column when the price gains a digit
          const key = chars.length - i;
          if (!/\d/.test(ch)) return <span key={`c${key}`}>{ch}</span>;
          return (
            <span key={`d${key}`} className={s.col}>
              <span style={{ transform: `translateY(${-Number(ch) * 10}%)` }}>
                {DIGITS.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
