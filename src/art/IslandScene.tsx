// The island diorama: sky, animated sea, the island itself with decor,
// and the five building plots placed with depth sorting.

import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { Animated, Easing, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { MAX_BUILDING_LEVEL } from '../game/config';
import { Building } from './Buildings';
import { StarIcon } from './Icons';
import type { DecorKind, IslandTheme } from './themes';
import { useUid } from './useUid';

const VB_W = 400;
const VB_H = 300;

/** Building plots in island-viewBox units: base point (bottom centre) and width. */
const PLOTS = [
  { x: 140, y: 238, w: 92 }, // hut
  { x: 104, y: 172, w: 98 }, // cottage
  { x: 268, y: 242, w: 100 }, // windmill
  { x: 300, y: 160, w: 96 }, // lighthouse
  { x: 200, y: 140, w: 124 }, // castle
];

const DECOR_SLOTS = [
  { x: 42, y: 196, s: 1 },
  { x: 362, y: 204, s: 0.95 },
  { x: 200, y: 262, s: 0.7 },
  { x: 60, y: 140, s: 0.8 },
];

interface Props {
  theme: IslandTheme;
  buildings: number[];
  damaged: boolean[];
  /** Rival preview: smaller, no looping animations, no stars. */
  compact?: boolean;
  /** Space covered by overlays (HUD on top, meters at the bottom). */
  insetTop?: number;
  insetBottom?: number;
}

export function IslandScene({ theme, buildings, damaged, compact, insetTop = 0, insetBottom = 0 }: Props) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== box.w || height !== box.h) setBox({ w: width, h: height });
  };

  // Fit the island (4:3) between the overlays; it may bleed a little past the
  // screen edges (that is only sea) so it reads big on narrow phones.
  const skyH = compact ? 0 : Math.max(box.h * 0.12, insetTop * 0.75);
  const availH = box.h - insetTop - insetBottom;
  const scale = Math.min((box.w * (compact ? 1 : 1.1)) / VB_W, availH / VB_H);
  const iw = VB_W * scale;
  const ih = VB_H * scale;
  const ix = (box.w - iw) / 2;
  const iy = insetTop + (availH - ih) / 2;

  const order = PLOTS.map((p, i) => ({ ...p, i })).sort((a, b) => a.y - b.y);

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {box.w > 0 ? (
        <>
          <Backdrop theme={theme} w={box.w} h={box.h} skyH={skyH} />
          {!compact ? <Waves w={box.w} h={box.h} top={skyH} color={theme.foam} /> : null}
          {!compact ? <Clouds w={box.w} skyH={skyH} /> : null}
          <View style={{ position: 'absolute', left: ix, top: iy, width: iw, height: ih }}>
            <IslandBase theme={theme} w={iw} h={ih} />
          </View>
          {order.map((p) => {
            const size = p.w * scale;
            const left = ix + p.x * scale - size / 2;
            const top = iy + p.y * scale - size * 0.92;
            return (
              <View key={p.i} style={{ position: 'absolute', left, top, width: size, height: size }} pointerEvents="none">
                <PoppingBuilding
                  type={p.i}
                  level={buildings[p.i]}
                  damaged={damaged[p.i]}
                  theme={theme}
                  size={size}
                  still={compact}
                />
                {!compact && buildings[p.i] > 0 ? (
                  <View style={styles.stars}>
                    {Array.from({ length: MAX_BUILDING_LEVEL }, (_, s) => (
                      <StarIcon key={s} size={Math.max(10, size * 0.13)} filled={s < buildings[p.i]} />
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </>
      ) : null}
    </View>
  );
}

function PoppingBuilding(props: ComponentProps<typeof Building>) {
  const pop = useState(() => new Animated.Value(1))[0];
  const prev = useRef(props.level);
  useEffect(() => {
    if (props.level > prev.current) {
      pop.setValue(0.3);
      Animated.spring(pop, { toValue: 1, useNativeDriver: true, bounciness: 16, speed: 9 }).start();
    }
    prev.current = props.level;
  }, [props.level, pop]);
  const translateY = pop.interpolate({ inputRange: [0.3, 1], outputRange: [props.size * 0.3, 0] });
  return (
    <Animated.View style={{ transform: [{ translateY }, { scale: pop }] }}>
      <Building {...props} />
    </Animated.View>
  );
}

function Backdrop({ theme, w, h, skyH }: { theme: IslandTheme; w: number; h: number; skyH: number }) {
  const id = useUid('bd');
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={theme.skyTop} />
          <Stop offset="1" stopColor={theme.skyBottom} />
        </LinearGradient>
        <LinearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={theme.seaTop} />
          <Stop offset="1" stopColor={theme.seaBottom} />
        </LinearGradient>
      </Defs>
      {skyH > 0 ? <Rect x="0" y="0" width={w} height={skyH + 2} fill={`url(#${id}s)`} /> : null}
      <Rect x="0" y={skyH} width={w} height={h - skyH} fill={`url(#${id}w)`} />
      {skyH > 0 ? <Rect x="0" y={skyH} width={w} height="3" fill="#ffffff" opacity="0.5" /> : null}
    </Svg>
  );
}

/** Rows of little wave crests sliding sideways forever. */
function Waves({ w, h, top, color }: { w: number; h: number; top: number; color: string }) {
  const t = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(t, { toValue: 1, duration: 7000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [t]);
  const period = 80;
  const rows = Math.ceil((h - top) / 46);
  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [0, -period] });
  const translateXRev = t.interpolate({ inputRange: [0, 1], outputRange: [-period, 0] });
  return (
    <>
      {Array.from({ length: rows }, (_, r) => {
        const y = top + 18 + r * 46;
        const offset = (r % 2) * 40;
        let d = '';
        for (let x = -period + offset; x < w + period * 2; x += period) d += `M${x} ${y} q10 -7 20 0 `;
        return (
          <Animated.View
            key={r}
            pointerEvents="none"
            style={{ position: 'absolute', left: 0, top: 0, transform: [{ translateX: r % 2 ? translateXRev : translateX }] }}
          >
            <Svg width={w + period * 3} height={h}>
              <Path d={d} stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={0.35} />
            </Svg>
          </Animated.View>
        );
      })}
    </>
  );
}

function Clouds({ w, skyH }: { w: number; skyH: number }) {
  const t = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(t, { toValue: 1, duration: 60000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [t]);
  const cw = 90;
  return (
    <>
      {[0, 0.55].map((phase, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: skyH * (i === 0 ? 0.12 : 0.4),
            left: 0,
            transform: [
              {
                translateX: t.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-cw + (w + cw) * phase, -cw + (w + cw) * phase + (w + cw)],
                }),
              },
            ],
          }}
        >
          <Svg width={cw} height={cw * 0.4} viewBox="0 0 100 40" opacity={0.9}>
            <Path d="M10 34 Q4 22 18 20 Q20 6 38 10 Q48 0 62 10 Q80 6 82 20 Q96 22 90 34 Z" fill="#fff" />
          </Svg>
        </Animated.View>
      ))}
    </>
  );
}

function IslandBase({ theme, w, h }: { theme: IslandTheme; w: number; h: number }) {
  const id = useUid('is');
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`}>
      <Defs>
        <LinearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={theme.grassLight} />
          <Stop offset="0.5" stopColor={theme.grass} />
          <Stop offset="1" stopColor={theme.grassDark} />
        </LinearGradient>
        <LinearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={theme.sand} />
          <Stop offset="1" stopColor={theme.sandDark} />
        </LinearGradient>
      </Defs>
      <Landmark kind={theme.landmark} theme={theme} />
      {/* shallow water + foam ring */}
      <Ellipse cx="200" cy="190" rx="198" ry="106" fill={theme.shallow} opacity="0.75" />
      <Ellipse cx="200" cy="186" rx="186" ry="96" fill="none" stroke={theme.foam} strokeWidth="5" strokeDasharray="14 10" opacity="0.8" />
      {/* cliff/side of the island */}
      <Ellipse cx="200" cy="192" rx="176" ry="88" fill={theme.sandDark} />
      <Ellipse cx="200" cy="182" rx="176" ry="86" fill={`url(#${id}s)`} />
      {/* grass plateau with a wobbly edge */}
      <Path
        d="M58 176 Q50 132 96 112 Q130 92 172 96 Q214 84 258 98 Q312 100 336 132 Q360 162 338 196 Q318 238 262 248 Q214 258 160 250 Q102 246 74 220 Q60 202 58 176 Z"
        fill={theme.grassDark}
        transform="translate(0 7)"
      />
      <Path
        d="M58 176 Q50 132 96 112 Q130 92 172 96 Q214 84 258 98 Q312 100 336 132 Q360 162 338 196 Q318 238 262 248 Q214 258 160 250 Q102 246 74 220 Q60 202 58 176 Z"
        fill={`url(#${id}g)`}
      />
      {/* grass tufts */}
      <G stroke={theme.grassDark} strokeWidth="3" strokeLinecap="round" opacity="0.7">
        <Path d="M86 200 l4 -8 l4 8 M232 116 l4 -8 l4 8 M330 180 l4 -8 l4 8 M180 214 l4 -8 l4 8 M120 132 l4 -8 l4 8" fill="none" />
      </G>
      {/* little path towards the shore */}
      <Path d="M200 250 Q190 224 206 200 Q218 182 200 160" stroke={theme.sand} strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.9" />
      {DECOR_SLOTS.map((slot, i) => {
        const kind = theme.decor[i];
        return kind ? <Decor key={i} kind={kind} x={slot.x} y={slot.y} s={slot.s} theme={theme} /> : null;
      })}
    </Svg>
  );
}

function Decor({ kind, x, y, s, theme }: { kind: DecorKind; x: number; y: number; s: number; theme: IslandTheme }) {
  const tf = `translate(${x} ${y}) scale(${s})`;
  switch (kind) {
    case 'palm':
      return (
        <G transform={tf}>
          <Ellipse cx="0" cy="0" rx="18" ry="5" fill="#000" opacity="0.15" />
          <Path d="M0 0 Q-4 -30 6 -58" stroke="#8a5a2b" strokeWidth="7" fill="none" strokeLinecap="round" />
          <Path d="M0 0 Q-4 -30 6 -58" stroke="#b98250" strokeWidth="3" fill="none" strokeDasharray="4 5" />
          <G fill="#3fae49" stroke="#22702c" strokeWidth="2">
            <Path d="M6 -58 Q-18 -70 -34 -52 Q-14 -60 6 -56 Z" />
            <Path d="M6 -58 Q30 -72 44 -50 Q24 -60 6 -56 Z" />
            <Path d="M6 -58 Q-6 -84 -22 -86 Q-4 -76 6 -58 Z" />
            <Path d="M6 -58 Q22 -86 38 -82 Q18 -76 6 -58 Z" />
          </G>
          <Circle cx="3" cy="-54" r="4" fill="#7a4a1f" />
          <Circle cx="10" cy="-53" r="4" fill="#7a4a1f" />
        </G>
      );
    case 'pine':
      return (
        <G transform={tf}>
          <Ellipse cx="0" cy="0" rx="16" ry="4" fill="#000" opacity="0.15" />
          <Path d="M-4 0 L-4 -12 L4 -12 L4 0 Z" fill="#7a4a1f" />
          <Path d="M0 -60 L22 -12 L-22 -12 Z" fill="#2f7d4f" stroke="#1d4f33" strokeWidth="2" strokeLinejoin="round" />
          <Path d="M0 -60 L12 -36 Q0 -30 -12 -36 Z" fill="#fff" />
          <Path d="M-16 -22 Q0 -16 16 -22" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        </G>
      );
    case 'rock':
      return (
        <G transform={tf}>
          <Path d="M-20 0 Q-22 -14 -10 -20 Q0 -28 12 -20 Q24 -12 20 0 Z" fill="#8f8a85" stroke="#4f4a45" strokeWidth="2.5" />
          <Path d="M-10 -16 Q0 -22 8 -16" stroke="#c9c4bf" strokeWidth="3" fill="none" strokeLinecap="round" />
          {theme.landmark === 'volcano' ? <Path d="M-6 -4 L2 -12 L8 -6" stroke="#ff7a1c" strokeWidth="2.5" fill="none" /> : null}
        </G>
      );
    case 'coral':
      return (
        <G transform={tf}>
          <Path d="M0 0 L0 -26 M0 -16 L-10 -30 M0 -20 L10 -36 M-10 -30 L-14 -40 M10 -36 L16 -42" stroke="#ff6f91" strokeWidth="6" strokeLinecap="round" />
          <Circle cx="-14" cy="-6" r="7" fill="#ffd166" stroke="#c99a1d" strokeWidth="2" />
          <Circle cx="14" cy="-8" r="3" fill="#a6ecff" opacity="0.8" />
          <Circle cx="18" cy="-20" r="2" fill="#a6ecff" opacity="0.8" />
        </G>
      );
    case 'cloud':
      return (
        <G transform={tf}>
          <Path d="M-30 0 Q-36 -14 -20 -16 Q-16 -32 2 -26 Q16 -36 26 -20 Q40 -16 32 0 Z" fill="#ffffff" stroke="#d5dcf5" strokeWidth="2" />
        </G>
      );
  }
}

function Landmark({ kind, theme }: { kind: IslandTheme['landmark']; theme: IslandTheme }) {
  switch (kind) {
    case 'volcano':
      return (
        <G>
          <Path d="M120 130 L176 34 L224 34 L280 130 Z" fill="#5a4640" stroke="#3a2b26" strokeWidth="3" strokeLinejoin="round" />
          <Path d="M176 34 L224 34 L214 48 Q200 40 186 48 Z" fill="#ff6b1c" />
          <Path d="M196 44 Q190 70 200 90 M210 46 Q218 64 212 80" stroke="#ff8a1c" strokeWidth="5" strokeLinecap="round" fill="none" />
          <Circle cx="186" cy="18" r="12" fill="#6b6b6b" opacity="0.6" />
          <Circle cx="206" cy="6" r="15" fill="#7d7d7d" opacity="0.5" />
        </G>
      );
    case 'iceberg':
      return (
        <G>
          <Path d="M8 120 L30 70 L46 84 L62 52 L84 120 Z" fill="#eaf6ff" stroke="#9cc3dd" strokeWidth="3" strokeLinejoin="round" />
          <Path d="M30 70 L36 120 M62 52 L58 120" stroke="#bcdcf0" strokeWidth="3" />
          <Path d="M330 116 L350 84 L372 98 L392 116 Z" fill="#eaf6ff" stroke="#9cc3dd" strokeWidth="3" strokeLinejoin="round" />
        </G>
      );
    case 'rainbow':
      return (
        <G fill="none" strokeWidth="9" opacity="0.8">
          {['#ff6b6b', '#ffb02e', '#ffe14d', '#6bd66b', '#5ab8ff', '#9b6bff'].map((c, i) => (
            <Path key={c} d={`M${60 + i * 8} 140 A${140 - i * 8} ${110 - i * 8} 0 0 1 ${340 - i * 8} 140`} stroke={c} />
          ))}
        </G>
      );
    case 'ruins':
      return (
        <G fill={theme.wall} stroke={theme.wallDark} strokeWidth="3">
          <Rect x="70" y="60" width="16" height="64" />
          <Rect x="64" y="52" width="28" height="10" />
          <Rect x="310" y="76" width="16" height="48" />
          <Rect x="304" y="68" width="28" height="10" />
          <Circle cx="120" cy="40" r="5" fill="#a6ecff" stroke="none" opacity="0.6" />
          <Circle cx="290" cy="30" r="7" fill="#a6ecff" stroke="none" opacity="0.6" />
        </G>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  stars: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
