import React, { useState } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { colors } from '../../theme/colors';
import { AppButton } from '../ui/AppButton';
import { BillDetail } from '../../store/billsStore';
import { useWalletStore } from '../../store/walletStore';
import { MONAD_TESTNET } from '../../lib/monadChain';
import { CheckCircle2, Zap, ArrowUpRight, AlertCircle } from 'lucide-react-native';

interface ActionCardProps {
  bill: BillDetail;
  isPaying?: boolean;
  isWithdrawing?: boolean;
  isCancelling?: boolean;
  isRefunding?: boolean;
  onPay: () => void;
  onWithdraw: () => void;
  onCancel: () => void;
  onClaimRefund: () => void;
  onConnectWallet: () => void;
}

export function ActionCard({
  bill,
  isPaying = false,
  isWithdrawing = false,
  isCancelling = false,
  isRefunding = false,
  onPay,
  onWithdraw,
  onCancel,
  onClaimRefund,
  onConnectWallet,
}: ActionCardProps) {
  const { address, isConnected } = useWalletStore();

  if (!isConnected || !address) {
    return (
      <View style={styles.container}>
        <View style={styles.promptRow}>
          <Text style={styles.promptTitle}>Connect to contribute</Text>
          <Text style={styles.promptSub}>
            Connect your wallet to pay your {bill.splitAmountMON} MON share
          </Text>
        </View>
        <AppButton
          title="Connect Wallet"
          onPress={onConnectWallet}
          variant="primary"
          size="lg"
          fullWidth
        />
      </View>
    );
  }

  const isCreator = bill.creatorAddress.toLowerCase() === address.toLowerCase();
  const participantInfo = bill.participants.find(
    (p) => p.address.toLowerCase() === address.toLowerCase()
  );
  const isParticipant = !!participantInfo;
  const hasPaid = !!participantInfo?.hasPaid;

  // Case 1: Participant needing to pay Open bill
  if (isParticipant && bill.status === 'Open' && !hasPaid) {
    return (
      <View style={styles.container}>
        <View style={styles.dueRow}>
          <View>
            <Text style={styles.dueLabel}>Your Share Due</Text>
            <View style={styles.amountWrap}>
              <Text style={styles.dueAmount}>{bill.splitAmountMON}</Text>
              <Text style={styles.dueSymbol}>MON</Text>
            </View>
          </View>
          <View style={styles.gasBadge}>
            <Zap size={12} color={colors.primaryLight} />
            <Text style={styles.gasText}>0.6s • ~{MONAD_TESTNET.estimatedGasFeeMON} MON</Text>
          </View>
        </View>

        <AppButton
          title="Pay Now on Monad"
          onPress={onPay}
          variant="success"
          size="lg"
          isLoading={isPaying}
          loadingText="Confirming on Monad (0.6s)..."
          fullWidth
          icon={<Zap size={18} color="#0A0A0F" />}
        />
      </View>
    );
  }

  // Case 2: Participant has already paid
  if (isParticipant && hasPaid && bill.status === 'Open') {
    return (
      <View style={[styles.container, styles.paidContainer]}>
        <View style={styles.paidHeader}>
          <CheckCircle2 size={22} color={colors.success} />
          <View style={styles.paidTextCol}>
            <Text style={styles.paidTitle}>You've paid your share!</Text>
            <Text style={styles.paidSub}>
              {bill.splitAmountMON} MON locked safely in smart contract
            </Text>
          </View>
        </View>
        {participantInfo?.txHash ? (
          <AppButton
            title="View on Monad Explorer"
            variant="ghost"
            size="sm"
            onPress={() =>
              Linking.openURL(
                `${MONAD_TESTNET.blockExplorers.default.url}/tx/${participantInfo.txHash}`
              )
            }
            icon={<ArrowUpRight size={14} color={colors.primaryLight} />}
          />
        ) : null}
      </View>
    );
  }

  // Case 3: Creator with Settled Bill -> Withdraw
  if (isCreator && bill.status === 'Settled') {
    if (bill.creatorWithdrawn) {
      return (
        <View style={[styles.container, styles.paidContainer]}>
          <View style={styles.paidHeader}>
            <CheckCircle2 size={22} color={colors.success} />
            <View style={styles.paidTextCol}>
              <Text style={styles.paidTitle}>Funds Withdrawn!</Text>
              <Text style={styles.paidSub}>
                All {bill.totalCollectedMON} MON sent to your wallet
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.dueRow}>
          <View>
            <Text style={styles.dueLabel}>🎉 All Friends Paid!</Text>
            <View style={styles.amountWrap}>
              <Text style={styles.dueAmount}>{bill.totalCollectedMON}</Text>
              <Text style={styles.dueSymbol}>MON collected</Text>
            </View>
          </View>
        </View>

        <AppButton
          title="Withdraw Total Funds"
          onPress={onWithdraw}
          variant="primary"
          size="lg"
          isLoading={isWithdrawing}
          loadingText="Withdrawing..."
          fullWidth
          icon={<Zap size={18} color="#FFFFFF" />}
        />
      </View>
    );
  }

  // Case 4: Creator with Open Bill -> Options & Cancel
  if (isCreator && bill.status === 'Open') {
    return (
      <View style={styles.container}>
        <View style={styles.dueRow}>
          <View>
            <Text style={styles.dueLabel}>Collected So Far</Text>
            <Text style={styles.collectedText}>
              {bill.totalCollectedMON} / {bill.totalAmountMON} MON
            </Text>
          </View>
          <Text style={styles.waitingText}>
            Waiting on {bill.totalParticipants - bill.paidCount} friends
          </Text>
        </View>

        <AppButton
          title="Cancel Split Bill & Unlock Refunds"
          onPress={onCancel}
          variant="danger"
          size="md"
          isLoading={isCancelling}
          loadingText="Cancelling..."
          fullWidth
        />
      </View>
    );
  }

  // Case 5: Expired or Cancelled Bill -> Claim Refund
  if ((bill.status === 'Cancelled' || bill.status === 'Expired') && hasPaid) {
    return (
      <View style={styles.container}>
        <View style={styles.promptRow}>
          <Text style={styles.refundTitle}>
            {bill.status === 'Cancelled' ? 'Bill was cancelled' : 'Bill has expired'}
          </Text>
          <Text style={styles.promptSub}>
            You can claim back your {bill.splitAmountMON} MON
          </Text>
        </View>

        <AppButton
          title="Claim Full Refund"
          onPress={onClaimRefund}
          variant="primary"
          size="lg"
          isLoading={isRefunding}
          loadingText="Processing Refund..."
          fullWidth
        />
      </View>
    );
  }

  // Default viewer / settled
  return (
    <View style={styles.container}>
      <Text style={styles.viewerText}>
        Bill Status: <Text style={{ color: colors.primaryLight, fontWeight: '700' }}>{bill.status}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#12121B',
    borderColor: '#1E1E2E',
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 12,
  },
  promptRow: {
    gap: 4,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  promptSub: {
    fontSize: 13,
    color: colors.textMuted,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dueLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  dueAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  dueSymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  gasBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(131, 110, 249, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 5,
  },
  gasText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  paidContainer: {
    backgroundColor: 'rgba(0, 212, 170, 0.06)',
    borderColor: 'rgba(0, 212, 170, 0.2)',
  },
  paidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paidTextCol: {
    gap: 2,
  },
  paidTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
  },
  paidSub: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  collectedText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  waitingText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
  },
  refundTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.warning,
  },
  viewerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
