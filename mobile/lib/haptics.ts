import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export const safeHaptics = {
  light: () => {
    if (Platform.OS === 'web') return;
    try {
      if (Haptics?.impactAsync && Haptics?.ImpactFeedbackStyle?.Light) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    } catch {}
  },
  medium: () => {
    if (Platform.OS === 'web') return;
    try {
      if (Haptics?.impactAsync && Haptics?.ImpactFeedbackStyle?.Medium) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
    } catch {}
  },
  heavy: () => {
    if (Platform.OS === 'web') return;
    try {
      if (Haptics?.impactAsync && Haptics?.ImpactFeedbackStyle?.Heavy) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      }
    } catch {}
  },
  success: () => {
    if (Platform.OS === 'web') return;
    try {
      if (Haptics?.notificationAsync && Haptics?.NotificationFeedbackType?.Success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch {}
  },
  warning: () => {
    if (Platform.OS === 'web') return;
    try {
      if (Haptics?.notificationAsync && Haptics?.NotificationFeedbackType?.Warning) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
    } catch {}
  },
  error: () => {
    if (Platform.OS === 'web') return;
    try {
      if (Haptics?.notificationAsync && Haptics?.NotificationFeedbackType?.Error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      }
    } catch {}
  },
};
