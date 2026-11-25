// Hand-drawn vector icons. Every icon is drawn in a 100×100 box.

import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Image } from 'react-native';

import type { SymbolId, TileKind } from '../game/types';
import { SYMBOL_IMAGES, TILE_IMAGES } from './images';
import { useUid } from './useUid';

interface IconProps {
  size: number;
}

const OUTLINE = '#3a2210';

function Painted({ id, size }: { id: SymbolId; size: number }) {
  return <Image source={SYMBOL_IMAGES[id]} style={{ width: size, height: size }} />;
}

function PaintedTile({ kind, size }: { kind: TileKind; size: number }) {
  return <Image source={TILE_IMAGES[kind]} style={{ width: size, height: size }} />;
}

export function CoinIcon({ size }: IconProps) {
  const id = useUid('coin');
  if (SYMBOL_IMAGES.coin) return <Painted id="coin" size={size} />;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`${id}a`} cx="38%" cy="32%" r="75%">
          <Stop offset="0" stopColor="#fff6b0" />
          <Stop offset="0.45" stopColor="#ffcf33" />
          <Stop offset="1" stopColor="#d98a00" />
        </RadialGradient>
        <LinearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffd84d" />
          <Stop offset="1" stopColor="#b86e00" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="50" cy="56" rx="42" ry="40" fill="#8a4f00" />
      <Circle cx="50" cy="50" r="42" fill={`url(#${id}a)`} stroke={OUTLINE} strokeWidth="4" />
      <Circle cx="50" cy="50" r="31" fill="none" stroke={`url(#${id}b)`} strokeWidth="5" />
      <Path
        d="M50 28 L56 43 L72 44 L60 54 L64 70 L50 61 L36 70 L40 54 L28 44 L44 43 Z"
        fill="#ffe680"
        stroke="#b86e00"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <Path d="M24 34 Q34 18 52 16" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7" />
    </Svg>
  );
}

export function BagIcon({ size }: IconProps) {
  const id = useUid('bag');
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#c98a4b" />
          <Stop offset="1" stopColor="#7a4a1f" />
        </LinearGradient>
      </Defs>
      <Path
        d="M30 34 Q14 56 18 78 Q22 94 50 94 Q78 94 82 78 Q86 56 70 34 Z"
        fill={`url(#${id}a)`}
        stroke={OUTLINE}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <Path d="M34 22 Q50 34 66 22 L70 34 L30 34 Z" fill="#a86d36" stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />
      <Rect x="28" y="31" width="44" height="8" rx="4" fill="#ff4d5e" stroke={OUTLINE} strokeWidth="3" />
      <Circle cx="50" cy="64" r="16" fill="#ffcf33" stroke="#b86e00" strokeWidth="4" />
      <Path d="M50 54 L50 74 M44 58 Q50 54 56 58 Q50 64 44 70 Q50 74 56 70" stroke="#b86e00" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <Circle cx="38" cy="22" r="9" fill="#ffcf33" stroke="#b86e00" strokeWidth="3" />
      <Circle cx="60" cy="18" r="8" fill="#ffd84d" stroke="#b86e00" strokeWidth="3" />
      <Path d="M28 52 Q26 64 30 74" stroke="#e8b37a" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7" />
    </Svg>
  );
}

export function ShieldIcon({ size, dim }: IconProps & { dim?: boolean }) {
  const id = useUid('shield');
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" opacity={dim ? 0.35 : 1}>
      <Defs>
        <LinearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={dim ? '#7d8a99' : '#4fb3ff'} />
          <Stop offset="1" stopColor={dim ? '#46505c' : '#1a5fb4'} />
        </LinearGradient>
      </Defs>
      <Path
        d="M50 6 L88 18 Q90 62 50 94 Q10 62 12 18 Z"
        fill={`url(#${id}a)`}
        stroke={OUTLINE}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <Path d="M50 14 L80 24 Q80 60 50 84" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="5" fill="none" />
      <G stroke={dim ? '#c9ced4' : '#ffd84d'} strokeWidth="7" strokeLinecap="round" fill="none">
        <Circle cx="50" cy="30" r="7" />
        <Path d="M50 37 L50 72" />
        <Path d="M38 47 L62 47" />
        <Path d="M30 58 Q34 74 50 74 Q66 74 70 58" />
      </G>
    </Svg>
  );
}

export function CannonIcon({ size }: IconProps) {
  const id = useUid('cannon');
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#7d8591" />
          <Stop offset="0.5" stopColor="#3b4149" />
          <Stop offset="1" stopColor="#1d2126" />
        </LinearGradient>
      </Defs>
      <Path d="M8 22 L20 12 M10 34 L4 30 M22 8 L18 2" stroke="#ff9f1c" strokeWidth="4" strokeLinecap="round" />
      <Circle cx="14" cy="22" r="7" fill="#ffd84d" />
      <G transform="rotate(-24 50 55)">
        <Rect x="22" y="38" width="66" height="30" rx="12" fill={`url(#${id}a)`} stroke={OUTLINE} strokeWidth="4" />
        <Rect x="80" y="34" width="12" height="38" rx="5" fill="#2a2f35" stroke={OUTLINE} strokeWidth="4" />
        <Rect x="44" y="36" width="8" height="34" rx="3" fill="#c9a227" stroke={OUTLINE} strokeWidth="3" />
        <Path d="M28 44 L78 44" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="4" strokeLinecap="round" />
      </G>
      <Path d="M22 84 L74 84" stroke="#6b3f1c" strokeWidth="10" strokeLinecap="round" />
      <Circle cx="40" cy="78" r="16" fill="#a8672f" stroke={OUTLINE} strokeWidth="4" />
      <Circle cx="40" cy="78" r="5" fill="#ffcf33" stroke={OUTLINE} strokeWidth="3" />
      <Path d="M40 62 L40 94 M24 78 L56 78" stroke={OUTLINE} strokeWidth="3" />
    </Svg>
  );
}

export function MapIcon({ size }: IconProps) {
  const id = useUid('map');
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#fff3cf" />
          <Stop offset="1" stopColor="#e3c27e" />
        </LinearGradient>
      </Defs>
      <Path
        d="M14 22 L36 14 L64 24 L86 16 L86 78 L64 86 L36 76 L14 84 Z"
        fill={`url(#${id}a)`}
        stroke={OUTLINE}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <Path d="M36 14 L36 76 M64 24 L64 86" stroke="#c9a25e" strokeWidth="3" />
      <Path d="M22 66 Q30 50 44 56 Q56 62 58 46 Q60 36 70 34" stroke="#7a4a1f" strokeWidth="3.5" strokeDasharray="5 5" fill="none" strokeLinecap="round" />
      <Path d="M64 26 L78 40 M78 26 L64 40" stroke="#e5383b" strokeWidth="7" strokeLinecap="round" />
      <Circle cx="24" cy="68" r="5" fill="#3fb950" stroke={OUTLINE} strokeWidth="2.5" />
    </Svg>
  );
}

export function StormIcon({ size }: IconProps) {
  const id = useUid('storm');
  if (SYMBOL_IMAGES.storm) return <Painted id="storm" size={size} />;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#c6b5ff" />
          <Stop offset="1" stopColor="#5a35d6" />
        </LinearGradient>
      </Defs>
      <G stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" fill={`url(#${id}a)`}>
        <Path d="M10 18 Q50 4 90 18 Q92 30 80 32 L20 32 Q8 30 10 18 Z" />
        <Path d="M20 36 L80 36 Q82 46 70 48 L30 48 Q18 46 20 36 Z" />
        <Path d="M30 52 L72 52 Q72 62 62 64 L38 64 Q28 62 30 52 Z" />
        <Path d="M38 68 L62 68 Q60 78 54 80 L44 80 Q38 76 38 68 Z" />
      </G>
      <Path d="M46 82 Q48 92 54 94" stroke={OUTLINE} strokeWidth="5" fill="none" strokeLinecap="round" />
      <Path d="M18 20 Q50 10 82 20" stroke="#fff" strokeOpacity="0.6" strokeWidth="4" fill="none" strokeLinecap="round" />
      <Path d="M72 54 L84 54 L76 66 L88 66 L70 88 L76 72 L66 72 Z" fill="#ffd84d" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
    </Svg>
  );
}

export function EnergyIcon({ size }: IconProps) {
  const id = useUid('energy');
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`${id}a`} cx="40%" cy="35%" r="70%">
          <Stop offset="0" stopColor="#7fe3ff" />
          <Stop offset="1" stopColor="#1572c9" />
        </RadialGradient>
        <LinearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#fff38a" />
          <Stop offset="1" stopColor="#ff9f1c" />
        </LinearGradient>
      </Defs>
      <Circle cx="50" cy="50" r="42" fill={`url(#${id}a)`} stroke={OUTLINE} strokeWidth="4" />
      <Path
        d="M56 12 L26 56 L46 56 L40 88 L74 40 L54 40 Z"
        fill={`url(#${id}b)`}
        stroke={OUTLINE}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <Path d="M22 34 Q30 18 46 14" stroke="#fff" strokeOpacity="0.6" strokeWidth="5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function ChestIcon({ size, open }: IconProps & { open?: boolean }) {
  const id = useUid('chest');
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#c27a3a" />
          <Stop offset="1" stopColor="#7a431a" />
        </LinearGradient>
      </Defs>
      {open ? (
        <>
          <Path d="M14 40 L22 14 L78 14 L86 40 Z" fill="#8a4f22" stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />
          <Circle cx="36" cy="40" r="10" fill="#ffcf33" stroke="#b86e00" strokeWidth="3" />
          <Circle cx="54" cy="36" r="11" fill="#ffd84d" stroke="#b86e00" strokeWidth="3" />
          <Circle cx="68" cy="42" r="9" fill="#ffcf33" stroke="#b86e00" strokeWidth="3" />
        </>
      ) : (
        <Path d="M12 46 Q12 18 50 18 Q88 18 88 46 Z" fill={`url(#${id}a)`} stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />
      )}
      <Rect x="12" y="44" width="76" height="44" rx="6" fill={`url(#${id}a)`} stroke={OUTLINE} strokeWidth="4" />
      <Rect x="12" y="44" width="76" height="9" fill="#d9a441" stroke={OUTLINE} strokeWidth="3" />
      <Rect x="24" y="44" width="8" height="44" fill="#d9a441" stroke={OUTLINE} strokeWidth="3" />
      <Rect x="68" y="44" width="8" height="44" fill="#d9a441" stroke={OUTLINE} strokeWidth="3" />
      <Rect x="42" y="52" width="16" height="18" rx="3" fill="#ffd84d" stroke={OUTLINE} strokeWidth="3" />
      <Circle cx="50" cy="60" r="3" fill={OUTLINE} />
    </Svg>
  );
}

export function DigSpotIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx="50" cy="66" rx="40" ry="18" fill="#c99a52" stroke="#7a5426" strokeWidth="4" />
      <Ellipse cx="50" cy="62" rx="30" ry="11" fill="#e0b871" />
      <Path d="M34 36 L66 64 M66 36 L34 64" stroke="#e5383b" strokeWidth="11" strokeLinecap="round" />
      <Path d="M34 36 L66 64 M66 36 L34 64" stroke="#ff6b6e" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

export function ScrollIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="22" y="16" width="56" height="68" rx="6" fill="#fff0c9" stroke={OUTLINE} strokeWidth="5" />
      <Rect x="14" y="10" width="72" height="14" rx="7" fill="#d9a441" stroke={OUTLINE} strokeWidth="5" />
      <Rect x="14" y="76" width="72" height="14" rx="7" fill="#d9a441" stroke={OUTLINE} strokeWidth="5" />
      <Path d="M34 38 L66 38 M34 50 L66 50 M34 62 L56 62" stroke="#a87a3a" strokeWidth="5" strokeLinecap="round" />
    </Svg>
  );
}

export function HammerIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d="M44 40 L82 86" stroke={OUTLINE} strokeWidth="16" strokeLinecap="round" />
      <Path d="M44 40 L82 86" stroke="#c98a4b" strokeWidth="9" strokeLinecap="round" />
      <G transform="rotate(-40 40 34)">
        <Rect x="14" y="20" width="54" height="26" rx="5" fill="#9aa3ad" stroke={OUTLINE} strokeWidth="5" />
        <Rect x="14" y="20" width="14" height="26" rx="4" fill="#6b747e" stroke={OUTLINE} strokeWidth="5" />
        <Path d="M32 26 L62 26" stroke="#fff" strokeOpacity="0.6" strokeWidth="4" strokeLinecap="round" />
      </G>
    </Svg>
  );
}

export function StarIcon({ size, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M50 8 L62 36 L92 38 L69 58 L77 88 L50 72 L23 88 L31 58 L8 38 L38 36 Z"
        fill={filled ? '#ffcf33' : '#5a4a3a'}
        stroke={filled ? '#9a5b00' : '#2e241b'}
        strokeWidth="7"
        strokeLinejoin="round"
        opacity={filled ? 1 : 0.55}
      />
      {filled ? <Path d="M40 40 L50 18" stroke="#fff6b0" strokeWidth="6" strokeLinecap="round" /> : null}
    </Svg>
  );
}

export function SymbolIcon({ id, size }: { id: SymbolId; size: number }) {
  switch (id) {
    case 'coin':
      return <CoinIcon size={size} />;
    case 'bag':
      return <BagIcon size={size} />;
    case 'anchor':
      return <ShieldIcon size={size} />;
    case 'cannon':
      return <CannonIcon size={size} />;
    case 'map':
      return <MapIcon size={size} />;
    case 'storm':
      return <StormIcon size={size} />;
    case 'energy':
      return <EnergyIcon size={size} />;
  }
}

// ── Weather tiles for the sky board ──────────────────────────────

function Cloud({ fill, stroke, y = 0 }: { fill: string; stroke: string; y?: number }) {
  return (
    <Path
      d={`M20 ${62 + y} Q8 ${62 + y} 10 ${50 + y} Q12 ${38 + y} 26 ${40 + y} Q28 ${22 + y} 48 ${24 + y} Q62 ${14 + y} 72 ${30 + y} Q90 ${30 + y} 90 ${46 + y} Q92 ${62 + y} 78 ${62 + y} Z`}
      fill={fill}
      stroke={stroke}
      strokeWidth="4"
      strokeLinejoin="round"
    />
  );
}

export function SunIcon({ size }: IconProps) {
  const id = useUid('sun');
  if (TILE_IMAGES.sun) return <PaintedTile kind="sun" size={size} />;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`${id}a`} cx="40%" cy="35%" r="70%">
          <Stop offset="0" stopColor="#fff7b0" />
          <Stop offset="0.5" stopColor="#ffd23f" />
          <Stop offset="1" stopColor="#ff9f1c" />
        </RadialGradient>
      </Defs>
      {Array.from({ length: 8 }, (_, i) => (
        <Path
          key={i}
          d="M50 4 L57 20 L43 20 Z"
          fill="#ffb02e"
          stroke={OUTLINE}
          strokeWidth="3"
          strokeLinejoin="round"
          transform={`rotate(${i * 45} 50 50)`}
        />
      ))}
      <Circle cx="50" cy="50" r="28" fill={`url(#${id}a)`} stroke={OUTLINE} strokeWidth="4" />
      <Path d="M34 40 Q40 28 52 26" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
    </Svg>
  );
}

export function WindIcon({ size }: IconProps) {
  const id = useUid('wind');
  if (TILE_IMAGES.wind) return <PaintedTile kind="wind" size={size} />;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffffff" />
          <Stop offset="1" stopColor="#bfeee6" />
        </LinearGradient>
      </Defs>
      <Cloud fill={`url(#${id}a)`} stroke={OUTLINE} y={-6} />
      <G stroke="#1aa39a" strokeWidth="6" strokeLinecap="round" fill="none">
        <Path d="M14 72 L60 72 Q74 72 72 62 Q70 54 62 56" />
        <Path d="M24 86 L76 86 Q90 86 88 76" />
      </G>
    </Svg>
  );
}

export function BoltIcon({ size }: IconProps) {
  const id = useUid('bolt');
  if (TILE_IMAGES.bolt) return <PaintedTile kind="bolt" size={size} />;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#8d86a8" />
          <Stop offset="1" stopColor="#4b4466" />
        </LinearGradient>
        <LinearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#fff38a" />
          <Stop offset="1" stopColor="#ffb02e" />
        </LinearGradient>
      </Defs>
      <Path d="M52 46 L34 74 L48 74 L40 96 L68 62 L54 62 L62 46 Z" fill={`url(#${id}b)`} stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />
      <Cloud fill={`url(#${id}a)`} stroke={OUTLINE} y={-10} />
      <Path d="M26 34 Q34 22 48 22" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5" />
    </Svg>
  );
}

export function RainIcon({ size }: IconProps) {
  const id = useUid('rain');
  if (TILE_IMAGES.rain) return <PaintedTile kind="rain" size={size} />;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#d9f1ff" />
          <Stop offset="1" stopColor="#7cc4f2" />
        </LinearGradient>
      </Defs>
      <Cloud fill={`url(#${id}a)`} stroke={OUTLINE} y={-10} />
      {[28, 50, 72].map((x, i) => (
        <Path
          key={x}
          d={`M${x} ${66 + (i % 2) * 8} Q${x - 7} ${78 + (i % 2) * 8} ${x} ${84 + (i % 2) * 8} Q${x + 7} ${78 + (i % 2) * 8} ${x} ${66 + (i % 2) * 8} Z`}
          fill="#2a86e0"
          stroke={OUTLINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}

export function StormCloudIcon({ size }: IconProps) {
  const id = useUid('scl');
  if (TILE_IMAGES.storm) return <PaintedTile kind="storm" size={size} />;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`${id}a`} cx="50%" cy="40%" r="70%">
          <Stop offset="0" stopColor="#9b7bff" />
          <Stop offset="1" stopColor="#3b1f99" />
        </RadialGradient>
      </Defs>
      <Path d="M30 54 L20 76 L30 76 L24 94 L44 68 L34 68 L40 54 Z" fill="#ffd84d" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
      <Path d="M66 54 L58 72 L68 72 L62 90 L80 66 L70 66 L74 54 Z" fill="#ffd84d" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
      <Cloud fill={`url(#${id}a)`} stroke={OUTLINE} y={-6} />
      <Path d="M34 38 Q46 30 58 36 Q66 42 60 48 Q52 52 48 44" stroke="#e2d6ff" strokeWidth="4" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function TileIcon({ kind, size }: { kind: TileKind; size: number }) {
  switch (kind) {
    case 'sun':
      return <SunIcon size={size} />;
    case 'wind':
      return <WindIcon size={size} />;
    case 'bolt':
      return <BoltIcon size={size} />;
    case 'rain':
      return <RainIcon size={size} />;
    case 'storm':
      return <StormCloudIcon size={size} />;
  }
}

export function GearIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {Array.from({ length: 8 }, (_, i) => (
        <Rect
          key={i}
          x="42"
          y="6"
          width="16"
          height="22"
          rx="4"
          fill="#d9dde3"
          stroke={OUTLINE}
          strokeWidth="4"
          transform={`rotate(${i * 45} 50 50)`}
        />
      ))}
      <Circle cx="50" cy="50" r="30" fill="#d9dde3" stroke={OUTLINE} strokeWidth="5" />
      <Circle cx="50" cy="50" r="12" fill="#7a4a1f" stroke={OUTLINE} strokeWidth="4" />
      <Path d="M30 40 Q36 28 50 26" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
    </Svg>
  );
}
