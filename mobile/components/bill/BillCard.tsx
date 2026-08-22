import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { AppCard } from '../ui/AppCard';
import { BillStatusBadge } from './BillStatusBadge';
import { MonAmount } from '../ui/MonAmount';
import { BillDetail } from '../../store/billsStore';
import { formatTimeAgo, formatRemainingTime } from '../../lib/format';
import { router } from 'expo-router';
import { Users, Clock, ChevronRight } from 'lucide-react-native';

interface BillCardProps {
  bill: BillDetail;
  isCreatorView?: boolean;
  currentUserAddress?: string | null;
}

export function BillCard({ bill, isCreatorView = false, currentUserAddress }: BillCardProps) {
  const handlePress = () => {
    router.push(`/bill/${bill.address}`);
  };

  const participantInfo = currentUserAddress
    ? bill.participants.find(
        (p) => p.address.toLowerCase() === currentUserAddress.toLowerCase()
      )
    : undefined;

  const progressPercent =
    bill.totalParticipants > 0
      ? Math.round((bill.paidCount / bill.totalParticipants) * 100)
      : 0;

  const timeRemaining = formatRemainingTime(bill.deadline);

  return (
    <AppCard
      variant={bill.status === 'Settled' ? 'accentGlow' : 'default'}
      onPress={handlePress}
      style={styles.card}
    >
      {/* Top row: Status and Date */}
      <View style={styles.topRow}>
        <BillStatusBadge status={bill.status} size="sm" />
        <Text style={styles.createdDate}>{formatTimeAgo(bill.createdAt)}</Text>
      </View>

      {/* Bill Title & Description */}
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {bill.title}
        </Text>
        {bill.description ? (
          <Text style={styles.description} numberOfLines={1}>
            {bill.description}
          </Text>
        ) : null}
      </View>

      {/* Progress Bar & Counter */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLabels}>
          <View style={styles.peopleRow}>
            <Users size={13} color={colors.textMuted} />
            <Text style={styles.progressRatio}>
              {bill.paidCount} of {bill.totalParticipants} paid
            </Text>
          </View>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
        </View>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${progressPercent}%`,
                backgroundColor:
                  bill.status === 'Settled' ? colors.success : colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Bottom Info: Amount + Role info */}
      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.amountLabel}>
            {isCreatorView ? 'Total Bill' : 'Your Share'}
          </Text>
          <MonAmount
            amount={isCreatorView ? bill.totalAmountMON : bill.splitAmountMON}
            size="md"
            showUSD={false}
          />
        </View>

        <View style={styles.actionPromptRow}>
          {!isCreatorView && participantInfo ? (
            <Text
              style={[
                styles.userStatusText,
                { color: participantInfo.hasPaid ? colors.success : colors.warning },
              ]}
            >
              {participantInfo.hasPaid ? 'Paid ✅' : 'Pending ⏳'}
            </Text>
          ) : null}

          {bill.deadline > 0 && !timeRemaining.isExpired ? (
            <View style={styles.deadlinePill}>
              <Clock size={11} color={colors.textMuted} />
              <Text style={styles.deadlineText}>{timeRemaining.text}</Text>
            </View>
          ) : null}

          <ChevronRight size={18} color={colors.textMuted} />
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createdDate: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  titleWrap: {
    gap: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
  },
  progressContainer: {
    gap: 6,
    marginVertical: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  progressRatio: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  track: {
    height: 6,
    backgroundColor: '#1E1E2E',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  amountLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  actionPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deadlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
    gap: 4,
  },
  deadlineText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
