import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { C, R } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  /** Makes the inner content wrapper flex:1 so a ScrollView child can fill remaining height */
  fillHeight?: boolean;
}

// Single unified glass card used everywhere — no nested glass.
// BlurView blurs the ScreenBackground orbs beneath it for true frosted effect.
// On Android < API 31 it degrades to a tinted surface (still looks great on dark bg).
export function GlassCard({
  children,
  style,
  padding,
  paddingHorizontal,
  paddingVertical,
  fillHeight,
}: GlassCardProps) {
  const contentPadding: ViewStyle = {
    padding: padding !== undefined ? padding : 13,
    ...(paddingHorizontal !== undefined && { paddingHorizontal }),
    ...(paddingVertical !== undefined && { paddingVertical }),
    ...(padding === undefined && paddingHorizontal !== undefined && { padding: undefined }),
    ...(fillHeight && { flex: 1 }),
  };

  return (
    <View style={[styles.wrapper, style]}>
      <BlurView tint="dark" intensity={40} style={StyleSheet.absoluteFillObject} />
      <View style={[StyleSheet.absoluteFillObject, styles.tint]} pointerEvents="none" />
      <View style={contentPadding}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: R.card,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.surfaceBorder,
  } as ViewStyle,
  tint: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
