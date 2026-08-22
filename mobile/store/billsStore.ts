import { create } from 'zustand';
import { ethers } from 'ethers';
import { QUICK_TEST_ACCOUNTS, useWalletStore } from './walletStore';
import { getItem, setItem } from '../lib/storage';
import SplitFactory from '../contracts/SplitFactory.json';
import SplitBill from '../contracts/SplitBill.json';
import deployed from '../contracts/deployed.json';

export type BillStatus = 'Open' | 'Settled' | 'Cancelled' | 'Expired';

export interface ParticipantInfo {
  address: string;
  name?: string;
  avatarSeed?: string;
  hasPaid: boolean;
  amountMON: string;
  paidAt?: number;
  txHash?: string;
}

export interface BillDetail {
  address: string;
  title: string;
  description: string;
  creatorAddress: string;
  creatorName?: string;
  totalAmountMON: string;
  splitAmountMON: string;
  participants: ParticipantInfo[];
  createdAt: number;
  deadline: number; // 0 for none, unix timestamp seconds
  status: BillStatus;
  paidCount: number;
  totalParticipants: number;
  totalCollectedMON: string;
  creatorWithdrawn: boolean;
  history: Array<{
    id: string;
    type: 'created' | 'paid' | 'settled' | 'cancelled' | 'refunded' | 'withdrawn';
    senderAddress: string;
    senderName?: string;
    amountMON?: string;
    timestamp: number;
    txHash?: string;
  }>;
}

interface BillsState {
  bills: Record<string, BillDetail>;
  isCreating: boolean;
  activeFilter: 'All' | 'Created' | 'Paid' | 'Settled' | 'Pending';

  // Actions
  initializeBills: () => Promise<void>;
  setFilter: (filter: 'All' | 'Created' | 'Paid' | 'Settled' | 'Pending') => void;
  getBill: (address: string) => BillDetail | undefined;
  getUserCreatedBills: (userAddress?: string | null) => BillDetail[];
  getUserParticipantBills: (userAddress?: string | null) => BillDetail[];
  getAllActivity: (userAddress?: string | null) => Array<{
    id: string;
    billAddress: string;
    billTitle: string;
    type: 'created' | 'paid' | 'settled' | 'cancelled' | 'refunded' | 'withdrawn';
    senderAddress: string;
    senderName?: string;
    amountMON?: string;
    timestamp: number;
    txHash?: string;
  }>;
  createBill: (params: {
    title: string;
    description: string;
    creatorAddress: string;
    participantAddresses?: string[];
    totalParticipantsCount?: number;
    splitAmountMON: string;
    deadlineHours?: number;
  }) => Promise<string>;
  payShare: (billAddress: string, participantAddress: string) => Promise<string>;
  withdrawSettledFunds: (billAddress: string, creatorAddress: string) => Promise<string>;
  cancelBill: (billAddress: string, creatorAddress: string) => Promise<string>;
  claimRefund: (billAddress: string, participantAddress: string) => Promise<string>;
}

export const useBillsStore = create<BillsState>((set, get) => ({
  bills: {},
  isCreating: false,
  activeFilter: 'All',

  initializeBills: async () => {
    try {
      const saved = await getItem('splitpay_saved_bills');
      if (saved) {
        const parsed = JSON.parse(saved);
        set({ bills: parsed });
      }
    } catch {}
  },

  setFilter: (filter) => set({ activeFilter: filter }),

  getBill: (address: string) => {
    if (!address) return undefined;
    const lower = address.toLowerCase();
    const all = get().bills;
    return all[lower] || Object.values(all).find((b) => b.address.toLowerCase() === lower);
  },

  getUserCreatedBills: (userAddress?: string | null) => {
    if (!userAddress) return [];
    const lower = userAddress.toLowerCase();
    return Object.values(get().bills).filter(
      (b) => b.creatorAddress.toLowerCase() === lower
    );
  },

  getUserParticipantBills: (userAddress?: string | null) => {
    if (!userAddress) return [];
    const lower = userAddress.toLowerCase();
    return Object.values(get().bills).filter(
      (b) =>
        b.creatorAddress.toLowerCase() !== lower &&
        b.participants.some((p) => p.address.toLowerCase() === lower)
    );
  },

  getAllActivity: (userAddress?: string | null) => {
    const all = Object.values(get().bills);
    const events: Array<{
      id: string;
      billAddress: string;
      billTitle: string;
      type: 'created' | 'paid' | 'settled' | 'cancelled' | 'refunded' | 'withdrawn';
      senderAddress: string;
      senderName?: string;
      amountMON?: string;
      timestamp: number;
      txHash?: string;
    }> = [];

    const lower = userAddress?.toLowerCase();

    all.forEach((bill) => {
      const isRelevant =
        !lower ||
        bill.creatorAddress.toLowerCase() === lower ||
        bill.participants.some((p) => p.address.toLowerCase() === lower);

      if (isRelevant) {
        bill.history.forEach((h) => {
          events.push({
            ...h,
            billAddress: bill.address,
            billTitle: bill.title,
          });
        });
      }
    });

    return events.sort((a, b) => b.timestamp - a.timestamp);
  },

  createBill: async ({
    title,
    description,
    creatorAddress,
    participantAddresses = [],
    totalParticipantsCount,
    splitAmountMON,
    deadlineHours = 0,
  }) => {
    set({ isCreating: true });
    try {
      const signer = useWalletStore.getState().getSigner();
      if (!signer) throw new Error("Wallet not connected");

      const factory = new ethers.Contract(deployed.factoryAddress, SplitFactory.abi, signer);
      const totalParticipants = totalParticipantsCount || (participantAddresses.length + 1);
      const totalAmountMON = (parseFloat(splitAmountMON) * totalParticipants).toFixed(2);
      const now = Math.floor(Date.now() / 1000);
      const deadline = deadlineHours > 0 ? now + deadlineHours * 3600 : 0;
      const splitAmountWei = ethers.parseEther(splitAmountMON);

      const tx = await factory.createBillWithCount(
        title,
        description,
        participantAddresses,
        totalParticipants,
        splitAmountWei,
        deadlineHours,
        { value: splitAmountWei }
      );
      const receipt = await tx.wait();
      
      const event = receipt.logs
        .map((log: any) => {
          try {
             return factory.interface.parseLog(log);
          } catch (e) { return null; }
        })
        .find((e: any) => e?.name === 'BillCreated');
        
      if (!event) throw new Error("Failed to parse BillCreated event");
      
      const newAddress = event.args.billAddress;
      const txHash = receipt.hash;

    const matchedCreator = QUICK_TEST_ACCOUNTS.find(
      (a) => a.address.toLowerCase() === creatorAddress.toLowerCase()
    );

    const participants: ParticipantInfo[] = [
      {
        address: creatorAddress,
        name: matchedCreator?.name || 'Organizer (You)',
        avatarSeed: `seed_${creatorAddress.slice(-4)}`,
        hasPaid: true,
        amountMON: splitAmountMON,
        paidAt: now,
        txHash,
      },
      ...participantAddresses.map((addr) => {
        const demo = QUICK_TEST_ACCOUNTS.find(
          (a) => a.address.toLowerCase() === addr.toLowerCase()
        );
        return {
          address: addr,
          name: demo?.name,
          avatarSeed: `seed_${addr.slice(-4)}`,
          hasPaid: false,
          amountMON: splitAmountMON,
        };
      }),
    ];

    const newBill: BillDetail = {
      address: newAddress,
      title,
      description,
      creatorAddress,
      creatorName: matchedCreator?.name || 'Organizer (You)',
      totalAmountMON,
      splitAmountMON,
      participants,
      createdAt: now,
      deadline,
      status: totalParticipants === 1 ? 'Settled' : 'Open',
      paidCount: 1,
      totalParticipants,
      totalCollectedMON: splitAmountMON,
      creatorWithdrawn: false,
      history: [
        {
          id: `h-${Date.now()}`,
          type: 'created',
          senderAddress: creatorAddress,
          senderName: matchedCreator?.name || 'Organizer (You)',
          amountMON: totalAmountMON,
          timestamp: now,
          txHash,
        },
      ],
    };

    const updatedBills = {
      [newAddress.toLowerCase()]: newBill,
      ...get().bills,
    };

    set({
      bills: updatedBills,
      isCreating: false,
    });

    try {
      await setItem('splitpay_saved_bills', JSON.stringify(updatedBills));
    } catch {}

    // Refresh wallet balance since gas & share was paid
    useWalletStore.getState().refreshBalance();

    return newAddress;
  } catch (err) {
    set({ isCreating: false });
    throw err;
  }
  },

  payShare: async (billAddress: string, participantAddress: string) => {
    const signer = useWalletStore.getState().getSigner();
    if (!signer) throw new Error("Wallet not connected");

    const key = billAddress.toLowerCase();
    const currentBills = get().bills;
    const bill = currentBills[key] || get().getBill(billAddress);
    if (!bill) throw new Error("Bill not found");

    const contract = new ethers.Contract(billAddress, SplitBill.abi, signer);
    const amountWei = ethers.parseEther(bill.splitAmountMON);
    
    const tx = await contract.pay({ value: amountWei });
    const receipt = await tx.wait();
    
    const txHash = receipt.hash;
    const now = Math.floor(Date.now() / 1000);

    const matchedSender = QUICK_TEST_ACCOUNTS.find(
      (a) => a.address.toLowerCase() === participantAddress.toLowerCase()
    );
    const senderName = matchedSender?.name || `Friend (${participantAddress.slice(0, 6)}...)`;

    const pIndex = bill.participants.findIndex(
      (p) => p.address.toLowerCase() === participantAddress.toLowerCase()
    );

    let updatedParticipants = [...bill.participants];

    if (pIndex >= 0) {
      // Existing invited participant
      updatedParticipants[pIndex] = {
        ...updatedParticipants[pIndex],
        hasPaid: true,
        paidAt: now,
        txHash,
      };
    } else {
      // Dynamic open participant who scanned QR code / opened deep link!
      updatedParticipants.push({
        address: participantAddress,
        name: senderName,
        avatarSeed: `seed_${participantAddress.slice(-4)}`,
        hasPaid: true,
        amountMON: bill.splitAmountMON,
        paidAt: now,
        txHash,
      });
    }

    const newPaidCount = bill.paidCount + 1;
    const isNowSettled = newPaidCount >= bill.totalParticipants;
    const newStatus: BillStatus = isNowSettled ? 'Settled' : bill.status;
    const newTotalCollected = (
      parseFloat(bill.totalCollectedMON) + parseFloat(bill.splitAmountMON)
    ).toFixed(2);

    const newHistory = [
      ...bill.history,
      {
        id: `h-pay-${Date.now()}`,
        type: 'paid' as const,
        senderAddress: participantAddress,
        senderName,
        amountMON: bill.splitAmountMON,
        timestamp: now,
        txHash,
      },
    ];

    if (isNowSettled) {
      newHistory.push({
        id: `h-settle-${Date.now()}`,
        type: 'settled' as const,
        senderAddress: bill.creatorAddress,
        senderName: bill.creatorName,
        amountMON: newTotalCollected,
        timestamp: now,
        txHash,
      });
    }

    const updatedBill: BillDetail = {
      ...bill,
      participants: updatedParticipants,
      paidCount: newPaidCount,
      status: newStatus,
      totalCollectedMON: newTotalCollected,
      history: newHistory,
    };

    const updatedBills = {
      ...currentBills,
      [key]: updatedBill,
    };

    set({ bills: updatedBills });

    try {
      await setItem('splitpay_saved_bills', JSON.stringify(updatedBills));
    } catch {}

    return txHash;
  },

  withdrawSettledFunds: async (billAddress: string, creatorAddress: string) => {
    const signer = useWalletStore.getState().getSigner();
    if (!signer) throw new Error("Wallet not connected");

    const key = billAddress.toLowerCase();
    const currentBills = get().bills;
    const bill = currentBills[key] || get().getBill(billAddress);
    if (!bill) throw new Error("Bill not found");

    const contract = new ethers.Contract(billAddress, SplitBill.abi, signer);
    
    const tx = await contract.withdrawSettled();
    const receipt = await tx.wait();
    
    const txHash = receipt.hash;
    const now = Math.floor(Date.now() / 1000);

    const updatedBill: BillDetail = {
      ...bill,
      creatorWithdrawn: true,
      history: [
        ...bill.history,
        {
          id: `h-with-${Date.now()}`,
          type: 'withdrawn',
          senderAddress: creatorAddress,
          senderName: bill.creatorName,
          amountMON: bill.totalCollectedMON,
          timestamp: now,
          txHash,
        },
      ],
    };

    const updatedBills = {
      ...currentBills,
      [key]: updatedBill,
    };

    set({ bills: updatedBills });

    try {
      await setItem('splitpay_saved_bills', JSON.stringify(updatedBills));
    } catch {}

    return txHash;
  },

  cancelBill: async (billAddress: string, creatorAddress: string) => {
    const signer = useWalletStore.getState().getSigner();
    if (!signer) throw new Error("Wallet not connected");

    const key = billAddress.toLowerCase();
    const currentBills = get().bills;
    const bill = currentBills[key] || get().getBill(billAddress);
    if (!bill) throw new Error("Bill not found");

    const contract = new ethers.Contract(billAddress, SplitBill.abi, signer);
    
    const tx = await contract.cancelBill();
    const receipt = await tx.wait();
    
    const txHash = receipt.hash;
    const now = Math.floor(Date.now() / 1000);

    const updatedBill: BillDetail = {
      ...bill,
      status: 'Cancelled',
      history: [
        ...bill.history,
        {
          id: `h-cancel-${Date.now()}`,
          type: 'cancelled',
          senderAddress: creatorAddress,
          senderName: bill.creatorName,
          timestamp: now,
          txHash,
        },
      ],
    };

    const updatedBills = {
      ...currentBills,
      [key]: updatedBill,
    };

    set({ bills: updatedBills });

    try {
      await setItem('splitpay_saved_bills', JSON.stringify(updatedBills));
    } catch {}

    return txHash;
  },

  claimRefund: async (billAddress: string, participantAddress: string) => {
    const signer = useWalletStore.getState().getSigner();
    if (!signer) throw new Error("Wallet not connected");

    const key = billAddress.toLowerCase();
    const currentBills = get().bills;
    const bill = currentBills[key] || get().getBill(billAddress);
    if (!bill) throw new Error("Bill not found");

    const contract = new ethers.Contract(billAddress, SplitBill.abi, signer);
    
    const tx = await contract.claimRefund();
    const receipt = await tx.wait();
    
    const txHash = receipt.hash;
    const now = Math.floor(Date.now() / 1000);

    const matchedSender = QUICK_TEST_ACCOUNTS.find(
      (a) => a.address.toLowerCase() === participantAddress.toLowerCase()
    );
    const senderName = matchedSender?.name || `Participant (${participantAddress.slice(0, 6)}...)`;

    const updatedBill: BillDetail = {
      ...bill,
      history: [
        ...bill.history,
        {
          id: `h-ref-${Date.now()}`,
          type: 'refunded',
          senderAddress: participantAddress,
          senderName,
          amountMON: bill.splitAmountMON,
          timestamp: now,
          txHash,
        },
      ],
    };

    const updatedBills = {
      ...currentBills,
      [key]: updatedBill,
    };

    set({ bills: updatedBills });

    try {
      await setItem('splitpay_saved_bills', JSON.stringify(updatedBills));
    } catch {}

    return txHash;
  },
}));