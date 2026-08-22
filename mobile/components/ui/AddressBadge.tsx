import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import { formatAddress } from '../../lib/format';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Copy, Check } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';

interface AddressBadgeProps {
  address?: string | null;
  start?: number;
  end?: number;
  showCopy?: boolean;
}

export function AddressBadge({
  address,
  start = 6,
  end = 4,
  showCopy = true,
}: AddressBadgeProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useUIStore();

  if (!address) return null;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(address);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setCopied(true);
    showToast({
      title: 'Address Copied',
      message: `${address.slice(0, 10)}... copied to clipboard`,
      type: 'info',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handleCopy}
      style={styles.container}
    >
      <Text style={styles.addressText}>{formatAddress(address, start, end)}</Text>
      {showCopy ? (
        <View style={styles.iconContainer}>
          {copied ? (
            <Check size={12} color={colors.success} />
          ) : (
            <Copy size={12} color={colors.textMuted} />
          )}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  addressText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  iconContainer: {
    marginLeft: 6,
  },
});
