import type { SymbolId } from '../game/types';

export const colors = {
  night: '#0c2440',
  deep: '#123a63',
  panel: '#fff8e7',
  panelEdge: '#e2c48a',
  wood: '#8a5a2b',
  woodDark: '#5e3b19',
  gold: '#ffc93c',
  goldDark: '#d99a00',
  text: '#2b1d0e',
  textLight: '#fff8e7',
  muted: '#8c7a62',
  danger: '#e5484d',
  storm: '#7c5cff',
  stormDark: '#4b33c9',
  green: '#3fb950',
  greenDark: '#238636',
  shadow: 'rgba(0,0,0,0.35)',
};

export const SYMBOL_EMOJI: Record<SymbolId, string> = {
  coin: '🪙',
  bag: '💰',
  anchor: '⚓',
  cannon: '💣',
  map: '🗺️',
  storm: '🌪️',
  energy: '⚡',
};

export const ALL_SYMBOLS = Object.keys(SYMBOL_EMOJI) as SymbolId[];
