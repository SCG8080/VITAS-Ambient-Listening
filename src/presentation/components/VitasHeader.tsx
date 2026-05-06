import React from 'react';
import { View, Text } from 'react-native';
import { BrandLogo } from './BrandLogo';

interface VitasHeaderProps {
  title?: string;
  showLogo?: boolean;
}

export function VitasHeader({ title, showLogo = true }: VitasHeaderProps) {
  return (
    <View className="bg-primary pt-14 pb-4 px-4 shadow-sm rounded-b-3xl">
      <View className="flex-row items-center justify-center">
        {showLogo && <BrandLogo />}
        {title && !showLogo && (
          <Text className="text-white text-xl font-semibold tracking-tight">{title}</Text>
        )}
      </View>
    </View>
  );
}
