import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Pause, Play, Square } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RecordingStatus } from '../../domain/entities/RecordingStatus';
import { C, G, R } from '../theme';

interface Props {
  status: RecordingStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

// Idle — single centered record button
function IdleButton({ onStart }: { onStart: () => void }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow rings */}
      <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(124,58,237,0.06)', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 78, height: 78, borderRadius: 39, backgroundColor: 'rgba(124,58,237,0.10)', alignItems: 'center', justifyContent: 'center' }}>
          <TouchableOpacity onPress={onStart} activeOpacity={0.85}>
            <LinearGradient
              colors={G.record}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={{
                width: 68,
                height: 68,
                borderRadius: 34,
                borderCurve: 'continuous',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(167,139,250,0.45)',
                boxShadow: '0 8px 30px rgba(124,58,237,0.6)',
              } as any}
            >
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'white' }} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Recording / Paused — pause|resume + record indicator + stop
function ActiveButtons({ status, onPause, onResume, onStop }: Pick<Props, 'status' | 'onPause' | 'onResume' | 'onStop'>) {
  const isPaused = status === 'paused';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
      {/* Pause / Resume */}
      <TouchableOpacity
        onPress={isPaused ? onResume : onPause}
        activeOpacity={0.75}
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          borderCurve: 'continuous',
          backgroundColor: 'rgba(255,255,255,0.07)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.11)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isPaused
          ? <Play size={16} color={C.violet} fill={C.violet} />
          : <Pause size={16} color={C.violet} fill={C.violet} />}
      </TouchableOpacity>

      {/* Central record indicator — glowing ring */}
      <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(124,58,237,0.06)', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 78, height: 78, borderRadius: 39, backgroundColor: 'rgba(124,58,237,0.10)', alignItems: 'center', justifyContent: 'center' }}>
          <LinearGradient
            colors={G.record}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={{
              width: 68,
              height: 68,
              borderRadius: 34,
              borderCurve: 'continuous',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(167,139,250,0.45)',
              boxShadow: '0 8px 30px rgba(124,58,237,0.6)',
            } as any}
          >
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'white' }} />
          </LinearGradient>
        </View>
      </View>

      {/* Stop */}
      <TouchableOpacity
        onPress={onStop}
        activeOpacity={0.75}
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          borderCurve: 'continuous',
          backgroundColor: C.redBg,
          borderWidth: 1,
          borderColor: C.redBorder,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Square size={14} color={C.red} fill={C.red} />
      </TouchableOpacity>
    </View>
  );
}

export function RecorderControls({ status, onStart, onPause, onResume, onStop }: Props) {
  if (status === 'idle' || status === 'stopped') {
    return <IdleButton onStart={onStart} />;
  }
  return <ActiveButtons status={status} onPause={onPause} onResume={onResume} onStop={onStop} />;
}
