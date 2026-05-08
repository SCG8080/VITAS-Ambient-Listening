import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';

const BAR_COUNT = 16;
const BASE_HEIGHTS = [8, 18, 30, 12, 38, 22, 10, 42, 16, 34, 8, 28, 14, 40, 20, 9];

function AnimatedBar({ index, isRecording }: { index: number; isRecording: boolean }) {
  const height = useSharedValue(BASE_HEIGHTS[index] * 0.25);

  useEffect(() => {
    if (isRecording) {
      const target = BASE_HEIGHTS[index];
      height.value = withRepeat(
        withSequence(
          withTiming(target, { duration: 280 + index * 60, easing: Easing.inOut(Easing.ease) }),
          withTiming(target * 0.3, { duration: 280 + index * 60, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else {
      height.value = withTiming(BASE_HEIGHTS[index] * 0.2, { duration: 400 });
    }
  }, [isRecording]);

  const style = useAnimatedStyle(() => ({ height: height.value }));

  return (
    <Animated.View
      style={[
        {
          width: 2.5,
          borderRadius: 3,
          backgroundColor: '#A78BFA',
          opacity: isRecording ? 0.85 : 0.35,
        },
        style,
      ]}
    />
  );
}

export function RecordingWaveform({ isRecording }: { isRecording: boolean }) {
  return (
    <GlassCard paddingHorizontal={14} paddingVertical={0} padding={0}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2.5,
          height: 54,
          paddingHorizontal: 14,
        }}
      >
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <AnimatedBar key={i} index={i} isRecording={isRecording} />
        ))}
      </View>
    </GlassCard>
  );
}
