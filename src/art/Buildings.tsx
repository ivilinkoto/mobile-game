// Five building archetypes drawn in a 100×100 box with the ground at y=92.
// Shapes grow and gain details with level; colours come from the island theme.

import { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';

import type { IslandTheme } from './themes';
import { useUid } from './useUid';

const INK = '#3a2210';
const SW = 2.6; // stroke width

interface Props {
  type: number; // 0..4
  level: number; // 0..3
  damaged: boolean;
  theme: IslandTheme;
  size: number;
  /** Disable looping animations (e.g. small rival previews). */
  still?: boolean;
}

export function Building({ type, level, damaged, theme, size, still }: Props) {
  const id = useUid('b');
  const scale = level <= 1 ? 0.8 : level === 2 ? 0.9 : 1;
  const hasBlades = type === 2 && level > 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={theme.wall} />
            <Stop offset="1" stopColor={theme.wallDark} />
          </LinearGradient>
          <LinearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={theme.roof} />
            <Stop offset="1" stopColor={theme.roofDark} />
          </LinearGradient>
          <LinearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#fff38a" />
            <Stop offset="1" stopColor="#ffb02e" />
          </LinearGradient>
        </Defs>
        <Ellipse cx="50" cy="92" rx={level === 0 ? 30 : 34 * scale} ry={7 * scale} fill="#000" opacity="0.18" />
        {level === 0 ? (
          <Plot />
        ) : (
          <G transform={`translate(50 92) scale(${scale}) translate(-50 -92)`}>
            {type === 0 && <Hut level={level} id={id} theme={theme} />}
            {type === 1 && <Cottage level={level} id={id} theme={theme} />}
            {type === 2 && <Windmill level={level} id={id} theme={theme} />}
            {type === 3 && <Lighthouse level={level} id={id} theme={theme} />}
            {type === 4 && <Castle level={level} id={id} theme={theme} />}
          </G>
        )}
        {damaged && level > 0 ? <Damage /> : null}
      </Svg>
      {hasBlades ? (
        <Blades size={size * 0.62 * scale} theme={theme} spinning={!damaged && !still} gold={level >= 3} center={{ x: size * 0.5, y: size * (92 - (92 - 40) * scale) / 100 }} />
      ) : null}
    </View>
  );
}

type PartProps = { level: number; id: string; theme: IslandTheme };

function Flag({ x, y, color, h = 16 }: { x: number; y: number; color: string; h?: number }) {
  return (
    <G>
      <Path d={`M${x} ${y} L${x} ${y - h}`} stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <Path d={`M${x} ${y - h} L${x + 13} ${y - h + 4} L${x} ${y - h + 9} Z`} fill={color} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
    </G>
  );
}

function Window({ x, y, w = 9, h = 10, lit }: { x: number; y: number; w?: number; h?: number; lit?: boolean }) {
  return (
    <G>
      <Rect x={x} y={y} width={w} height={h} rx={2} fill={lit ? '#ffe27a' : '#5ec8e6'} stroke={INK} strokeWidth={2} />
      <Path d={`M${x + w / 2} ${y} L${x + w / 2} ${y + h} M${x} ${y + h / 2} L${x + w} ${y + h / 2}`} stroke={INK} strokeWidth={1.4} />
    </G>
  );
}

function Hut({ level, id, theme }: PartProps) {
  return (
    <G>
      {level >= 3 ? <Path d="M14 92 L14 80 M86 92 L86 80 M14 84 L30 84 M70 84 L86 84" stroke={theme.trim} strokeWidth={3} strokeLinecap="round" /> : null}
      <Rect x="28" y="58" width="44" height="34" rx="3" fill={`url(#${id}w)`} stroke={INK} strokeWidth={SW} />
      <Path d="M18 62 L50 28 L82 62 Q50 68 18 62 Z" fill={`url(#${id}r)`} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <Path d="M30 54 L40 46 M42 58 L54 44 M56 58 L64 50 M68 60 L72 56" stroke={theme.roofDark} strokeWidth={2} strokeLinecap="round" />
      <Path d="M43 92 L43 76 Q50 68 57 76 L57 92 Z" fill={theme.trim} stroke={INK} strokeWidth={SW} />
      {level >= 2 ? <Circle cx="64" cy="72" r="5" fill="#5ec8e6" stroke={INK} strokeWidth={2} /> : null}
      {level >= 2 ? <Circle cx="36" cy="72" r="5" fill="#5ec8e6" stroke={INK} strokeWidth={2} /> : null}
      {level >= 3 ? <Flag x={50} y={30} color={theme.flag} /> : null}
    </G>
  );
}

function Cottage({ level, id, theme }: PartProps) {
  const top = level >= 2 ? 40 : 52;
  return (
    <G>
      {level >= 2 ? <Rect x="62" y={top - 22} width="9" height="20" fill={theme.wallDark} stroke={INK} strokeWidth={SW} /> : null}
      {level >= 2 ? <Circle cx="68" cy={top - 30} r="4" fill="#fff" opacity="0.7" /> : null}
      <Rect x="24" y={top} width="52" height={92 - top} rx="2" fill={`url(#${id}w)`} stroke={INK} strokeWidth={SW} />
      <Path d={`M16 ${top + 4} L50 ${top - 26} L84 ${top + 4} Z`} fill={`url(#${id}r)`} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <Path d={`M26 ${top + 2} L74 ${top + 2}`} stroke={theme.roofDark} strokeWidth={2} />
      <Rect x="44" y="72" width="12" height="20" rx="2" fill={theme.trim} stroke={INK} strokeWidth={SW} />
      <Window x={30} y={74} lit={level >= 3} />
      <Window x={61} y={74} lit={level >= 3} />
      {level >= 2 ? <Window x={30} y={top + 8} lit={level >= 3} /> : null}
      {level >= 2 ? <Window x={61} y={top + 8} lit={level >= 3} /> : null}
      {level >= 2 ? <Circle cx="50" cy={top - 8} r="5" fill="#5ec8e6" stroke={INK} strokeWidth={2} /> : null}
      {level >= 3 ? (
        <>
          <Rect x="28" y="84" width="14" height="5" rx="2" fill="#4c9f2e" stroke={INK} strokeWidth={1.5} />
          <Rect x="58" y="84" width="14" height="5" rx="2" fill="#4c9f2e" stroke={INK} strokeWidth={1.5} />
          <Circle cx="32" cy="83" r="2.5" fill={theme.flag} />
          <Circle cx="38" cy="83" r="2.5" fill="#ffd84d" />
          <Circle cx="62" cy="83" r="2.5" fill="#ffd84d" />
          <Circle cx="68" cy="83" r="2.5" fill={theme.flag} />
          <Flag x={50} y={top - 26} color={theme.flag} />
        </>
      ) : null}
    </G>
  );
}

function Windmill({ level, id, theme }: PartProps) {
  return (
    <G>
      <Path d="M32 92 L40 42 L60 42 L68 92 Z" fill={`url(#${id}w)`} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <Path d="M36 70 L64 70" stroke={theme.wallDark} strokeWidth={2} />
      <Path d="M36 44 Q50 22 64 44 Z" fill={`url(#${id}r)`} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <Path d="M44 92 L44 80 Q50 74 56 80 L56 92 Z" fill={theme.trim} stroke={INK} strokeWidth={SW} />
      {level >= 2 ? <Window x={45.5} y={54} lit={level >= 3} /> : null}
      {level >= 3 ? <Path d="M34 80 L66 80" stroke={theme.trim} strokeWidth={3} /> : null}
      <Circle cx="50" cy="40" r="5" fill={level >= 3 ? '#ffcf33' : theme.trim} stroke={INK} strokeWidth={2} />
    </G>
  );
}

function Blades({
  size,
  theme,
  spinning,
  gold,
  center,
}: {
  size: number;
  theme: IslandTheme;
  spinning: boolean;
  gold: boolean;
  center: { x: number; y: number };
}) {
  const rot = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    if (!spinning) return;
    const loop = Animated.loop(Animated.timing(rot, { toValue: 1, duration: 5000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [spinning, rot]);
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const sail = gold ? '#fff3c4' : '#f8f1e0';
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: center.x - size / 2,
        top: center.y - size / 2,
        width: size,
        height: size,
        transform: [{ rotate }],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {[0, 90, 180, 270].map((a) => (
          <G key={a} transform={`rotate(${a} 50 50)`}>
            <Path d="M50 50 L50 4" stroke={INK} strokeWidth={4} strokeLinecap="round" />
            <Path d="M52 8 L68 10 L64 44 L52 46 Z" fill={sail} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            <Path d="M54 20 L66 21 M53 32 L65 33" stroke={theme.wallDark} strokeWidth={2} />
          </G>
        ))}
        <Circle cx="50" cy="50" r="7" fill={gold ? '#ffcf33' : theme.trim} stroke={INK} strokeWidth={3} />
      </Svg>
    </Animated.View>
  );
}

function Lighthouse({ level, id, theme }: PartProps) {
  // Tower runs from y=92 (half-width 13) up to y=36 (half-width 9).
  const halfAt = (y: number) => 9 + ((y - 36) / 56) * 4;
  const bands = [
    [84, 92],
    [64, 74],
    [44, 54],
  ];
  return (
    <G>
      {level >= 2 ? <Circle cx="50" cy="22" r="20" fill="#fff38a" opacity="0.35" /> : null}
      <Path d={`M${50 - 13} 92 L${50 - 9} 36 L${50 + 9} 36 L${50 + 13} 92 Z`} fill={`url(#${id}w)`} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {bands.map(([y1, y2]) => (
        <Polygon
          key={y1}
          points={`${50 - halfAt(y1)},${y1} ${50 + halfAt(y1)},${y1} ${50 + halfAt(y2)},${y2} ${50 - halfAt(y2)},${y2}`}
          fill={theme.roof}
          stroke={INK}
          strokeWidth={1.4}
        />
      ))}
      <Rect x="36" y="32" width="28" height="6" rx="2" fill={theme.trim} stroke={INK} strokeWidth={SW} />
      <Rect x="42" y="18" width="16" height="14" rx="2" fill={level >= 2 ? `url(#${id}g)` : '#9fdcef'} stroke={INK} strokeWidth={SW} />
      <Path d="M50 18 L50 32" stroke={INK} strokeWidth={1.5} />
      <Path d="M39 19 Q50 2 61 19 Z" fill={level >= 3 ? '#ffcf33' : `url(#${id}r)`} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <Path d="M45 92 L45 82 Q50 77 55 82 L55 92 Z" fill={theme.trim} stroke={INK} strokeWidth={2} />
      {level >= 3 ? <Flag x={50} y={8} color={theme.flag} h={10} /> : null}
    </G>
  );
}

function Castle({ level, id, theme }: PartProps) {
  const crenel = (x: number, y: number, w: number) => {
    const n = Math.floor(w / 8);
    const parts = [];
    for (let i = 0; i < n; i++) {
      if (i % 2 === 0) parts.push(<Rect key={i} x={x + i * 8} y={y - 6} width={8} height={7} fill={`url(#${id}w)`} stroke={INK} strokeWidth={2} />);
    }
    return parts;
  };
  return (
    <G>
      {level >= 2
        ? [14, 72].map((x) => (
            <G key={x}>
              <Rect x={x} y={42} width={14} height={50} fill={`url(#${id}w)`} stroke={INK} strokeWidth={SW} />
              <Path d={`M${x - 3} 44 L${x + 7} 22 L${x + 17} 44 Z`} fill={`url(#${id}r)`} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
              <Rect x={x + 4} y={56} width={6} height={9} rx={3} fill="#3a2a20" />
              {level >= 3 ? <Flag x={x + 7} y={24} color={theme.flag} h={12} /> : null}
            </G>
          ))
        : null}
      <Rect x="28" y="44" width="44" height="48" fill={`url(#${id}w)`} stroke={INK} strokeWidth={SW} />
      {crenel(28, 44, 48)}
      <Path d="M30 60 L70 60 M30 76 L70 76" stroke={theme.wallDark} strokeWidth={1.5} />
      <Path d="M40 92 L40 74 Q50 62 60 74 L60 92 Z" fill="#5a3a20" stroke={INK} strokeWidth={SW} />
      <Path d="M44 92 L44 76 M50 92 L50 70 M56 92 L56 76" stroke="#3a2210" strokeWidth={1.5} />
      <Rect x="33" y="50" width="7" height="9" rx="3" fill="#3a2a20" />
      <Rect x="60" y="50" width="7" height="9" rx="3" fill="#3a2a20" />
      {level >= 3 ? <Path d="M28 66 L72 66" stroke="#ffcf33" strokeWidth={3} /> : null}
      <Flag x={50} y={38} color={level >= 3 ? '#ffcf33' : theme.flag} h={level >= 2 ? 22 : 14} />
    </G>
  );
}

function Plot() {
  return (
    <G>
      <Ellipse cx="50" cy="86" rx="30" ry="9" fill="#a0723f" stroke="#6e4a22" strokeWidth={2} />
      <Ellipse cx="50" cy="85" rx="22" ry="5.5" fill="#bd8b52" />
      <Path d="M24 86 L24 70 M76 86 L76 70" stroke="#6e4a22" strokeWidth={3.5} strokeLinecap="round" />
      <Path d="M24 74 Q50 80 76 74" stroke="#e8d5a8" strokeWidth={2} fill="none" />
      <Rect x="38" y="78" width="24" height="5" rx="1.5" fill="#d4a15e" stroke="#6e4a22" strokeWidth={1.5} />
      <Rect x="41" y="73" width="20" height="5" rx="1.5" fill="#c38e4b" stroke="#6e4a22" strokeWidth={1.5} />
      <Path d="M58 72 L58 50" stroke="#6e4a22" strokeWidth={3} />
      <Rect x="48" y="48" width="22" height="13" rx="2" fill="#e9c88a" stroke="#6e4a22" strokeWidth={2} />
      <Path d="M54 54.5 L64 54.5 M59 50.5 L59 58.5" stroke="#3fb950" strokeWidth={3} strokeLinecap="round" />
    </G>
  );
}

function Damage() {
  return (
    <G>
      <Path d="M30 70 L40 62 L36 56 M62 66 L70 58 L66 50" stroke="#1d1410" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Circle cx="42" cy="34" r="10" fill="#4d4d4d" opacity="0.75" />
      <Circle cx="54" cy="24" r="12" fill="#6b6b6b" opacity="0.65" />
      <Circle cx="64" cy="12" r="9" fill="#8a8a8a" opacity="0.55" />
      <Path d="M26 92 Q22 80 30 72 Q32 82 36 80 Q36 70 42 66 Q46 80 44 92 Z" fill="#ff6b1c" stroke="#a8361a" strokeWidth={1.5} />
      <Path d="M30 92 Q30 84 34 80 Q36 88 40 86 Q40 90 40 92 Z" fill="#ffd84d" />
      <Path d="M62 92 Q60 84 66 78 Q68 86 72 84 Q74 88 72 92 Z" fill="#ff6b1c" stroke="#a8361a" strokeWidth={1.5} />
    </G>
  );
}
