import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  FadeIn,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import Logo from '../../../assets/images/logovitaswhite.svg';
import { C } from '../theme';

interface Props {
  onDone: () => void;
}

export function SplashOverlay({ onDone }: Props) {
  const { width, height } = useWindowDimensions();
  const opacity = useSharedValue(1);
  const logoScale = useSharedValue(0.88);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    // Logo entrance
    logoScale.value = withTiming(1, { duration: 700 });
    logoOpacity.value = withTiming(1, { duration: 700 });

    // Hold 1.8s then fade the whole overlay out
    opacity.value = withDelay(
      1800,
      withTiming(0, { duration: 550 }, (finished) => {
        if (finished) runOnJS(onDone)();
      })
    );
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, styles.container, overlayStyle]}>
      {/* Background glow orbs */}
      <Svg style={StyleSheet.absoluteFillObject} width={width} height={height}>
        <Defs>
          <RadialGradient id="gOuter" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor="#6D28D9" stopOpacity="0.45" />
            <Stop offset="100%" stopColor="#6D28D9" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="gInner" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor="#A78BFA" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="gCore" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor="#EDE9FE" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#EDE9FE" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {/* Outermost wide purple haze */}
        <Circle cx={width / 2} cy={height / 2} r={width * 0.72} fill="url(#gOuter)" />
        {/* Mid violet ring */}
        <Circle cx={width / 2} cy={height / 2} r={width * 0.42} fill="url(#gInner)" />
        {/* Bright core */}
        <Circle cx={width / 2} cy={height / 2} r={width * 0.22} fill="url(#gCore)" />
      </Svg>

      {/* Logo + wordmark */}
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        {/* Soft white box-shadow glow behind the logo */}
        <View style={styles.glowRing}>
          <Logo width={180} height={58} />
        </View>
        <Text style={styles.sub}>Ambient Recorder</Text>
      </Animated.View>

      {/* Bottom version label */}
      <Animated.View
        entering={FadeIn.delay(600).duration(600)}
        style={styles.bottomLabel}
      >
        <Text style={styles.bottomText}>VITAS Health</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  logoWrap: {
    alignItems: 'center',
    gap: 14,
  },
  glowRing: {
    // Layered shadow to simulate logo glow
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 28,
    elevation: 20,
  },
  sub: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3.5,
    textTransform: 'uppercase',
    color: 'rgba(196,181,253,0.75)',
    marginTop: 2,
  },
  bottomLabel: {
    position: 'absolute',
    bottom: 52,
  },
  bottomText: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.2)',
  },
});
