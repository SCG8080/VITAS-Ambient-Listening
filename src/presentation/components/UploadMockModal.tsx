import React, { useEffect } from 'react';
import { View, Text, Modal, ActivityIndicator } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface UploadMockModalProps {
  visible: boolean;
  status: 'uploading' | 'uploaded' | 'not_uploaded' | 'failed';
  onClose: () => void;
}

export function UploadMockModal({ visible, status, onClose }: UploadMockModalProps) {
  useEffect(() => {
    if (status === 'uploaded') {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 items-center justify-center px-4">
        <Animated.View 
          entering={FadeIn}
          exiting={FadeOut}
          className="bg-white w-full max-w-sm rounded-3xl p-8 items-center shadow-xl"
        >
          {status === 'uploading' ? (
            <>
              <ActivityIndicator size="large" color="#3e1f75" className="mb-4" />
              <Text className="text-xl font-semibold text-text mb-2">Uploading...</Text>
              <Text className="text-center text-textSecondary">
                Securely sending your recording to VITAS servers.
              </Text>
            </>
          ) : status === 'uploaded' ? (
            <>
              <CheckCircle size={64} color="#10B981" className="mb-4" />
              <Text className="text-xl font-semibold text-text mb-2">Success!</Text>
              <Text className="text-center text-textSecondary">
                Recording uploaded successfully.
              </Text>
            </>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}
