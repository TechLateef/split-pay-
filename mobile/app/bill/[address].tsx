import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Share,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors } from '../../theme/colors';
import { useSplitBill } from '../../hooks/useSplitBill';
import { useWallet } from '../../hooks/useWallet';
import { ParticipantInfo } from '../../store/billsStore';
import { AppCard } from '../../components/ui/AppCard';
import { AppButton } from '../../components/ui/AppButton';
import { BillStatusBadge } from '../../components/bill/BillStatusBadge';
import { BillProgress } from '../../components/bill/BillProgress';
import { ParticipantRow } from '../../components/bill/ParticipantRow';
import { ActionCard } from '../../components/bill/ActionCard';
import { TransactionFeed } from '../../components/bill/TransactionFeed';
import { CountdownTimer } from '../../components/bill/CountdownTimer';
import { MonAmount } from '../../components/ui/MonAmount';
import { AddressBadge } from '../../components/ui/AddressBadge';
import { AppSkeleton } from '../../components/ui/AppSkeleton';
import { formatDateTime } from '../../lib/format';
import {
  ArrowLeft,
  Share2,
  Calendar,
  User,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react-native';

export default function BillDetailScreen() {
  const params = useLocalSearchParams<{ address: string }>();
  const billAddress = params.address;

  const { address: userAddress, isConnected, openWalletModal, activeDemoAccount } = useWallet();
  const {
    bill,
    isLoading,
    refetch,
    isPaying,
    payShare,
    isWithdrawing,
    withdrawSettledFunds,
    isCancelling,
    cancelBill,
    isRefunding,
    claimRefund,
  } = useSplitBill(billAddress);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleShare = async () => {
    if (!bill) return;
    try {
      const shareUrl = `splitpay://bill/${bill.address}`;
      await Share.share({
        title: `Split bill: ${bill.title}`,
        message: `Hey! Pay your share for ${bill.title}.\nAmount: ${bill.splitAmountMON} MON\nOpen in SplitPay: ${shareUrl}\n(Instant 0.6s confirmation on Monad Testnet)`,
        url: shareUrl,
      });
    } catch {}
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <AppSkeleton height={40} borderRadius={12} />
          <AppSkeleton height={180} borderRadius={20} />
          <AppSkeleton height={120} borderRadius={20} />
          <AppSkeleton height={200} borderRadius={20} />
        </View>
      </SafeAreaView>
    );
  }

  if (!bill) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Layers size={48} color={colors.textMuted} />
          <Text style={styles.notFoundTitle}>Bill Not Found</Text>
          <Text style={styles.notFoundSub}>
            The smart contract address {billAddress} could not be located.
          </Text>
          <AppButton
            title="Return to Dashboard"
            onPress={() => router.replace('/(tabs)')}
            variant="primary"
            size="md"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top App Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.headerBtn}
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {bill.title}
            </Text>
            <Text style={styles.headerSubtitle}>Monad Testnet Split</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleShare}
            style={styles.headerBtn}
          >
            <Share2 size={18} color={colors.primaryLight} />
          </TouchableOpacity>
        </View>

        {/* Quick Switch Persona banner (for demo & testing) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openWalletModal}
          style={styles.personaBanner}
        >
          <Sparkles size={13} color={colors.primaryLight} />
          <Text style={styles.personaText} numberOfLines={1}>
            Viewing as:{' '}
            <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
              {activeDemoAccount?.name || 'Guest Wallet'}
            </Text>
          </Text>
          <Text style={styles.personaSwitch}>Switch Account</Text>
        </TouchableOpacity>

        {/* Scrollable Bill Details */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primaryLight}
            />
          }
        >
          {/* Bill Summary Overview Card */}
          <AppCard
            style={styles.overviewCard}
            variant={bill.status === 'Settled' ? 'accentGlow' : 'glow'}
          >
            <View style={styles.overviewTop}>
              <BillStatusBadge status={bill.status} size="md" />
              <View style={styles.createdDateRow}>
                <Calendar size={12} color={colors.textMuted} />
                <Text style={styles.createdDateText}>
                  {formatDateTime(bill.createdAt)}
                </Text>
              </View>
            </View>

            <View style={styles.titleSection}>
              <Text style={styles.billTitle}>{bill.title}</Text>
              {bill.description ? (
                <Text style={styles.billDesc}>{bill.description}</Text>
              ) : null}
            </View>

            {/* Countdown timer if deadline is active */}
            {bill.deadline > 0 ? (
              <CountdownTimer deadline={bill.deadline} />
            ) : null}

            {/* Total amounts and creator */}
            <View style={styles.overviewStats}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>Total Bill</Text>
                <MonAmount amount={bill.totalAmountMON} size="lg" />
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>Each Person</Text>
                <MonAmount amount={bill.splitAmountMON} size="lg" color={colors.success} />
              </View>
            </View>

            <View style={styles.creatorRow}>
              <User size={13} color={colors.textMuted} />
              <Text style={styles.creatorLabel}>Organized by:</Text>
              <Text style={styles.creatorName}>
                {bill.creatorName || bill.creatorAddress.slice(0, 8)}
              </Text>
              <AddressBadge address={bill.creatorAddress} start={4} end={4} />
            </View>
          </AppCard>

          {/* Progress Circular Ring Card */}
          <AppCard style={styles.progressCard}>
            <Text style={styles.sectionHeading}>Split Collection Progress</Text>
            <BillProgress
              paidCount={bill.paidCount}
              totalParticipants={bill.totalParticipants}
            />
          </AppCard>

          {/* Participants Breakdown Card */}
          <AppCard style={styles.participantsCard}>
            <View style={styles.participantsHeader}>
              <Text style={styles.sectionHeading}>
                Participants ({bill.paidCount}/{bill.totalParticipants} Paid)
              </Text>
              <Text style={styles.totalCollectedText}>
                {bill.totalCollectedMON} MON collected
              </Text>
            </View>

            <View style={styles.participantList}>
              {bill.participants.map((p: ParticipantInfo) => {
                const isUser = userAddress
                  ? p.address.toLowerCase() === userAddress.toLowerCase()
                  : false;
                const isHost = p.address.toLowerCase() === bill.creatorAddress.toLowerCase();

                return (
                  <ParticipantRow
                    key={p.address}
                    participant={p}
                    isCurrentUser={isUser}
                    isCreator={isHost}
                  />
                );
              })}
            </View>
          </AppCard>

          {/* Contract Address & Explorer */}
          <AppCard style={styles.contractAddressCard} variant="subtle">
            <View style={styles.contractHeader}>
              <Shield size={14} color={colors.primaryLight} />
              <Text style={styles.contractTitle}>Smart Contract Details</Text>
            </View>
            <AddressBadge address={bill.address} start={8} end={8} />
          </AppCard>

          {/* Transaction & Activity Feed */}
          <TransactionFeed history={bill.history} />
        </ScrollView>

        {/* Sticky Action Card in thumb-reach bottom zone */}
        <ActionCard
          bill={bill}
          isPaying={isPaying}
          isWithdrawing={isWithdrawing}
          isCancelling={isCancelling}
          isRefunding={isRefunding}
          onPay={() => payShare()}
          onWithdraw={() => withdrawSettledFunds()}
          onCancel={() => cancelBill()}
          onClaimRefund={() => claimRefund()}
          onConnectWallet={openWalletModal}
        />
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#12121B',
    borderWidth: 1,
    borderColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  personaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121D',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2E',
    gap: 8,
  },
  personaText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  personaSwitch: {
    fontSize: 11,
    color: colors.primaryLight,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 24,
  },
  overviewCard: {
    gap: 12,
  },
  overviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createdDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  createdDateText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  titleSection: {
    gap: 4,
  },
  billTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  billDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  overviewStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E1E2E',
    padding: 14,
    marginVertical: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statBoxLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#1E1E2E',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  creatorLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  creatorName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressCard: {
    alignItems: 'center',
    gap: 8,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  participantsCard: {
    gap: 10,
  },
  participantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  totalCollectedText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '700',
  },
  participantList: {
    gap: 2,
  },
  contractAddressCard: {
    gap: 8,
    alignItems: 'flex-start',
  },
  contractHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contractTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  loadingContainer: {
    padding: 20,
    gap: 16,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 12,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  notFoundSub: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
