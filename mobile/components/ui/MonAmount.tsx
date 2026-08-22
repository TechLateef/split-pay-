import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { formatUSD } from '../../lib/format';

interface MonAmountProps {
  amount: string | number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showUSD?: boolean;
  color?: string;
  style?: ViewStyle;
}

export function MonAmount({
  amount,
  size = 'md',
  showUSD = true,
  color,
  style,
}: MonAmountProps) {
  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return 14;
      case 'lg':
        return 22;
      case 'xl':
        return 32;
      case 'md':
      default:
        return 17;
    }
  };

  const fontSize = getFontSize();
  const primaryColor = color || colors.primaryLight;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.monRow}>
        <Text
          style={[
            styles.amountText,
            {
              fontSize,
              color: primaryColor,
            },
          ]}
        >
          {amount}
        </Text>
        <Text
          style={[
            styles.symbolText,
            {
              fontSize: Math.max(11, fontSize * 0.55),
              color: primaryColor,
            },
          ]}
        >
          MON
        </Text>
      </View>
      {showUSD ? (
        <Text
          style={[
            styles.usdText,
            {
              fontSize: Math.max(10, fontSize * 0.48),
            },
          ]}
        >
          ≈ {formatUSD(amount)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  monRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  amountText: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  symbolText: {
    fontWeight: '700',
    opacity: 0.85,
  },
  usdText: {
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
});
