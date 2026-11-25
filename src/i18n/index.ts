// Minimal i18n: Bulgarian + English, chosen from the device locale.

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
  settings: { title: 'Настройки', sfx: 'Звукови ефекти', music: 'Музика', on: 'Вкл.', off: 'Изкл.' },
  meters: { sails: 'Платна', cannons: 'Оръдия', rain: 'Дъжд' },
  chainHint: 'Плъзни пръст през 3+ еднакви облака',
  stormTap: (n: number) => `Бури: ${n} · докосни облака, за да удариш`,
  stormDanger: 'Още една буря и тя ще удари теб!',
  chainResult: {
    raidReady: 'Платната са пълни!',
    attackReady: 'Оръдията са заредени!',
    stormSpawned: 'Буреносен облак!',
  },
  shields: 'Щитове',
  progress: 'Възстановен',
  spin: 'ЗАВЪРТИ',
  bet: 'Залог',
  nextSpinIn: (t: string) => `+1 след ${t}`,
  spinsFull: 'Пълно',
  noSpins: 'Няма завъртания',
  build: 'Строй',
  news: 'Новини',
  buildTitle: 'Строителство',
  level: (l: number, max: number) => `Ниво ${l}/${max}`,
  maxed: 'Готово',
  upgrade: 'Строй',
  repair: 'Поправи',
  damaged: 'Повредена',
  close: 'Затвори',
  storm: 'Буря',
  stormCharge: (c: number, n: number) => `Буря ${c}/${n}`,
  stormReady: (p: number) => `Буря · сила ${p}`,
  unleash: 'Отприщи',
  stormHint: 'Нова буря = x2. Две наведнъж удрят теб!',
  stormChoose: 'Накъде да пратиш бурята?',
  stormIgnoresShields: 'Бурята пробива щитовете',
  cancel: 'Назад',
  attackTitle: 'Оръдия! Избери цел',
  attackPickBuilding: 'Избери сграда за обстрел',
  revenge: 'Отмъщение',
  shieldUp: 'Щит!',
  blocked: 'Щитът спря изстрела!',
  hit: 'Попадение!',
  raidTitle: (name: string) => `Съкровището на ${name}`,
  raidHint: (n: number) => `Копай на ${n} места`,
  collect: 'Събери',
  result: {
    coins: (c: string) => `+${c}`,
    spins: (n: number) => `+${n} завъртания`,
    shield: '+1 щит',
    stormFormed: 'Бурен фронт се оформи!',
    powerUp: 'Фронтът се усили!',
    backfire: 'Бурята се обърна срещу теб!',
  },
  islandComplete: 'Островът е възстановен!',
  islandCompleteBody: (n: number) => `+${n} завъртания. Отплаваме към следващия остров!`,
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
  welcomeBack: 'Докато те нямаше',
};

type Strings = typeof bg;

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
  settings: { title: 'Settings', sfx: 'Sound effects', music: 'Music', on: 'On', off: 'Off' },
  meters: { sails: 'Sails', cannons: 'Cannons', rain: 'Rain' },
  chainHint: 'Drag through 3+ matching clouds',
  stormTap: (n) => `Storms: ${n} · tap a storm to strike`,
  stormDanger: 'One more storm and it hits you!',
  chainResult: {
    raidReady: 'Sails are full!',
    attackReady: 'Cannons loaded!',
    stormSpawned: 'Storm cloud!',
  },
  shields: 'Shields',
  progress: 'Restored',
  spin: 'SPIN',
  bet: 'Bet',
  nextSpinIn: (t) => `+1 in ${t}`,
  spinsFull: 'Full',
  noSpins: 'Out of spins',
  build: 'Build',
  news: 'News',
  buildTitle: 'Build',
  level: (l, max) => `Level ${l}/${max}`,
  maxed: 'Done',
  upgrade: 'Build',
  repair: 'Repair',
  damaged: 'Damaged',
  close: 'Close',
  storm: 'Storm',
  stormCharge: (c, n) => `Storm ${c}/${n}`,
  stormReady: (p) => `Storm · power ${p}`,
  unleash: 'Unleash',
  stormHint: 'Each storm = x2. Two at once hit you!',
  stormChoose: 'Where to send the storm?',
  stormIgnoresShields: 'Storms break through shields',
  cancel: 'Back',
  attackTitle: 'Cannons! Pick a target',
  attackPickBuilding: 'Pick a building to fire at',
  revenge: 'Revenge',
  shieldUp: 'Shield!',
  blocked: 'A shield stopped the shot!',
  hit: 'Direct hit!',
  raidTitle: (name) => `${name}'s treasure`,
  raidHint: (n) => `Dig in ${n} spots`,
  collect: 'Collect',
  result: {
    coins: (c) => `+${c}`,
    spins: (n) => `+${n} spins`,
    shield: '+1 shield',
    stormFormed: 'A storm front formed!',
    powerUp: 'The front grew stronger!',
    backfire: 'The storm turned on you!',
  },
  islandComplete: 'Island restored!',
  islandCompleteBody: (n) => `+${n} spins. Set sail for the next island!`,
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
  welcomeBack: 'While you were away',
};

function detectLang(): 'bg' | 'en' {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale ?? '';
    return locale.toLowerCase().startsWith('bg') ? 'bg' : 'en';
  } catch {
    return 'en';
  }
}

export const lang = detectLang();
export const t: Strings = lang === 'bg' ? bg : en;

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
