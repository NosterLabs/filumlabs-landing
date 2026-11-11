import { MATERIALS, PRICING, type MaterialId } from './config.ts';
import type { MeshStats } from './mesh.ts';
import type { Printer } from './printers.ts';

export type PrintSettings = {
  material: MaterialId;
  infill: number; // 0.05 – 1
  layerHeight: number; // mm
  walls: number;
};

export const DEFAULT_SETTINGS: PrintSettings = { material: 'PLA', infill: 0.15, layerHeight: 0.2, walls: 2 };

export type Estimate = {
  grams: number;
  seconds: number;
  layers: number;
  unitPrice: number;
  fits: boolean;
};

// shortcut: shell = surface × wall thickness, no real slicing; upgrade to a server-side OrcaSlicer/Bambu Studio CLI for exact grams and time.
// pack: pieces sold together; the minimum price applies to the pack, not to each piece
export function estimate(stats: MeshStats, s: PrintSettings, printer: Printer, pack = 1): Estimate {
  const shell = Math.min(stats.volume, stats.area * s.walls * printer.lineWidth);
  const plastic = shell + (stats.volume - shell) * s.infill; // mm³
  const grams = (plastic / 1000) * MATERIALS[s.material].density;
  const flow = printer.lineWidth * s.layerHeight * printer.speed; // mm³/s
  const layers = Math.max(1, Math.ceil(stats.size[2] / s.layerHeight));
  const seconds = plastic / flow + layers * printer.layerOverheadS + printer.warmupS;
  const fits = stats.size.every((v, i) => v <= printer.volume[i]);
  return { grams, seconds, layers, unitPrice: priceOf(printCost(grams, seconds, s.material), pack), fits };
}

// cost of a print run: filament + electricity + machine wear, before the margin
export function printCost(grams: number, seconds: number, material: MaterialId) {
  const m = MATERIALS[material];
  const hours = seconds / 3600;
  const wearPerHour = (PRICING.printerPrice * PRICING.wearMarkup) / PRICING.printerLifeHours;
  const filament = (grams / 1000) * m.pricePerKg;
  const power = (PRICING.printerWatts / 1000) * hours * PRICING.kwhPrice * (1 + m.extraPower);
  const wear = hours * wearPerHour * (1 + m.extraWear);
  return filament + power + wear;
}

const priceOf = (cost: number, pack = 1) => Math.max(PRICING.minimumPerPiece, roundPrice(cost * PRICING.margin * pack));

// a file with several plates is one piece printed in several runs: grams and time add up, the minimum applies once
export function combine(runs: Estimate[], material: MaterialId): Estimate {
  if (runs.length === 1) return runs[0];
  const grams = runs.reduce((n, r) => n + r.grams, 0);
  const seconds = runs.reduce((n, r) => n + r.seconds, 0);
  return { grams, seconds, layers: Math.max(...runs.map((r) => r.layers)), unitPrice: priceOf(printCost(grams, seconds, material)), fits: runs.every((r) => r.fits) };
}

export function tierFor(qty: number, tiers = PRICING.tiers) {
  return [...tiers].sort((a, b) => b.min - a.min).find((t) => qty >= t.min) ?? null;
}

export function lineTotal(unitPrice: number, qty: number, withSetup: boolean, tiers = PRICING.tiers) {
  const off = tierFor(qty, tiers)?.off ?? 0;
  return roundPrice(unitPrice * qty * (1 - off) + (withSetup ? PRICING.setupPerLine : 0));
}

// prices end in hundreds: $12.300, not $12.287
export function roundPrice(n: number) {
  return Math.ceil(n / 100) * 100;
}
