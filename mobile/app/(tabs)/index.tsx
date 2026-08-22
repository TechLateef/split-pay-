import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useWallet } from '../../hooks/useWallet';
import { useBillsStore } from '../../store/billsStore';
import { useUIStore } from '../../store/uiStore';
import { BlockieAvatar } from '../../components/ui/BlockieAvatar';
import { AddressBadge } from '../../components/ui/AddressBadge';
import { StatsRow } from '../../components/shared/StatsRow';
import { BillCard } from '../../components/bill/BillCard';
import { AppButton } from '../../components/ui/AppButton';
import { router } from 'expo-router';
import {
  Zap,
  Plus,
  Layers,
  Sparkles,
  Inbox,
  Send,
  HelpCircle,
} from 'lucide-react-native';

export default function DashboardScreen() {
  const { address, isConnected, activeDemoAccount, openWalletModal, refreshBalance, balanceMON } =
    useWallet();
  const { bills, getUserCreatedBills, getUserParticipantBills } = useBillsStore();
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created');
  const [refreshing, setRefreshing] = useState(false);

  const createdBills = getUserCreatedBills(address);
  const joinedBills = getUserParticipantBills(address);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshBalance();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Calculate aggregated stats
  const allUserBills = Object.values(bills);
  let totalPaidFloat = 0;
  let totalCollectedFloat = 0;
  let activeSplits = 0;

  allUserBills.forEach((b) => {
    if (b.status === 'Open') activeSplits++;
    const p = address
      ? b.participants.find((x) => x.address.toLowerCase() === address.toLowerCase())
      : null;
    if (p && p.hasPaid) {
      totalPaidFloat += parseFloat(p.amountMON) || 0;
    }
    if (address && b.creatorAddress.toLowerCase() === address.toLowerCase()) {
      totalCollectedFloat += parseFloat(b.totalCollectedMON) || 0;
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primaryLight}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandCol}>
            <View style={styles.brandRow}>
              <View style={styles.logoCircle}>
                <Zap size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.appName}>SplitPay</Text>
            </View>
            <View style={styles.monadPill}>
              <View style={styles.greenPulse} />
              <Text style={styles.monadPillText}>Monad 0.6s • Testnet</Text>
            </View>
          </View>

          {/* Right: Wallet Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={openWalletModal}
            style={styles.walletHeaderBtn}
          >
            {isConnected && address ? (
              <>
                <BlockieAvatar
                  address={address}
                  seed={activeDemoAccount?.avatarSeed}
                  size={32}
                />
                <View style={styles.walletHeaderInfo}>
                  <Text style={styles.walletHeaderName}>
                    {activeDemoAccount?.name?.split(' ')[0] || 'Wallet'}
                  </Text>
                  <Text style={styles.walletHeaderBal}>{balanceMON} MON</Text>
                </View>
              </>
            ) : (
              <AppButton
                title="Connect"
                onPress={openWalletModal}
                variant="primary"
                size="sm"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Demo Switcher Quick Bar */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openWalletModal}
          style={styles.personaBanner}
        >
          <Sparkles size={14} color={colors.primaryLight} />
          <Text style={styles.personaText}>
            Active Persona:{' '}
            <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
              {activeDemoAccount?.name || 'Custom Account'}
            </Text>{' '}
            ({activeDemoAccount?.role || 'Guest'})
          </Text>
          <Text style={styles.switchPrompt}>Switch</Text>
        </TouchableOpacity>

        {/* Stats Row */}
        <StatsRow
          totalSentMON={totalPaidFloat.toFixed(2)}
          totalReceivedMON={totalCollectedFloat.toFixed(2)}
          activeBillsCount={activeSplits}
        />

        {/* Tabs: Bills I Created vs Bills I'm In */}
        <View style={styles.tabsHeader}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('created')}
            style={[styles.tabButton, activeTab === 'created' && styles.tabButtonActive]}
          >
            <Send
              size={14}
              color={activeTab === 'created' ? colors.primaryLight : colors.textMuted}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'created' && styles.tabButtonTextActive,
              ]}
            >
              Created ({createdBills.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('joined')}
            style={[styles.tabButton, activeTab === 'joined' && styles.tabButtonActive]}
          >
            <Inbox
              size={14}
              color={activeTab === 'joined' ? colors.primaryLight : colors.textMuted}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'joined' && styles.tabButtonTextActive,
              ]}
            >
              Invited ({joinedBills.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* List Content */}
        {activeTab === 'created' ? (
          createdBills.length > 0 ? (
            <View style={styles.billsList}>
              {createdBills.map((b) => (
                <BillCard
                  key={b.address}
                  bill={b}
                  isCreatorView={true}
                  currentUserAddress={address}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Layers size={32} color={colors.primaryLight} />
              </View>
              <Text style={styles.emptyTitle}>No bills created yet</Text>
              <Text style={styles.emptySub}>
                Create an on-chain split on Monad in seconds.
              </Text>
              <AppButton
                title="Create First Bill"
                onPress={() => router.push('/(tabs)/create')}
                variant="primary"
                size="md"
                icon={<Plus size={16} color="#FFFFFF" />}
                style={{ marginTop: 12 }}
              />
            </View>
          )
        ) : joinedBills.length > 0 ? (
          <View style={styles.billsList}>
            {joinedBills.map((b) => (
              <BillCard
                key={b.address}
                bill={b}
                isCreatorView={false}
                currentUserAddress={address}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Inbox size={32} color={colors.primaryLight} />
            </View>
            <Text style={styles.emptyTitle}>No split invitations yet</Text>
            <Text style={styles.emptySub}>
              When friends add your address to a bill, it will appear right here.
            </Text>
          </View>
        )}

        {/* How It Works Explainer Banner */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/how-it-works')}
          style={styles.guideBanner}
        >
          <HelpCircle size={18} color={colors.primaryLight} />
          <View style={styles.guideTextWrap}>
            <Text style={styles.guideTitle}>Why SplitPay on Monad?</Text>
            <Text style={styles.guideSub}>
              Learn how 0.6s finality and sub-penny gas revolutionize group payments.
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  brandCol: {
    gap: 3,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  monadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(131, 110, 249, 0.12)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  monadPillText: {
    fontSize: 10,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  walletHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121B',
    borderWidth: 1,
    borderColor: '#1E1E2E',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 8,
  },
  walletHeaderInfo: {
    gap: 1,
  },
  walletHeaderName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  walletHeaderBal: {
    fontSize: 11,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  personaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131320',
    borderWidth: 1,
    borderColor: 'rgba(131, 110, 249, 0.25)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  personaText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  switchPrompt: {
    fontSize: 11,
    color: colors.primaryLight,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  tabsHeader: {
    flexDirection: 'row',
    backgroundColor: '#12121B',
    borderRadius: 12,
    padding: 4,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#1C1C2A',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabButtonTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  billsList: {
    gap: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: '#12121B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E1E2E',
    gap: 8,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(131, 110, 249, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  guideBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131320',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E1E2E',
    padding: 14,
    gap: 12,
    marginTop: 8,
  },
  guideTextWrap: {
    flex: 1,
    gap: 2,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  guideSub: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
  },
});
