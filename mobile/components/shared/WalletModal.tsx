import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppCard } from '../ui/AppCard';
import { AppButton } from '../ui/AppButton';
import { BlockieAvatar } from '../ui/BlockieAvatar';
import { AddressBadge } from '../ui/AddressBadge';
import { useWallet } from '../../hooks/useWallet';
import { useUIStore } from '../../store/uiStore';
import { formatAddress } from '../../lib/format';
import * as Clipboard from 'expo-clipboard';
import { safeHaptics } from '../../lib/haptics';
import { X, Wallet, Key, Check, Sparkles, Plus, Copy, Eye, EyeOff } from 'lucide-react-native';

export function WalletModal() {
  const { isWalletModalOpen, closeWalletModal, showToast } = useUIStore();
  const {
    address,
    privateKey,
    isConnected,
    demoAccounts,
    activeDemoAccount,
    switchAccount,
    connectCustomPrivateKey,
    generateNewWallet,
    disconnect,
    balanceMON,
  } = useWallet();

  const [tab, setTab] = useState<'create' | 'import' | 'test'>('create');
  const [customKey, setCustomKey] = useState('');
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);

  if (!isWalletModalOpen) return null;

  const handleCreateNew = async () => {
    try {
      await generateNewWallet();
      closeWalletModal();
    } catch {
      setError('Could not generate wallet');
    }
  };

  const handleCustomKeyConnect = async () => {
    if (!customKey.trim()) {
      setError('Please enter a private key');
      return;
    }
    try {
      await connectCustomPrivateKey(customKey.trim());
      setCustomKey('');
      setError('');
      closeWalletModal();
      showToast({
        title: 'Wallet Imported!',
        type: 'success',
      });
    } catch {
      setError('Invalid private key format (must be 64-character hex)');
    }
  };

  const handleCopyAddress = async () => {
    if (!address) return;
    await Clipboard.setStringAsync(address);
    safeHaptics.light();
    showToast({
      title: 'Address Copied!',
      message: address,
      type: 'success',
    });
  };

  const handleCopyPrivateKey = async () => {
    if (!privateKey) return;
    await Clipboard.setStringAsync(privateKey);
    safeHaptics.warning();
    showToast({
      title: 'Private Key Copied!',
      message: 'Keep this private key safe and do not share publicly.',
      type: 'warning',
    });
  };

  return (
    <Modal
      visible={isWalletModalOpen}
      transparent
      animationType="fade"
      onRequestClose={closeWalletModal}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Wallet size={20} color={colors.primaryLight} />
              <Text style={styles.title}>Monad Testnet Wallet</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={closeWalletModal}
              style={styles.closeBtn}
            >
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Connected Account Summary */}
          {isConnected && address ? (
            <AppCard style={styles.activeAccountCard} variant="glow">
              <View style={styles.activeRow}>
                <BlockieAvatar address={address} size={40} />
                <View style={styles.activeInfo}>
                  <Text style={styles.activeName}>
                    {activeDemoAccount?.name || 'In-App Monad Wallet'}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleCopyAddress}
                    style={styles.copyAddrRow}
                  >
                    <AddressBadge address={address} start={6} end={4} />
                    <Copy size={12} color={colors.primaryLight} />
                  </TouchableOpacity>
                </View>
                <View style={styles.balCol}>
                  <Text style={styles.balVal}>{balanceMON} MON</Text>
                  <Text style={styles.balNet}>Monad Testnet</Text>
                </View>
              </View>

              {privateKey ? (
                <View style={styles.exportKeyWrap}>
                  <View style={styles.exportKeyRow}>
                    <Text style={styles.exportKeyLabel}>Private Key</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowKey(!showKey)}
                      style={styles.showKeyBtn}
                    >
                      {showKey ? <EyeOff size={12} color={colors.textMuted} /> : <Eye size={12} color={colors.textMuted} />}
                      <Text style={styles.showKeyText}>{showKey ? 'Hide' : 'Reveal'}</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleCopyPrivateKey}
                    style={styles.keyBox}
                  >
                    <Text style={styles.keyText} numberOfLines={1}>
                      {showKey ? privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••'}
                    </Text>
                    <Copy size={13} color={colors.primaryLight} />
                  </TouchableOpacity>
                </View>
              ) : null}
            </AppCard>
          ) : null}

          {/* Tab Switcher */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTab('create')}
              style={[styles.tabBtn, tab === 'create' && styles.tabBtnActive]}
            >
              <Plus size={14} color={tab === 'create' ? colors.primaryLight : colors.textMuted} />
              <Text style={[styles.tabText, tab === 'create' && styles.tabTextActive]}>
                New Wallet
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTab('import')}
              style={[styles.tabBtn, tab === 'import' && styles.tabBtnActive]}
            >
              <Key size={14} color={tab === 'import' ? colors.primaryLight : colors.textMuted} />
              <Text style={[styles.tabText, tab === 'import' && styles.tabTextActive]}>
                Import Key
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTab('test')}
              style={[styles.tabBtn, tab === 'test' && styles.tabBtnActive]}
            >
              <Sparkles size={14} color={tab === 'test' ? colors.primaryLight : colors.textMuted} />
              <Text style={[styles.tabText, tab === 'test' && styles.tabTextActive]}>
                Test Personas
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {tab === 'create' ? (
            <View style={styles.createTabWrap}>
              <Text style={styles.tabHelper}>
                Generate a fresh, secure in-app Monad testnet wallet with a private key stored locally on your device.
              </Text>
              <AppButton
                title="Generate New In-App Wallet"
                onPress={handleCreateNew}
                variant="primary"
                size="md"
                icon={<Plus size={16} color="#FFFFFF" />}
                fullWidth
              />
            </View>
          ) : tab === 'import' ? (
            <View style={styles.customWrap}>
              <Text style={styles.customLabel}>Paste 64-char EVM Private Key</Text>
              <TextInput
                style={styles.keyInput}
                placeholder="0x..."
                placeholderTextColor={colors.textMuted}
                value={customKey}
                onChangeText={(t) => {
                  setCustomKey(t);
                  setError('');
                }}
                autoCapitalize="none"
                secureTextEntry
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <AppButton
                title="Import Wallet"
                onPress={handleCustomKeyConnect}
                variant="primary"
                size="md"
                fullWidth
              />
            </View>
          ) : (
            <ScrollView style={styles.demoList} showsVerticalScrollIndicator={false}>
              <Text style={styles.demoHelper}>
                Quickly switch test personas to simulate multiple friends paying:
              </Text>
              {demoAccounts.map((acc) => {
                const isCurrent = address?.toLowerCase() === acc.address.toLowerCase();
                return (
                  <TouchableOpacity
                    key={acc.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      switchAccount(acc);
                      closeWalletModal();
                    }}
                    style={[styles.demoRow, isCurrent && styles.demoRowActive]}
                  >
                    <BlockieAvatar address={acc.address} seed={acc.avatarSeed} size={36} />
                    <View style={styles.demoInfo}>
                      <View style={styles.demoNameRow}>
                        <Text style={styles.demoName}>{acc.name}</Text>
                        <Text style={styles.demoRole}>• {acc.role}</Text>
                      </View>
                      <Text style={styles.demoAddress}>{formatAddress(acc.address, 6, 4)}</Text>
                    </View>
                    {isCurrent ? (
                      <View style={styles.checkCircle}>
                        <Check size={14} color="#0A0A0F" strokeWidth={3} />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Footer Actions */}
          <View style={styles.footer}>
            {isConnected ? (
              <AppButton
                title="Disconnect Current Account"
                onPress={() => {
                  disconnect();
                  closeWalletModal();
                }}
                variant="danger"
                size="sm"
                fullWidth
              />
            ) : null}
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
    padding: 20,
    maxHeight: '85%',
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  activeAccountCard: {
    padding: 12,
    backgroundColor: '#161624',
    gap: 8,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activeInfo: {
    flex: 1,
    gap: 2,
  },
  activeName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  copyAddrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balCol: {
    alignItems: 'flex-end',
  },
  balVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  balNet: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
  },
  exportKeyWrap: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 6,
  },
  exportKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exportKeyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  showKeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  showKeyText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  keyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0A0F',
    borderWidth: 1,
    borderColor: '#1E1E2E',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  keyText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.primaryLight,
    flex: 1,
    marginRight: 6,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: 'rgba(131, 110, 249, 0.15)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  createTabWrap: {
    paddingVertical: 12,
    gap: 12,
  },
  tabHelper: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
  customWrap: {
    gap: 10,
    paddingVertical: 8,
  },
  customLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  keyInput: {
    backgroundColor: '#0A0A0F',
    borderWidth: 1,
    borderColor: '#1E1E2E',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
  },
  demoList: {
    maxHeight: 220,
  },
  demoHelper: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E1E2E',
    marginBottom: 8,
    gap: 10,
  },
  demoRowActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(131, 110, 249, 0.08)',
  },
  demoInfo: {
    flex: 1,
    gap: 2,
  },
  demoNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  demoName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  demoRole: {
    fontSize: 11,
    color: colors.textMuted,
  },
  demoAddress: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 4,
  },
});