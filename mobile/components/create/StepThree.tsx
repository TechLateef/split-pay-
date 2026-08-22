import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Share,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppCard } from '../ui/AppCard';
import { AppButton } from '../ui/AppButton';
import { BlockieAvatar } from '../ui/BlockieAvatar';
import { AddressBadge } from '../ui/AddressBadge';
import { MonAmount } from '../ui/MonAmount';
import { formatAddress, formatUSD } from '../../lib/format';
import { DEMO_ACCOUNTS } from '../../store/walletStore';
import { MONAD_TESTNET } from '../../lib/monadChain';
import { router } from 'expo-router';
import {
  CheckCircle2,
  Share2,
  Zap,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react-native';

interface StepThreeProps {
  title: string;
  description: string;
  totalAmountMON: string;
  participants: string[];
  hasDeadline: boolean;
  deadlineHours: number;
  currentUserAddress?: string | null;
  isDeploying: boolean;
  onDeploy: () => Promise<string | undefined>;
  onBack: () => void;
}

export function StepThree({
  title,
  description,
  totalAmountMON,
  participants,
  hasDeadline,
  deadlineHours,
  currentUserAddress,
  isDeploying,
  onDeploy,
  onBack,
}: StepThreeProps) {
  const [createdAddress, setCreatedAddress] = useState<string | null>(null);

  const totalPeople = participants.length + 1;
  const amountFloat = parseFloat(totalAmountMON) || 0;
  const eachPaysMON = (amountFloat / totalPeople).toFixed(3);

  const handleCreateAndPay = async () => {
    const deployed = await onDeploy();
    if (deployed) {
      setCreatedAddress(deployed);
    }
  };

  const handleShare = async () => {
    if (!createdAddress) return;
    try {
      const shareUrl = `splitpay://bill/${createdAddress}`;
      await Share.share({
        title: `Split bill: ${title}`,
        message: `Hey! Pay your share for ${title}.\nAmount: ${eachPaysMON} MON\nOpen in SplitPay: ${shareUrl}\n(Instant 0.6s confirmation on Monad Testnet)`,
        url: shareUrl,
      });
    } catch {}
  };

  // SUCCESS STATE POST DEPLOYMENT
  if (createdAddress) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successBadgeCircle}>
          <CheckCircle2 size={48} color={colors.success} />
        </View>

        <Text style={styles.successHeading}>Bill Created on Monad!</Text>
        <Text style={styles.successSub}>
          Contract deployed in 0.6s and your {eachPaysMON} MON share was paid upfront.
        </Text>

        <AppCard style={styles.deployedInfoCard} variant="accentGlow">
          <Text style={styles.contractLabel}>Smart Contract Address</Text>
          <View style={styles.addressRow}>
            <AddressBadge address={createdAddress} start={8} end={6} />
          </View>
        </AppCard>

        <View style={styles.successActions}>
          <AppButton
            title="Share with Friends"
            onPress={handleShare}
            variant="primary"
            size="lg"
            icon={<Share2 size={18} color="#FFFFFF" />}
            fullWidth
          />

          <AppButton
            title="View Bill Details"
            onPress={() => router.replace(`/bill/${createdAddress}`)}
            variant="secondary"
            size="md"
            icon={<ArrowRight size={16} color={colors.textPrimary} />}
            fullWidth
          />

          <AppButton
            title="Go to Dashboard"
            onPress={() => router.replace('/(tabs)')}
            variant="ghost"
            size="sm"
            fullWidth
          />
        </View>
      </View>
    );
  }

  // REVIEW STATE
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Review & Confirm</Text>
      <Text style={styles.sectionSubtitle}>
        Review your bill parameters before deploying to Monad Testnet.
      </Text>

      {/* Bill Overview Card */}
      <AppCard style={styles.reviewCard} variant="glow">
        <View style={styles.billHeader}>
          <Text style={styles.billTitle}>{title}</Text>
          {description ? (
            <Text style={styles.billDesc}>{description}</Text>
          ) : null}
        </View>

        <View style={styles.statsTable}>
          <View style={styles.statRow}>
            <Text style={styles.statKey}>Total Bill Amount</Text>
            <MonAmount amount={amountFloat.toFixed(2)} size="sm" />
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statKey}>Total Participants</Text>
            <Text style={styles.statVal}>{totalPeople} people</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statKey}>Your Share (Paid Now)</Text>
            <Text style={styles.yourShareVal}>{eachPaysMON} MON</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statKey}>Payment Window</Text>
            <Text style={styles.statVal}>
              {hasDeadline ? `${deadlineHours} Hours` : 'No Deadline'}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statKey}>Network</Text>
            <Text style={styles.monadNetworkText}>Monad Testnet (0.6s block)</Text>
          </View>
        </View>
      </AppCard>

      {/* Participant List Preview */}
      <AppCard style={styles.peopleCard}>
        <Text style={styles.peopleHeading}>Invited Friends ({participants.length})</Text>
        <View style={styles.peopleList}>
          {participants.map((addr) => {
            const demoFriend = DEMO_ACCOUNTS.find(
              (a) => a.address.toLowerCase() === addr.toLowerCase()
            );
            return (
              <View key={addr} style={styles.personRow}>
                <BlockieAvatar address={addr} size={28} />
                <View style={styles.personTextCol}>
                  <Text style={styles.personName}>
                    {demoFriend ? demoFriend.name : 'Invited Friend'}
                  </Text>
                  <Text style={styles.personAddress}>{formatAddress(addr, 6, 4)}</Text>
                </View>
                <Text style={styles.personDue}>{eachPaysMON} MON</Text>
              </View>
            );
          })}
        </View>
      </AppCard>

      {/* Security Guarantee Pill */}
      <View style={styles.guaranteePill}>
        <ShieldCheck size={16} color={colors.success} />
        <Text style={styles.guaranteeText}>
          Non-custodial smart contract holds funds with auto-refund protection.
        </Text>
      </View>

      {/* Deploy Button */}
      <View style={styles.actionsRow}>
        <AppButton
          title="Back"
          onPress={onBack}
          variant="secondary"
          size="lg"
          disabled={isDeploying}
          style={{ flex: 1 }}
        />
        <AppButton
          title="Create & Pay Share"
          onPress={handleCreateAndPay}
          variant="primary"
          size="lg"
          isLoading={isDeploying}
          loadingText="Deploying on Monad (0.6s)..."
          icon={<Zap size={18} color="#FFFFFF" />}
          style={{ flex: 2 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: -8,
  },
  reviewCard: {
    gap: 14,
  },
  billHeader: {
    gap: 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  billTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  billDesc: {
    fontSize: 13,
    color: colors.textMuted,
  },
  statsTable: {
    gap: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statKey: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  statVal: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  yourShareVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.success,
  },
  monadNetworkText: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  peopleCard: {
    gap: 12,
  },
  peopleHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  peopleList: {
    gap: 8,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  personTextCol: {
    flex: 1,
    marginLeft: 10,
    gap: 2,
  },
  personName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  personAddress: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.textMuted,
  },
  personDue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  guaranteePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 170, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 10,
  },
  guaranteeText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  successContainer: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
  },
  successBadgeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 212, 170, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.success,
    marginBottom: 8,
  },
  successHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  deployedInfoCard: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  contractLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  addressRow: {
    alignItems: 'center',
  },
  successActions: {
    width: '100%',
    gap: 10,
    marginTop: 12,
  },
});
