import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { colors } from '../../theme/colors';
import { useUIStore } from '../../store/uiStore';
import { MONAD_TESTNET } from '../../lib/monadChain';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, ArrowUpRight, X } from 'lucide-react-native';

export function ToastBanner() {
  const { activeToast, hideToast } = useUIStore();

  if (!activeToast) return null;

  const getVisuals = () => {
    switch (activeToast.type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={18} color={colors.success} />,
          border: 'rgba(0, 212, 170, 0.4)',
          bg: '#0F231F',
        };
      case 'error':
        return {
          icon: <AlertCircle size={18} color={colors.error} />,
          border: 'rgba(239, 68, 68, 0.4)',
          bg: '#251214',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={18} color={colors.warning} />,
          border: 'rgba(245, 158, 11, 0.4)',
          bg: '#251E11',
        };
      case 'info':
      default:
        return {
          icon: <Info size={18} color={colors.primaryLight} />,
          border: 'rgba(131, 110, 249, 0.4)',
          bg: '#17142A',
        };
    }
  };

  const visual = getVisuals();

  return (
    <View style={styles.outerWrap} pointerEvents="box-none">
      <View
        style={[
          styles.container,
          {
            backgroundColor: visual.bg,
            borderColor: visual.border,
          },
        ]}
      >
        <View style={styles.iconCol}>{visual.icon}</View>

        <View style={styles.textCol}>
          <Text style={styles.title}>{activeToast.title}</Text>
          {activeToast.message ? (
            <Text style={styles.message}>{activeToast.message}</Text>
          ) : null}
          {activeToast.txHash ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                Linking.openURL(
                  `${MONAD_TESTNET.blockExplorers.default.url}/tx/${activeToast.txHash}`
                )
              }
              style={styles.txLink}
            >
              <Text style={styles.txLinkText}>View on Explorer</Text>
              <ArrowUpRight size={11} color={colors.primaryLight} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity activeOpacity={0.7} onPress={hideToast} style={styles.closeBtn}>
          <X size={14} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    gap: 10,
  },
  iconCol: {
    marginTop: 2,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  message: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  txLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  txLinkText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  closeBtn: {
    padding: 2,
  },
});
