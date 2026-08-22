import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const memoryFallback: Record<string, string> = {};

export async function setItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  } catch {
    memoryFallback[key] = value;
  }
}

export async function getItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  } catch {
    return memoryFallback[key] || null;
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  } catch {
    delete memoryFallback[key];
  }
}
