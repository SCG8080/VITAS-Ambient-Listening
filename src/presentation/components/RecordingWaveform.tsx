import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';

export function RecordingWaveform({ isRecording }: { isRecording: boolean }) {
  const bars = Array.from({ length: 5 });

  return (
    <View className="flex-row items-center justify-center h-32 space-x-2">
      {bars.map((_, i) => (
        <AnimatedBar key={i} index={i} isRecording={isRecording} />
      ))}
    </View>
  );
}

function AnimatedBar({ index, isRecording }: { index: number; isRecording: boolean }) {
  const height = useSharedValue(20);

  useEffect(() => {
    if (isRecording) {
      height.value = withRepeat(
        withSequence(
          withTiming(40 + Math.random() * 40, { duration: 300 + index * 100, easing: Easing.inOut(Easing.ease) }),
          withTiming(20 + Math.random() * 20, { duration: 300 + index * 100, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      height.value = withTiming(8, { duration: 300 });
    }
  }, [isRecording]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  });

  return (
    <Animated.View 
      className={`w-3 rounded-full ${isRecording ? 'bg-primary' : 'bg-gray-300'}`}
      style={animatedStyle}
    />
  );
}
