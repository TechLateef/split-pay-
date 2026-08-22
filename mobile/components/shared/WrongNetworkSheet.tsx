import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { AppButton } from '../ui/AppButton';
import { useUIStore } from '../../store/uiStore';
import { MONAD_TESTNET } from '../../lib/monadChain';
import { AlertTriangle, Zap } from 'lucide-react-native';

export function WrongNetworkSheet() {
  const { isWrongNetworkModalOpen, closeWrongNetworkModal } = useUIStore();

  if (!isWrongNetworkModalOpen) return null;

  return (
    <Modal
      visible={isWrongNetworkModalOpen}
      transparent
      animationType="slide"
      onRequestClose={closeWrongNetworkModal}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.iconCircle}>
            <AlertTriangle size={32} color={colors.warning} />
          </View>

          <Text style={styles.title}>Switch to Monad Testnet</Text>
          <Text style={styles.description}>
            SplitPay requires the Monad Testnet for sub-second 0.6s finality and near-zero gas fees.
          </Text>

          <View style={styles.networkInfoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Network</Text>
              <Text style={styles.infoVal}>Monad Testnet</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Chain ID</Text>
              <Text style={styles.infoVal}>10143</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Currency</Text>
              <Text style={styles.infoVal}>MON</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>RPC URL</Text>
              <Text style={styles.infoVal}>testnet-rpc.monad.xyz</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <AppButton
              title="Switch Network"
              onPress={closeWrongNetworkModal}
              variant="primary"
              size="lg"
              icon={<Zap size={18} color="#FFFFFF" />}
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 8, 0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#12121B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1E1E2E',
    padding: 24,
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  networkInfoCard: {
    width: '100%',
    backgroundColor: '#0A0A0F',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E1E2E',
    padding: 14,
    gap: 8,
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoKey: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  infoVal: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  actions: {
    width: '100%',
    marginTop: 8,
  },
});
