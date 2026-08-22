import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { BlockieAvatar } from '../ui/BlockieAvatar';
import { AddressBadge } from '../ui/AddressBadge';
import { AppBadge } from '../ui/AppBadge';
import { MonAmount } from '../ui/MonAmount';
import { ParticipantInfo } from '../../store/billsStore';
import { Check, Clock } from 'lucide-react-native';

interface ParticipantRowProps {
  participant: ParticipantInfo;
  isCurrentUser: boolean;
  isCreator: boolean;
}

export function ParticipantRow({
  participant,
  isCurrentUser,
  isCreator,
}: ParticipantRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <BlockieAvatar
          address={participant.address}
          seed={participant.avatarSeed}
          size={38}
        />
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>
              {participant.name || (isCreator ? 'Organizer' : 'Friend')}
            </Text>
            {isCurrentUser ? (
              <AppBadge label="You" variant="primary" size="sm" />
            ) : null}
            {isCreator ? (
              <AppBadge label="Host" variant="neutral" size="sm" />
            ) : null}
          </View>
          <View style={styles.addressWrapper}>
            <AddressBadge address={participant.address} start={4} end={4} />
          </View>
        </View>
      </View>

      <View style={styles.rightCol}>
        <MonAmount amount={participant.amountMON} size="sm" showUSD={false} />
        {participant.hasPaid ? (
          <View style={styles.statusPaid}>
            <Check size={11} color={colors.success} />
            <Text style={styles.paidText}>Paid</Text>
          </View>
        ) : (
          <View style={styles.statusPending}>
            <Clock size={11} color={colors.warning} />
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoCol: {
    justifyContent: 'center',
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addressWrapper: {
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusPaid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 170, 0.12)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 3,
  },
  paidText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  statusPending: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 3,
  },
  pendingText: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '700',
  },
});
