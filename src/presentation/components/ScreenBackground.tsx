import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { C } from '../theme';

interface Orb {
  id: string;
  xRatio: number;  // 0–1 of screen width
  yRatio: number;  // 0–1 of screen height
  rRatio: number;  // radius as fraction of screen width
  color: string;
  opacity: number;
}

const VARIANTS: Record<string, Orb[]> = {
  home: [
    { id: 'a', xRatio: 0.88, yRatio: 0.0,  rRatio: 0.46, color: '#7C3AED', opacity: 0.42 },
    { id: 'b', xRatio: -0.05, yRatio: 0.75, rRatio: 0.36, color: '#A78BFA', opacity: 0.18 },
    { id: 'c', xRatio: 0.55,  yRatio: 0.48, rRatio: 0.22, color: '#5B21B6', opacity: 0.28 },
  ],
  recorder: [
    { id: 'a', xRatio: -0.05, yRatio: 0.0,  rRatio: 0.40, color: '#EF4444', opacity: 0.16 },
    { id: 'b', xRatio: 0.92,  yRatio: 0.0,  rRatio: 0.42, color: '#7C3AED', opacity: 0.40 },
    { id: 'c', xRatio: 0.15,  yRatio: 0.70, rRatio: 0.30, color: '#5B21B6', opacity: 0.22 },
  ],
  list: [
    { id: 'a', xRatio: 0.88, yRatio: 0.0,  rRatio: 0.44, color: '#7C3AED', opacity: 0.38 },
    { id: 'b', xRatio: -0.05, yRatio: 0.78, rRatio: 0.32, color: '#A78BFA', opacity: 0.15 },
  ],
  preview: [
    { id: 'a', xRatio: 0.88, yRatio: 0.0,  rRatio: 0.44, color: '#7C3AED', opacity: 0.38 },
    { id: 'b', xRatio: -0.05, yRatio: 0.75, rRatio: 0.30, color: '#10B981', opacity: 0.15 },
  ],
  detail: [
    { id: 'a', xRatio: 0.88, yRatio: 0.0,  rRatio: 0.44, color: '#7C3AED', opacity: 0.38 },
    { id: 'b', xRatio: -0.05, yRatio: 0.72, rRatio: 0.30, color: '#A78BFA', opacity: 0.16 },
  ],
};

interface Props {
  variant?: keyof typeof VARIANTS;
}

export function ScreenBackground({ variant = 'home' }: Props) {
  const { width, height } = useWindowDimensions();
  const orbs = VARIANTS[variant];

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: C.bg }]} />
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        <Defs>
          {orbs.map(orb => (
            <RadialGradient key={orb.id} id={`${variant}_${orb.id}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%"   stopColor={orb.color} stopOpacity={orb.opacity} />
              <Stop offset="100%" stopColor={orb.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {orbs.map(orb => (
          <Circle
            key={orb.id}
            cx={orb.xRatio * width}
            cy={orb.yRatio * height}
            r={orb.rRatio * width}
            fill={`url(#${variant}_${orb.id})`}
          />
        ))}
      </Svg>
    </View>
  );
}
