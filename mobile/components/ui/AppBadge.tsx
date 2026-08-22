import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface AppBadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function AppBadge({
  label,
  variant = 'primary',
  size = 'md',
  style,
  icon,
}: AppBadgeProps) {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'rgba(0, 212, 170, 0.15)',
          border: 'rgba(0, 212, 170, 0.35)',
          text: colors.success,
        };
      case 'warning':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.35)',
          text: colors.warning,
        };
      case 'error':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.35)',
          text: colors.error,
        };
      case 'neutral':
        return {
          bg: 'rgba(139, 139, 167, 0.15)',
          border: 'rgba(139, 139, 167, 0.3)',
          text: colors.textSecondary,
        };
      case 'primary':
      default:
        return {
          bg: 'rgba(131, 110, 249, 0.15)',
          border: 'rgba(131, 110, 249, 0.35)',
          text: colors.primaryLight,
        };
    }
  };

  const scheme = getBadgeStyle();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: scheme.bg,
          borderColor: scheme.border,
          paddingVertical: isSm ? 3 : 5,
          paddingHorizontal: isSm ? 8 : 12,
        },
        style,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text
        style={[
          styles.text,
          {
            color: scheme.text,
            fontSize: isSm ? 11 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 5,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
