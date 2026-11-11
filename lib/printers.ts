import type { MaterialId } from './config.ts';

export type Printer = {
  id: string;
  name: string;
  volume: [number, number, number]; // x, y, z in mm
  nozzle: number;
  lineWidth: number;
  speed: number; // average effective speed, mm/s, including walls and travel
  layerOverheadS: number; // z-hop, wipe and travel per layer
  warmupS: number;
  layerHeights: number[];
  materials: MaterialId[];
  available: boolean;
};

export const PRINTERS: Printer[] = [
  {
    id: 'a1-mini',
    name: 'Bambu Lab A1 mini',
    volume: [180, 180, 180],
    nozzle: 0.4,
    lineWidth: 0.42,
    speed: 95,
    layerOverheadS: 3,
    warmupS: 300,
    layerHeights: [0.08, 0.12, 0.16, 0.2, 0.24, 0.28],
    materials: ['PLA', 'PETG'],
    available: true,
  },
  {
    id: 'a1',
    name: 'Bambu Lab A1',
    volume: [256, 256, 256],
    nozzle: 0.4,
    lineWidth: 0.42,
    speed: 100,
    layerOverheadS: 3,
    warmupS: 300,
    layerHeights: [0.08, 0.12, 0.16, 0.2, 0.24, 0.28],
    materials: ['PLA', 'PETG'],
    available: false,
  },
  {
    id: 'p1s',
    name: 'Bambu Lab P1S',
    volume: [256, 256, 256],
    nozzle: 0.4,
    lineWidth: 0.42,
    speed: 120,
    layerOverheadS: 2,
    warmupS: 240,
    layerHeights: [0.08, 0.12, 0.16, 0.2, 0.24, 0.28],
    materials: ['PLA', 'PETG'],
    available: false,
  },
];

export const DEFAULT_PRINTER = PRINTERS[0];
