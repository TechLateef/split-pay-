import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { QueryProvider } from '../providers/QueryProvider';
import { Web3Provider } from '../providers/Web3Provider';
import { WalletModal } from '../components/shared/WalletModal';
import { WrongNetworkSheet } from '../components/shared/WrongNetworkSheet';
import { ToastBanner } from '../components/shared/ToastBanner';
import { colors } from '../theme/colors';

export default function RootLayout() {
  return (
    <QueryProvider>
      <Web3Provider>
        <View style={styles.container}>
          <StatusBar style="light" />
          <ToastBanner />
          <WalletModal />
          <WrongNetworkSheet />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="bill/[address]" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="how-it-works" options={{ headerShown: false }} />
          </Stack>
        </View>
      </Web3Provider>
    </QueryProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
