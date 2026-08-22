import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'subtle' | 'glow' | 'accentGlow';
  onPress?: () => void;
}

export function AppCard({
  children,
  style,
  variant = 'default',
  onPress,
}: AppCardProps) {
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 16,
    };

    switch (variant) {
      case 'elevated':
        base.backgroundColor = colors.cardElevated;
        base.borderColor = colors.borderLight;
        base.shadowColor = '#000';
        base.shadowOffset = { width: 0, height: 4 };
        base.shadowOpacity = 0.3;
        base.shadowRadius = 10;
        base.elevation = 4;
        break;
      case 'subtle':
        base.backgroundColor = colors.cardSubtle;
        base.borderColor = 'transparent';
        break;
      case 'glow':
        base.borderColor = colors.primary;
        base.shadowColor = colors.primary;
        base.shadowOffset = { width: 0, height: 0 };
        base.shadowOpacity = 0.25;
        base.shadowRadius = 12;
        base.elevation = 6;
        break;
      case 'accentGlow':
        base.borderColor = colors.success;
        base.shadowColor = colors.success;
        base.shadowOffset = { width: 0, height: 0 };
        base.shadowOpacity = 0.2;
        base.shadowRadius = 10;
        base.elevation = 4;
        break;
    }

    return base;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[getContainerStyle(), style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getContainerStyle(), style]}>{children}</View>;
}
