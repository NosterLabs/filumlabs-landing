// Drawn for this site, one per data FilumLabs actually shows: size, filament, time, layers, price,
// and the steps of an order (file, adjust, chat, nozzle, box).
const PATHS = {
  size: 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5',
  spool: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0 2.5v2',
  clock: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4v4.5l3 2',
  layers: 'M4 8.5 12 4.5l8 4-8 4-8-4ZM4 12.5l8 4 8-4M4 16.5l8 4 8-4',
  tag: 'M3.5 12.5V4h8.5l8.5 8.5-8 8L3.5 12.5ZM7.8 7.8h.01',
  file: 'M7 3.5h6.5L18 8v12.5H7V3.5ZM13.5 3.5V8H18',
  adjust: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',
  chat: 'M4.5 5.5h15v10H10l-5.5 4V5.5Z',
  nozzle: 'M8 3.5h8v5.5H8V3.5ZM10 9h4l-1 4h-2l-1-4ZM12 13v2M6 20.5h12',
  box: 'M4 8l8-4 8 4v8.5l-8 4-8-4V8Zm0 0 8 4 8-4M12 12v8.5',
  chevron: 'M7 10l5 5 5-5',
  center:'M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM12 3v3M12 18v3M3 12h3M18 12h3',
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {/* 1.5 matches the regular-weight labels the icons sit beside */}
      <path d={PATHS[name]} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
