// Translations: Bulgarian, English, Russian. The device language is used by
// default; the player can switch in Settings (the choice is remembered).

import AsyncStorage from '@react-native-async-storage/async-storage';

const bg = {
  islandNames: {
    tropic: 'Тропически остров',
    glacier: 'Ледников остров',
    volcano: 'Вулканичен остров',
    sunken: 'Потънал град',
    sky: 'Небесен остров',
  } as Record<string, string>,
  islandN: (n: number) => `Остров ${n}`,
  buildingNames: ['Колиба', 'Къща', 'Мелница', 'Фар', 'Крепост'],
  spinsLabel: 'Енергия',
  settings: {
    title: 'Настройки',
    sfx: 'Звукови ефекти',
    music: 'Музика',
    language: 'Език',
    on: 'Вкл.',
    off: 'Изкл.',
  },
  meters: { sails: 'Платна', cannons: 'Оръдия', rain: 'Дъжд' },
  chainHint: 'Плъзни пръст през 3+ еднакви облака',
  stormTap: (n: number) => `Бури: ${n} · докосни облака, за да удариш`,
  stormDanger: 'Още една буря и тя ще удари теб!',
  chainResult: {
    raidReady: 'Платната са пълни!',
    attackReady: 'Оръдията са заредени!',
    stormSpawned: 'Буреносен облак!',
  },
  nextSpinIn: (t: string) => `+1 след ${t}`,
  spinsFull: 'Пълно',
  build: 'Строй',
  news: 'Новини',
  buildTitle: 'Строителство',
  maxed: 'Готово',
  upgrade: 'Строй',
  repair: 'Поправи',
  damaged: 'Повредена',
  storm: 'Буря',
  stormHint: 'Нова буря = x2. Четири наведнъж удрят теб!',
  stormChoose: 'Накъде да пратиш бурята?',
  stormIgnoresShields: 'Бурята пробива щитовете',
  attackTitle: 'Оръдия! Избери цел',
  attackPickBuilding: 'Избери сграда за обстрел',
  revenge: 'Отмъщение',
  blocked: 'Щитът спря изстрела!',
  hit: 'Попадение!',
  raidTitle: (name: string) => `Съкровището на ${name}`,
  raidHint: (n: number) => `Копай на ${n} места`,
  collect: 'Събери',
  result: {
    shield: '+1 щит',
    backfire: 'Бурята се обърна срещу теб!',
  },
  islandComplete: 'Островът е възстановен!',
  islandCompleteBody: (n: number) => `+${n} енергия. Отплаваме към следващия остров!`,
  sail: 'Отплавай',
  log: {
    incomingAttack: (name: string, blocked: boolean) =>
      blocked ? `${name} стреля по теб, но щитът издържа.` : `${name} повреди сграда на острова ти!`,
    incomingRaid: (name: string, c: string) => `${name} открадна ${c} от съкровището ти.`,
    attack: (name: string, c: string, blocked: boolean) =>
      blocked ? `Атакува ${name}, но удари щит (+${c}).` : `Обстреля острова на ${name} (+${c}).`,
    raid: (name: string, c: string) => `Ограби съкровището на ${name} (+${c}).`,
    storm: (name: string, c: string, p: number) => `Буря сила ${p} удари ${name} (+${c}).`,
    backfire: 'Бурята се обърна и удари твоя остров.',
    islandComplete: (n: number) => `Остров ${n} е възстановен!`,
  },
  noNews: 'Тихо е в морето… засега.',
};

export type Strings = typeof bg;

const en: Strings = {
  islandNames: {
    tropic: 'Tropic Isle',
    glacier: 'Glacier Isle',
    volcano: 'Volcano Isle',
    sunken: 'Sunken City',
    sky: 'Sky Isle',
  },
  islandN: (n) => `Island ${n}`,
  buildingNames: ['Hut', 'Cottage', 'Windmill', 'Lighthouse', 'Castle'],
  spinsLabel: 'Energy',
  settings: { title: 'Settings', sfx: 'Sound effects', music: 'Music', language: 'Language', on: 'On', off: 'Off' },
  meters: { sails: 'Sails', cannons: 'Cannons', rain: 'Rain' },
  chainHint: 'Drag through 3+ matching clouds',
  stormTap: (n) => `Storms: ${n} · tap a storm to strike`,
  stormDanger: 'One more storm and it hits you!',
  chainResult: {
    raidReady: 'Sails are full!',
    attackReady: 'Cannons loaded!',
    stormSpawned: 'Storm cloud!',
  },
  nextSpinIn: (t) => `+1 in ${t}`,
  spinsFull: 'Full',
  build: 'Build',
  news: 'News',
  buildTitle: 'Build',
  maxed: 'Done',
  upgrade: 'Build',
  repair: 'Repair',
  damaged: 'Damaged',
  storm: 'Storm',
  stormHint: 'Each storm = x2. Four at once hit you!',
  stormChoose: 'Where to send the storm?',
  stormIgnoresShields: 'Storms break through shields',
  attackTitle: 'Cannons! Pick a target',
  attackPickBuilding: 'Pick a building to fire at',
  revenge: 'Revenge',
  blocked: 'A shield stopped the shot!',
  hit: 'Direct hit!',
  raidTitle: (name) => `${name}'s treasure`,
  raidHint: (n) => `Dig in ${n} spots`,
  collect: 'Collect',
  result: {
    shield: '+1 shield',
    backfire: 'The storm turned on you!',
  },
  islandComplete: 'Island restored!',
  islandCompleteBody: (n) => `+${n} energy. Set sail for the next island!`,
  sail: 'Set sail',
  log: {
    incomingAttack: (name, blocked) =>
      blocked ? `${name} fired at you, but your shield held.` : `${name} damaged a building on your island!`,
    incomingRaid: (name, c) => `${name} stole ${c} from your treasure.`,
    attack: (name, c, blocked) => (blocked ? `Attacked ${name} but hit a shield (+${c}).` : `Shelled ${name}'s island (+${c}).`),
    raid: (name, c) => `Raided ${name}'s treasure (+${c}).`,
    storm: (name, c, p) => `A power ${p} storm hit ${name} (+${c}).`,
    backfire: 'The storm turned back and hit your island.',
    islandComplete: (n) => `Island ${n} restored!`,
  },
  noNews: 'The sea is quiet… for now.',
};

const ru: Strings = {
  islandNames: {
    tropic: 'Тропический остров',
    glacier: 'Ледяной остров',
    volcano: 'Вулканический остров',
    sunken: 'Затонувший город',
    sky: 'Небесный остров',
  },
  islandN: (n) => `Остров ${n}`,
  buildingNames: ['Хижина', 'Дом', 'Мельница', 'Маяк', 'Крепость'],
  spinsLabel: 'Энергия',
  settings: { title: 'Настройки', sfx: 'Звуковые эффекты', music: 'Музыка', language: 'Язык', on: 'Вкл.', off: 'Выкл.' },
  meters: { sails: 'Паруса', cannons: 'Пушки', rain: 'Дождь' },
  chainHint: 'Проведи пальцем по 3+ одинаковым облакам',
  stormTap: (n) => `Бури: ${n} · коснись облака, чтобы ударить`,
  stormDanger: 'Ещё одна буря — и она ударит по тебе!',
  chainResult: {
    raidReady: 'Паруса наполнены!',
    attackReady: 'Пушки заряжены!',
    stormSpawned: 'Грозовая туча!',
  },
  nextSpinIn: (t) => `+1 через ${t}`,
  spinsFull: 'Полно',
  build: 'Строить',
  news: 'Новости',
  buildTitle: 'Строительство',
  maxed: 'Готово',
  upgrade: 'Строить',
  repair: 'Починить',
  damaged: 'Повреждено',
  storm: 'Буря',
  stormHint: 'Каждая буря = x2. Четыре сразу ударят по тебе!',
  stormChoose: 'Куда отправить бурю?',
  stormIgnoresShields: 'Буря пробивает щиты',
  attackTitle: 'Пушки! Выбери цель',
  attackPickBuilding: 'Выбери здание для обстрела',
  revenge: 'Месть',
  blocked: 'Щит остановил выстрел!',
  hit: 'Попадание!',
  raidTitle: (name) => `Сокровище: ${name}`,
  raidHint: (n) => `Копай в ${n} местах`,
  collect: 'Забрать',
  result: {
    shield: '+1 щит',
    backfire: 'Буря обернулась против тебя!',
  },
  islandComplete: 'Остров восстановлен!',
  islandCompleteBody: (n) => `+${n} энергии. Отплываем к следующему острову!`,
  sail: 'Отплыть',
  log: {
    incomingAttack: (name, blocked) =>
      blocked ? `${name} стрелял по тебе, но щит выдержал.` : `${name} повредил здание на твоём острове!`,
    incomingRaid: (name, c) => `${name} украл ${c} из твоего сокровища.`,
    attack: (name, c, blocked) => (blocked ? `Атаковал ${name}, но попал в щит (+${c}).` : `Обстрелял остров ${name} (+${c}).`),
    raid: (name, c) => `Ограбил сокровище ${name} (+${c}).`,
    storm: (name, c, p) => `Буря силы ${p} ударила по ${name} (+${c}).`,
    backfire: 'Буря развернулась и ударила по твоему острову.',
    islandComplete: (n) => `Остров ${n} восстановлен!`,
  },
  noNews: 'В море тихо… пока что.',
};

export const LANGUAGES = {
  bg: { name: 'Български', strings: bg },
  en: { name: 'English', strings: en },
  ru: { name: 'Русский', strings: ru },
} as const;

export type Lang = keyof typeof LANGUAGES;

function detectLang(): Lang {
  try {
    const locale = (Intl.DateTimeFormat().resolvedOptions().locale ?? '').toLowerCase();
    if (locale.startsWith('bg')) return 'bg';
    if (locale.startsWith('ru') || locale.startsWith('uk') || locale.startsWith('be') || locale.startsWith('kk')) return 'ru';
  } catch {
    // fall through
  }
  return 'en';
}

const LANG_KEY = 'storm-isles/lang';
let current: Lang = detectLang();
const listeners = new Set<() => void>();

/** The active strings. A live binding: always read it as `t.something` at render time. */
export let t: Strings = LANGUAGES[current].strings;

export function getLang(): Lang {
  return current;
}

export function setLang(next: Lang): void {
  if (next === current) return;
  current = next;
  t = LANGUAGES[next].strings;
  AsyncStorage.setItem(LANG_KEY, next).catch(() => {});
  listeners.forEach((l) => l());
}

export function subscribeLang(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Restore the language the player chose last time (if any). */
export async function loadLang(): Promise<void> {
  try {
    const saved = (await AsyncStorage.getItem(LANG_KEY)) as Lang | null;
    if (saved && saved in LANGUAGES && saved !== current) {
      current = saved;
      t = LANGUAGES[saved].strings;
      listeners.forEach((l) => l());
    }
  } catch {
    // keep the device language
  }
}

export function formatCoins(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(abs >= 1e10 ? 0 : 1)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(abs >= 1e7 ? 0 : 1)}M`;
  if (abs >= 1e4) return `${(n / 1e3).toFixed(0)}K`;
  return String(Math.round(n));
}

export function formatDuration(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
