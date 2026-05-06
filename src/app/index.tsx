import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mic, ListMusic } from 'lucide-react-native';
import { BrandLogo } from '../presentation/components/BrandLogo';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <View className="items-center mt-8 mb-12">
          <View className="bg-primary p-6 rounded-3xl w-full items-center shadow-lg shadow-primary/20">
            <BrandLogo />
            <Text className="text-white/80 mt-3 font-medium tracking-widest text-xs uppercase">
              Ambient Recorder
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => router.push('/recorder')}
          activeOpacity={0.8}
          className="bg-primary rounded-3xl p-6 mb-6 flex-row items-center justify-between shadow-lg shadow-primary/30"
        >
          <View>
            <Text className="text-white font-semibold text-xl mb-1">Start Recording</Text>
            <Text className="text-white/70 text-sm">Capture new ambient audio</Text>
          </View>
          <View className="bg-white/20 p-4 rounded-full">
            <Mic color="white" size={28} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/recordings')}
          activeOpacity={0.7}
          className="bg-white rounded-3xl p-6 mb-10 flex-row items-center justify-between shadow-sm border border-gray-100"
        >
          <View>
            <Text className="text-text font-semibold text-xl mb-1">View Recordings</Text>
            <Text className="text-textSecondary text-sm">Review your past sessions</Text>
          </View>
          <View className="bg-gray-100 p-4 rounded-full">
            <ListMusic color="#3e1f75" size={28} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
