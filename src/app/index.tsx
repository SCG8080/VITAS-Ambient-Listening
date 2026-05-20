import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, LayoutGrid } from 'lucide-react-native';
import { ScreenBackground } from '../presentation/components/ScreenBackground';
import { GlassCard } from '../presentation/components/GlassCard';
import { BrandLogo } from '../presentation/components/BrandLogo';
import { RecordingListItem } from '../presentation/components/RecordingListItem';
import { useRecordingStore } from '../store/recordingStore';
import { formatDurationMs } from '../utils/duration';
import { C, FS, G, R, S } from '../presentation/theme';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recordings = useRecordingStore(s => s.recordings);

  const totalMs = recordings.reduce((sum, r) => sum + r.durationMs, 0);
  const uploadedCount = recordings.filter(r => r.uploadStatus === 'uploaded').length;
  const recent = recordings.length > 0 ? [...recordings].reverse().slice(0, 5) : null;

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground variant="home" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: S.md, paddingBottom: insets.bottom + 24, gap: S.sm }}
      >
        {/* Brand row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 1, paddingBottom: S.xs, marginTop: 4 }}>
          <View>
            <Text style={{ fontSize: FS.h1, fontWeight: '800', letterSpacing: -0.5, color: C.textPrimary }}>VITAS</Text>
            <Text style={{ fontSize: 8, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', color: C.violetDim, marginTop: 1 }}>
              Ambient Recorder
            </Text>
          </View>
          <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: G.icon[0], alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(167,139,250,0.4)' }}>
            <BrandLogo width={16} height={16} />
          </View>
        </View>

        {/* Primary CTA — Start Recording */}
        <TouchableOpacity onPress={() => router.push('/recorder')} activeOpacity={0.85}>
          <LinearGradient
            colors={G.cta}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={{
              borderRadius: R.card,
              borderCurve: 'continuous',
              padding: S.lg,
              flexDirection: 'row',
              alignItems: 'center',
              gap: S.md,
              borderWidth: 1,
              borderColor: 'rgba(139,92,246,0.3)',
              boxShadow: '0 8px 28px rgba(124,58,237,0.5)',
              overflow: 'hidden',
            } as any}
          >
            {/* Inset top highlight */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 22, backgroundColor: 'rgba(255,255,255,0.11)', borderTopLeftRadius: R.card, borderTopRightRadius: R.card }} pointerEvents="none" />
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: 'white' }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FS.h2, fontWeight: '700', letterSpacing: -0.2, color: 'white' }}>Start Recording</Text>
              <Text style={{ fontSize: FS.body, fontWeight: '500', color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Tap to capture ambient audio</Text>
            </View>
            <ChevronRight size={14} color="rgba(255,255,255,0.55)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Secondary CTA — My Recordings */}
        <TouchableOpacity onPress={() => router.push('/recordings')} activeOpacity={0.75}>
          <GlassCard padding={0}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm, padding: S.md }}>
              <View style={{ width: 34, height: 34, borderRadius: R.el, borderCurve: 'continuous', backgroundColor: C.chipBg, borderWidth: 1, borderColor: C.chipBorder, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LayoutGrid size={14} color={C.violet} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FS.h2, fontWeight: '700', letterSpacing: -0.2, color: C.textPrimary }}>My Recordings</Text>
                <Text style={{ fontSize: FS.body, fontWeight: '500', color: C.textSecondary, marginTop: 2 }}>
                  {recordings.length} session{recordings.length !== 1 ? 's' : ''} saved
                </Text>
              </View>
              <ChevronRight size={10} color="rgba(255,255,255,0.2)" />
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* Stats — ONE card, columns with vdividers */}
        <GlassCard padding={0}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: S.md }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 17, fontWeight: '800', letterSpacing: -0.5, color: C.textPrimary }}>{recordings.length}</Text>
              <Text style={{ fontSize: 8.5, fontWeight: '600', letterSpacing: 0.3, color: C.violetDim, marginTop: 2 }}>Sessions</Text>
            </View>
            <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 17, fontWeight: '800', letterSpacing: -0.5, color: C.textPrimary }}>{formatDurationMs(totalMs)}</Text>
              <Text style={{ fontSize: 8.5, fontWeight: '600', letterSpacing: 0.3, color: C.violetDim, marginTop: 2 }}>Recorded</Text>
            </View>
            <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 17, fontWeight: '800', letterSpacing: -0.5, color: C.textPrimary }}>{uploadedCount}</Text>
              <Text style={{ fontSize: 8.5, fontWeight: '600', letterSpacing: 0.3, color: C.violetDim, marginTop: 2 }}>Uploaded</Text>
            </View>
          </View>
        </GlassCard>

        {/* Recent */}
        {recent && (
          <>
            <Text style={{ fontSize: FS.micro, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase', color: C.violetDim, paddingHorizontal: 2 }}>
              Recent
            </Text>
            {recent.map(r => (
              <RecordingListItem key={r.id} session={r} onPress={() => router.push(`/recordings/${r.id}`)} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
