// Procedural captain portraits for rivals.

import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Stop } from 'react-native-svg';

import { useUid } from './useUid';

const INK = '#3a2210';
const SKINS = ['#f6d1b1', '#e7b48f', '#c98e64', '#a86b45', '#7a4a2e', '#f2c9a0'];
const HATS = ['#2b2b3a', '#7a1f2b', '#1f4f7a', '#3d5a2a', '#5a3a7a', '#7a5a1f'];
const HAIR = ['#3a2210', '#d9a441', '#8a3b1c', '#1d1d1d', '#c9c9c9', '#6b4423'];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function Avatar({ seed, size, ring = '#ffcf33' }: { seed: string; size: number; ring?: string }) {
  const id = useUid('av');
  const h = hash(seed);
  const skin = SKINS[h % SKINS.length];
  const hat = HATS[(h >> 3) % HATS.length];
  const hair = HAIR[(h >> 6) % HAIR.length];
  const beard = (h >> 9) % 3 === 0;
  const patch = (h >> 11) % 4 === 0;
  const bandana = (h >> 13) % 3 === 0;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#7fd3ff" />
          <Stop offset="1" stopColor="#2b7fc4" />
        </LinearGradient>
      </Defs>
      <Circle cx="50" cy="50" r="46" fill={`url(#${id}bg)`} stroke={ring} strokeWidth="6" />
      {/* shoulders */}
      <Path d="M18 92 Q22 70 50 68 Q78 70 82 92 Z" fill={hat} stroke={INK} strokeWidth="3" />
      <Path d="M44 70 L50 80 L56 70" stroke="#fff" strokeWidth="3" fill="none" />
      {/* head */}
      <Ellipse cx="50" cy="50" rx="20" ry="22" fill={skin} stroke={INK} strokeWidth="3" />
      <Path d="M31 46 Q30 30 50 28 Q70 30 69 46" fill={hair} />
      {beard ? <Path d="M32 54 Q34 76 50 76 Q66 76 68 54 Q60 64 50 62 Q40 64 32 54 Z" fill={hair} stroke={INK} strokeWidth="2.5" /> : null}
      <Path d="M42 62 Q50 66 58 62" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Circle cx="42" cy="50" r="3" fill={INK} />
      {patch ? (
        <G>
          <Path d="M30 42 L70 54" stroke={INK} strokeWidth="2" />
          <Ellipse cx="58" cy="50" rx="6" ry="5" fill={INK} />
        </G>
      ) : (
        <Circle cx="58" cy="50" r="3" fill={INK} />
      )}
      {/* hat */}
      {bandana ? (
        <G>
          <Path d="M29 42 Q30 22 50 22 Q70 22 71 42 Q50 36 29 42 Z" fill="#e5383b" stroke={INK} strokeWidth="3" />
          <Circle cx="40" cy="32" r="2.5" fill="#fff" />
          <Circle cx="56" cy="29" r="2.5" fill="#fff" />
          <Path d="M70 40 L80 46 L74 50 Z" fill="#e5383b" stroke={INK} strokeWidth="2.5" />
        </G>
      ) : (
        <G>
          <Path d="M18 38 Q50 6 82 38 Q66 30 50 34 Q34 30 18 38 Z" fill={hat} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <Path d="M22 36 Q50 24 78 36" stroke="#ffcf33" strokeWidth="3" fill="none" />
          <Circle cx="50" cy="24" r="4" fill="#fff" stroke={INK} strokeWidth="2" />
        </G>
      )}
    </Svg>
  );
}
