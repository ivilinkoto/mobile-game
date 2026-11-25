// Visual theme per island. Buildings share shapes across islands but are
// re-coloured per theme so every island feels different.

export type DecorKind = 'palm' | 'pine' | 'rock' | 'coral' | 'cloud';

export interface IslandTheme {
  key: string;
  skyTop: string;
  skyBottom: string;
  seaTop: string;
  seaBottom: string;
  shallow: string;
  foam: string;
  sand: string;
  sandDark: string;
  grass: string;
  grassDark: string;
  grassLight: string;
  wall: string;
  wallDark: string;
  roof: string;
  roofDark: string;
  trim: string;
  flag: string;
  decor: DecorKind[];
  /** Extra landmark drawn behind the buildings. */
  landmark: 'none' | 'volcano' | 'iceberg' | 'rainbow' | 'ruins';
}

export const THEMES: Record<string, IslandTheme> = {
  tropic: {
    key: 'tropic',
    skyTop: '#5fd0ff',
    skyBottom: '#c8f1ff',
    seaTop: '#25b7d9',
    seaBottom: '#0b6fa8',
    shallow: '#6fe4e4',
    foam: '#e9fdff',
    sand: '#f7d98f',
    sandDark: '#e0b25f',
    grass: '#79cf47',
    grassDark: '#4c9f2e',
    grassLight: '#a8e56d',
    wall: '#f4e2c0',
    wallDark: '#cfae7b',
    roof: '#d9643a',
    roofDark: '#a8432a',
    trim: '#8a5a2b',
    flag: '#ff4d5e',
    decor: ['palm', 'palm', 'rock', 'palm'],
    landmark: 'none',
  },
  glacier: {
    key: 'glacier',
    skyTop: '#8fc3f2',
    skyBottom: '#e6f4ff',
    seaTop: '#4c94c9',
    seaBottom: '#1d4f82',
    shallow: '#a9dcf3',
    foam: '#ffffff',
    sand: '#d4e6f2',
    sandDark: '#a6c4da',
    grass: '#f7fbff',
    grassDark: '#c5dcec',
    grassLight: '#ffffff',
    wall: '#9c6b43',
    wallDark: '#704a2c',
    roof: '#3f6fa8',
    roofDark: '#28507f',
    trim: '#e9f5ff',
    flag: '#2ec4b6',
    decor: ['pine', 'pine', 'rock', 'pine'],
    landmark: 'iceberg',
  },
  volcano: {
    key: 'volcano',
    skyTop: '#ff9a62',
    skyBottom: '#ffd9a8',
    seaTop: '#2f6b7a',
    seaBottom: '#173843',
    shallow: '#58a1a8',
    foam: '#d6f2f0',
    sand: '#6b5a52',
    sandDark: '#4a3c36',
    grass: '#8a7466',
    grassDark: '#5f4d43',
    grassLight: '#a88f7e',
    wall: '#5b4b47',
    wallDark: '#3a2f2c',
    roof: '#e2552c',
    roofDark: '#a8361a',
    trim: '#ffb02e',
    flag: '#ffcf33',
    decor: ['rock', 'rock', 'rock'],
    landmark: 'volcano',
  },
  sunken: {
    key: 'sunken',
    skyTop: '#1d7fb0',
    skyBottom: '#56c2e0',
    seaTop: '#13628f',
    seaBottom: '#062a4a',
    shallow: '#2f8fb5',
    foam: '#a6ecff',
    sand: '#e4cf95',
    sandDark: '#b89d5d',
    grass: '#ff8d7a',
    grassDark: '#d4604f',
    grassLight: '#ffb3a3',
    wall: '#e7dcc6',
    wallDark: '#b8a888',
    roof: '#2ab3a6',
    roofDark: '#1a7d74',
    trim: '#ffd166',
    flag: '#ff5fa2',
    decor: ['coral', 'coral', 'rock', 'coral'],
    landmark: 'ruins',
  },
  sky: {
    key: 'sky',
    skyTop: '#7f9cff',
    skyBottom: '#f8d8ff',
    seaTop: '#c3d5ff',
    seaBottom: '#8aa6f5',
    shallow: '#e8efff',
    foam: '#ffffff',
    sand: '#ffffff',
    sandDark: '#d5dcf5',
    grass: '#a1e37c',
    grassDark: '#6fb84f',
    grassLight: '#c8f5a6',
    wall: '#fff6e0',
    wallDark: '#d9c9a5',
    roof: '#9b6bff',
    roofDark: '#6c43cc',
    trim: '#ffcc33',
    flag: '#ff6fb5',
    decor: ['cloud', 'palm', 'cloud'],
    landmark: 'rainbow',
  },
};

export function themeFor(key: string): IslandTheme {
  return THEMES[key] ?? THEMES.tropic;
}
