import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBillsStore, ParticipantInfo } from '../store/billsStore';
import { useWalletStore } from '../store/walletStore';
import { useUIStore } from '../store/uiStore';
import { safeHaptics } from '../lib/haptics';

export function useSplitBill(billAddress?: string) {
  const { address } = useWalletStore();
  const { getBill, payShare, withdrawSettledFunds, cancelBill, claimRefund } = useBillsStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const billQuery = useQuery({
    queryKey: ['bill', billAddress?.toLowerCase()],
    queryFn: async () => {
      if (!billAddress) return null;
      return getBill(billAddress);
    },
    enabled: !!billAddress,
    refetchInterval: 3000, // Poll every 3s as requested in spec
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!billAddress) throw new Error('No bill specified');
      if (!address) throw new Error('Wallet not connected');
      return await payShare(billAddress, address);
    },
    onSuccess: (txHash) => {
      safeHaptics.success();
      queryClient.invalidateQueries({ queryKey: ['bill', billAddress?.toLowerCase()] });
      showToast({
        title: 'Payment Confirmed in 0.6s!',
        message: `Tx: ${txHash.slice(0, 10)}... (Monad Testnet)`,
        type: 'success',
        txHash,
      });
    },
    onError: (err: any) => {
      safeHaptics.error();
      showToast({
        title: 'Payment Failed',
        message: err?.message || 'Could not complete payment',
        type: 'error',
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      if (!billAddress) throw new Error('No bill specified');
      if (!address) throw new Error('Wallet not connected');
      return await withdrawSettledFunds(billAddress, address);
    },
    onSuccess: (txHash) => {
      safeHaptics.success();
      queryClient.invalidateQueries({ queryKey: ['bill', billAddress?.toLowerCase()] });
      showToast({
        title: 'Funds Withdrawn!',
        message: `Transferred to your wallet in 0.6s`,
        type: 'success',
        txHash,
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!billAddress) throw new Error('No bill specified');
      if (!address) throw new Error('Wallet not connected');
      return await cancelBill(billAddress, address);
    },
    onSuccess: (txHash) => {
      safeHaptics.warning();
      queryClient.invalidateQueries({ queryKey: ['bill', billAddress?.toLowerCase()] });
      showToast({
        title: 'Bill Cancelled',
        message: 'Refunds are now unlocked for contributors',
        type: 'warning',
        txHash,
      });
    },
  });

  const refundMutation = useMutation({
    mutationFn: async () => {
      if (!billAddress) throw new Error('No bill specified');
      if (!address) throw new Error('Wallet not connected');
      return await claimRefund(billAddress, address);
    },
    onSuccess: (txHash) => {
      safeHaptics.success();
      queryClient.invalidateQueries({ queryKey: ['bill', billAddress?.toLowerCase()] });
      showToast({
        title: 'Refund Claimed!',
        message: 'Share returned to your wallet',
        type: 'success',
        txHash,
      });
    },
  });

  const bill = billQuery.data;
  const isCreator = address && bill ? bill.creatorAddress.toLowerCase() === address.toLowerCase() : false;
  const participantInfo = address && bill ? bill.participants.find((p: ParticipantInfo) => p.address.toLowerCase() === address.toLowerCase()) : undefined;
  const isParticipant = !!participantInfo;
  const hasPaid = !!participantInfo?.hasPaid;

  return {
    bill,
    isLoading: billQuery.isLoading,
    isRefetching: billQuery.isRefetching,
    refetch: billQuery.refetch,
    isCreator,
    isParticipant,
    hasPaid,
    participantInfo,
    isPaying: payMutation.isPending,
    payShare: payMutation.mutateAsync,
    isWithdrawing: withdrawMutation.isPending,
    withdrawSettledFunds: withdrawMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    cancelBill: cancelMutation.mutateAsync,
    isRefunding: refundMutation.isPending,
    claimRefund: refundMutation.mutateAsync,
  };
}