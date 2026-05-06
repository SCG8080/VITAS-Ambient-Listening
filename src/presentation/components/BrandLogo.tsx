import React from 'react';
import { View, Text } from 'react-native';
import Logo from '../../../assets/images/logovitaswhite.svg';

export function BrandLogo({ width = 120, height = 40 }: { width?: number; height?: number }) {
  return (
    <View className="items-center justify-center">
      <Logo width={width} height={height} />
    </View>
  );
}
