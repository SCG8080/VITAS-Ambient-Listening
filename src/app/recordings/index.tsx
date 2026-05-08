import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Inbox, Search } from 'lucide-react-native';
import { ScreenBackground } from '../../presentation/components/ScreenBackground';
import { GlassCard } from '../../presentation/components/GlassCard';
import { RecordingListItem } from '../../presentation/components/RecordingListItem';
import { useRecordingStore } from '../../store/recordingStore';
import { C, FS, R, S } from '../../presentation/theme';

export default function RecordingsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recordings = useRecordingStore(s => s.recordings);
  const [query, setQuery] = useState('');

  const sorted = [...recordings].reverse();
  const filtered = query.trim()
    ? sorted.filter(r => r.title.toLowerCase().includes(query.toLowerCase()))
    : sorted;

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground variant="list" />

      {/* Header */}
      <View style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: S.md,
        paddingBottom: S.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: S.sm,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.chipBg, borderWidth: 1, borderColor: C.chipBorder, alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronLeft size={16} color={C.violet} />
        </TouchableOpacity>

        <Text style={{ flex: 1, fontSize: FS.h2, fontWeight: '700', letterSpacing: -0.2, color: C.textPrimary }}>
          My Recordings
        </Text>

        {recordings.length > 0 && (
          <View style={{ backgroundColor: C.chipBg, borderWidth: 1, borderColor: C.chipBorder, borderRadius: R.chip, paddingHorizontal: 9, paddingVertical: 3 }}>
            <Text style={{ fontSize: FS.micro, fontWeight: '700', color: C.textAccent }}>{recordings.length}</Text>
          </View>
        )}
      </View>

      {/* Search bar */}
      {recordings.length > 0 && (
        <View style={{ paddingHorizontal: S.md, paddingBottom: S.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: C.surfaceBorder, borderRadius: R.el, borderCurve: 'continuous', paddingHorizontal: S.md, paddingVertical: 9 } as any}>
            <Search size={13} color={C.textSecondary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search recordings…"
              placeholderTextColor={C.textSecondary}
              style={{ flex: 1, fontSize: FS.body, fontWeight: '500', color: C.textPrimary }}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>
      )}

      {sorted.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: S.md, paddingBottom: 60 }}>
          <GlassCard padding={S.xxl} style={{ alignItems: 'center', width: '100%' }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: C.chipBg, borderWidth: 1, borderColor: C.chipBorder, alignItems: 'center', justifyContent: 'center', marginBottom: S.md }}>
              <Inbox size={22} color={C.violetDim} />
            </View>
            <Text style={{ fontSize: FS.h2, fontWeight: '700', color: C.textPrimary, marginBottom: 6 }}>No recordings yet</Text>
            <Text style={{ fontSize: FS.body, color: C.textSecondary, textAlign: 'center', lineHeight: 17 }}>
              Start your first ambient recording from the home screen.
            </Text>
          </GlassCard>
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: S.md, paddingBottom: 60 }}>
          <Text style={{ fontSize: FS.body, color: C.textSecondary }}>No results for "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingHorizontal: S.md, paddingBottom: insets.bottom + 24, gap: S.xs }}
          renderItem={({ item }) => (
            <RecordingListItem session={item} onPress={() => router.push(`/recordings/${item.id}`)} />
          )}
        />
      )}
    </View>
  );
}
