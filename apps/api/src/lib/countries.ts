import type { CountrySummary } from '../types/api.js';

export const countries: CountrySummary[] = [
  { code: 'NO', name: 'Norway', enabled: true, sourceStatus: 'pilot' },
  { code: 'GB', name: 'United Kingdom', enabled: true, sourceStatus: 'pilot' },
  { code: 'DK', name: 'Denmark', enabled: false, sourceStatus: 'planned' },
  { code: 'FI', name: 'Finland', enabled: false, sourceStatus: 'planned' }
];
