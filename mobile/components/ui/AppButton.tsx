import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  StyleProp,
} from 'react-native';
import { colors } from '../../theme/colors';
import { safeHaptics } from '../../lib/haptics';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost' | 'monad';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: AppButtonProps) {
  const handlePress = () => {
    if (disabled || isLoading) return;
    safeHaptics.light();
    onPress();
  };

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      width: fullWidth ? '100%' : undefined,
    };

    // Sizes
    if (size === 'sm') {
      base.paddingVertical = 8;
      base.paddingHorizontal = 14;
    } else if (size === 'lg') {
      base.paddingVertical = 16;
      base.paddingHorizontal = 24;
      base.borderRadius = 16;
    } else {
      base.paddingVertical = 12;
      base.paddingHorizontal = 18;
    }

    // Variants
    switch (variant) {
      case 'primary':
        base.backgroundColor = colors.primary;
        base.shadowColor = colors.primary;
        base.shadowOffset = { width: 0, height: 4 };
        base.shadowOpacity = 0.35;
        base.shadowRadius = 8;
        base.elevation = 6;
        break;
      case 'success':
        base.backgroundColor = colors.success;
        base.shadowColor = colors.success;
        base.shadowOffset = { width: 0, height: 4 };
        base.shadowOpacity = 0.3;
        base.shadowRadius = 8;
        base.elevation = 6;
        break;
      case 'danger':
        base.backgroundColor = colors.error;
        base.shadowColor = colors.error;
        base.shadowOffset = { width: 0, height: 4 };
        base.shadowOpacity = 0.3;
        base.shadowRadius = 8;
        base.elevation = 6;
        break;
      case 'secondary':
        base.backgroundColor = colors.cardElevated;
        base.borderWidth = 1;
        base.borderColor = colors.border;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = colors.primary;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
    }

    if (disabled) {
      base.opacity = 0.45;
      base.shadowOpacity = 0;
      base.elevation = 0;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: '700',
      textAlign: 'center',
    };

    if (size === 'sm') {
      base.fontSize = 13;
    } else if (size === 'lg') {
      base.fontSize = 16;
    } else {
      base.fontSize = 14;
    }

    switch (variant) {
      case 'primary':
      case 'danger':
        base.color = '#FFFFFF';
        break;
      case 'success':
        base.color = '#0A0A0F';
        break;
      case 'secondary':
        base.color = colors.textPrimary;
        break;
      case 'outline':
        base.color = colors.primary;
        break;
      case 'ghost':
        base.color = colors.textSecondary;
        break;
    }

    return base;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || isLoading}
      style={[getContainerStyle(), style]}
    >
      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator
            size="small"
            color={variant === 'success' ? '#0A0A0F' : '#FFFFFF'}
          />
          {loadingText ? (
            <Text style={[getTextStyle(), styles.loadingText, textStyle]}>
              {loadingText}
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    marginLeft: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
});
