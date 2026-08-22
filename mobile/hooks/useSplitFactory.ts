import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBillsStore } from '../store/billsStore';
import { useWalletStore } from '../store/walletStore';
import { useUIStore } from '../store/uiStore';
import { safeHaptics } from '../lib/haptics';

export function useSplitFactory() {
  const { address } = useWalletStore();
  const { createBill, isCreating, getUserCreatedBills, getUserParticipantBills } = useBillsStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const userBills = getUserCreatedBills(address);
  const participantBills = getUserParticipantBills(address);

  const createMutation = useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      participantAddresses?: string[];
      totalParticipantsCount?: number;
      splitAmountMON: string;
      deadlineHours?: number;
    }) => {
      if (!address) {
        throw new Error('Please connect your wallet first');
      }

      const billAddress = await createBill({
        ...params,
        creatorAddress: address,
      });

      return billAddress;
    },
    onSuccess: (billAddress) => {
      safeHaptics.success();
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      showToast({
        title: 'Bill Deployed on Monad!',
        message: `Contract: ${billAddress.slice(0, 10)}... (0.6s finality)`,
        type: 'success',
      });
    },
    onError: (err: any) => {
      safeHaptics.error();
      showToast({
        title: 'Deployment Failed',
        message: err?.message || 'Could not deploy bill on Monad',
        type: 'error',
      });
    },
  });

  return {
    userBills,
    participantBills,
    isCreating: createMutation.isPending || isCreating,
    isDeploying: createMutation.isPending || isCreating,
    createBill: createMutation.mutateAsync,
  };
}
