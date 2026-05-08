import React, { useEffect } from 'react';
import { View, Text, Modal, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { C, R } from '../theme';

interface Props {
  visible: boolean;
  status: 'uploading' | 'uploaded' | 'not_uploaded' | 'failed';
  onClose: () => void;
}

export function UploadMockModal({ visible, status, onClose }: Props) {
  useEffect(() => {
    if (status === 'uploaded') {
      const t = setTimeout(onClose, 2000);
      return () => clearTimeout(t);
    }
  }, [status, onClose]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={{
            width: '100%',
            maxWidth: 320,
            backgroundColor: '#1A0E2E',
            borderRadius: R.card,
            borderCurve: 'continuous',
            borderWidth: 1,
            borderColor: C.surfaceBorder,
            padding: 32,
            alignItems: 'center',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          } as any}
        >
          {status === 'uploading' && (
            <>
              <ActivityIndicator size="large" color={C.violet} style={{ marginBottom: 16 }} />
              <Text style={{ fontSize: 18, fontWeight: '700', color: C.textPrimary, marginBottom: 8 }}>
                Uploading…
              </Text>
              <Text style={{ fontSize: 13, color: C.textSecondary, textAlign: 'center', lineHeight: 19 }}>
                Securely sending your recording to VITAS servers.
              </Text>
            </>
          )}
          {status === 'uploaded' && (
            <>
              <View style={{
                width: 64, height: 64, borderRadius: 32, borderCurve: 'continuous',
                backgroundColor: C.greenBg, borderWidth: 1, borderColor: C.greenBorder,
                alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <Text style={{ fontSize: 28 }}>✓</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: C.textPrimary, marginBottom: 8 }}>
                Success!
              </Text>
              <Text style={{ fontSize: 13, color: C.textSecondary, textAlign: 'center', lineHeight: 19 }}>
                Recording uploaded successfully.
              </Text>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}
