// Registry of painted (PNG) art. Anything listed here replaces the built-in
// vector placeholder; anything missing falls back to the vector version.
//
// To add art: drop the cut-out PNG in assets/art/… (see docs/ART_ASSETS.md and
// scripts/cutout.py) and add one line below. Metro needs literal require() paths.
//
// NOTE: assets/art/preview/* were made on Scenario's free plan — evaluation
// only. They must be regenerated on a paid plan before any public release.

import type { ImageSourcePropType } from 'react-native';

import type { SymbolId, TileKind } from '../game/types';

export const SYMBOL_IMAGES: Partial<Record<SymbolId, ImageSourcePropType>> = {
  coin: require('../../assets/art/preview/coin.png'),
  storm: require('../../assets/art/preview/storm.png'),
};

/** Weather clouds on the sky board. */
export const TILE_IMAGES: Partial<Record<TileKind, ImageSourcePropType>> = {
  sun: require('../../assets/art/preview/tile_sun.png'),
  bolt: require('../../assets/art/preview/tile_bolt.png'),
  rain: require('../../assets/art/preview/tile_rain.png'),
  storm: require('../../assets/art/preview/tile_storm.png'),
  // wind: waiting for a better render (the first one looked like tentacles)
};

/**
 * Building art per island theme and building type (0 hut, 1 cottage,
 * 2 windmill, 3 lighthouse, 4 castle). Index the array by level-1; when a
 * level is missing the closest lower (or any) level is used.
 */
export const BUILDING_IMAGES: Record<string, Partial<Record<number, (ImageSourcePropType | undefined)[]>>> = {
  tropic: {
    0: [require('../../assets/art/preview/hut.png')],
    4: [undefined, undefined, require('../../assets/art/preview/castle.png')],
  },
};

export interface IslandImage {
  source: ImageSourcePropType;
  /** Pixel size of the source image. */
  width: number;
  height: number;
  /** Colours of the sea at the image edges, used to blend into the screen. */
  seaTop: string;
  seaBottom: string;
  /** Building base points (bottom centre) in image pixels, by building type. */
  plots: { x: number; y: number; w: number }[];
}

export const ISLAND_IMAGES: Record<string, IslandImage> = {
  tropic: {
    source: require('../../assets/art/preview/island_tropic.jpg'),
    width: 1104,
    height: 832,
    seaTop: '#3363a0',
    seaBottom: '#095c7f',
    plots: [
      { x: 372, y: 478, w: 300 }, // hut — left clearing
      { x: 550, y: 345, w: 290 }, // cottage — top clearing
      { x: 540, y: 610, w: 290 }, // windmill — bottom clearing
      { x: 880, y: 560, w: 220 }, // lighthouse — east beach
      { x: 730, y: 478, w: 330 }, // castle — right clearing
    ],
  },
};

export const LOGO_IMAGE: ImageSourcePropType = require('../../assets/art/preview/logo.png');

export const CAPTAIN_IMAGE: ImageSourcePropType = require('../../assets/art/preview/captain.png');

export function buildingImage(themeKey: string, type: number, level: number): ImageSourcePropType | undefined {
  const levels = BUILDING_IMAGES[themeKey]?.[type];
  if (!levels || level <= 0) return undefined;
  for (let l = Math.min(level, levels.length) - 1; l >= 0; l--) if (levels[l]) return levels[l];
  return levels.find(Boolean);
}
