import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useWallet } from '../../hooks/useWallet';
import { useBillsStore } from '../../store/billsStore';
import { AppCard } from '../../components/ui/AppCard';
import { AppButton } from '../../components/ui/AppButton';
import { BlockieAvatar } from '../../components/ui/BlockieAvatar';
import { AddressBadge } from '../../components/ui/AddressBadge';
import { MonAmount } from '../../components/ui/MonAmount';
import { MONAD_TESTNET } from '../../lib/monadChain';
import { router } from 'expo-router';
import {
  Wallet,
  Globe,
  ExternalLink,
  HelpCircle,
  Sparkles,
  Zap,
  Droplets,
  LogOut,
  Shield,
} from 'lucide-react-native';

export function ProfileScreen() {
  const {
    address,
    isConnected,
    balanceMON,
    activeDemoAccount,
    openWalletModal,
    disconnect,
  } = useWallet();

  const { getUserCreatedBills, getUserParticipantBills } = useBillsStore();
  const createdBills = getUserCreatedBills(address);
  const participantBills = getUserParticipantBills(address);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenHeading}>Wallet & Settings</Text>

        {/* Wallet Account Card */}
        <AppCard style={styles.walletCard} variant="glow">
          <View style={styles.accountHeader}>
            <BlockieAvatar
              address={address}
              seed={activeDemoAccount?.avatarSeed}
              size={56}
            />
            <View style={styles.accountInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.accountName}>
                  {activeDemoAccount?.name || 'My Web3 Wallet'}
                </Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>
                    {activeDemoAccount?.role || 'Connected'}
                  </Text>
                </View>
              </View>
              <AddressBadge address={address} start={8} end={6} />
            </View>
          </View>

          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Monad Testnet Balance</Text>
              <MonAmount amount={balanceMON} size="lg" />
            </View>
            <AppButton
              title="Switch Persona"
              onPress={openWalletModal}
              variant="secondary"
              size="sm"
              icon={<Sparkles size={14} color={colors.primaryLight} />}
            />
          </View>
        </AppCard>

        {/* Network & RPC Status */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Globe size={18} color={colors.primaryLight} />
            <Text style={styles.sectionTitle}>Network Status</Text>
          </View>

          <View style={styles.infoTable}>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Network</Text>
              <View style={styles.networkStatusPill}>
                <View style={styles.greenDot} />
                <Text style={styles.infoVal}>Monad Testnet</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Chain ID</Text>
              <Text style={styles.infoVal}>10143</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Block Finality</Text>
              <Text style={[styles.infoVal, { color: colors.success }]}>0.6 Seconds</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>RPC Endpoint</Text>
              <Text style={[styles.infoVal, styles.monoText]}>testnet-rpc.monad.xyz</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Linking.openURL(MONAD_TESTNET.blockExplorers.default.url)}
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>View Monad Testnet Explorer</Text>
            <ExternalLink size={14} color={colors.primaryLight} />
          </TouchableOpacity>
        </AppCard>

        {/* Testnet Faucet & Tools */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Droplets size={18} color="#38BDF8" />
            <Text style={styles.sectionTitle}>Monad Testnet Faucet</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Need testnet MON tokens for transactions? Request free testnet funds from the official Monad faucet.
          </Text>
          <AppButton
            title="Get Testnet MON"
            onPress={() => Linking.openURL(MONAD_TESTNET.faucetUrl)}
            variant="secondary"
            size="md"
            icon={<Droplets size={16} color="#38BDF8" />}
            fullWidth
          />
        </AppCard>

        {/* App Guides & About */}
        <AppCard style={styles.sectionCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/how-it-works')}
            style={styles.menuRow}
          >
            <View style={styles.menuLeft}>
              <HelpCircle size={18} color={colors.primaryLight} />
              <Text style={styles.menuTitle}>How SplitPay Works</Text>
            </View>
            <ExternalLink size={14} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/onboarding')}
            style={styles.menuRow}
          >
            <View style={styles.menuLeft}>
              <Zap size={18} color={colors.success} />
              <Text style={styles.menuTitle}>Revisit Onboarding Tour</Text>
            </View>
            <ExternalLink size={14} color={colors.textMuted} />
          </TouchableOpacity>
        </AppCard>

        {/* Disconnect Button */}
        {isConnected ? (
          <AppButton
            title="Disconnect Wallet"
            onPress={disconnect}
            variant="danger"
            size="lg"
            icon={<LogOut size={18} color="#FFFFFF" />}
            fullWidth
          />
        ) : null}

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>SplitPay v1.0.0 • Monad Hackathon 2026</Text>
          <Text style={styles.footerSub}>Powered by Monad 0.6s High-Performance EVM</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },
  screenHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  walletCard: {
    gap: 16,
    padding: 18,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  accountInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  roleBadge: {
    backgroundColor: 'rgba(131, 110, 249, 0.15)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  balanceLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  sectionCard: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  infoTable: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoKey: {
    fontSize: 13,
    color: colors.textMuted,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  monoText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.textSecondary,
  },
  networkStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.success,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  linkText: {
    fontSize: 13,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerNote: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  footerSub: {
    fontSize: 11,
    color: colors.primaryLight,
  },
});
