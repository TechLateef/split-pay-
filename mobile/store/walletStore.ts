import { create } from 'zustand';
import { ethers } from 'ethers';
import { MONAD_TESTNET } from '../lib/monadChain';
import { setItem, getItem, removeItem } from '../lib/storage';
import { getProvider } from '../lib/provider';

export interface WalletPersona {
  id: string;
  name: string;
  role: string;
  address: string;
  privateKey: string;
  avatarSeed: string;
}

export const QUICK_TEST_ACCOUNTS: WalletPersona[] = [
  {
    id: 'creator',
    name: 'Organizer (You)',
    role: 'Bill Host',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    avatarSeed: 'creator_seed_101',
  },
  {
    id: 'alice',
    name: 'Alice (Friend 1)',
    role: 'Participant',
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    avatarSeed: 'alice_seed_202',
  },
  {
    id: 'bob',
    name: 'Bob (Friend 2)',
    role: 'Participant',
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
    avatarSeed: 'bob_seed_303',
  },
  {
    id: 'charlie',
    name: 'Charlie (Friend 3)',
    role: 'Participant',
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    privateKey: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
    avatarSeed: 'charlie_seed_404',
  },
];

export const DEMO_ACCOUNTS = QUICK_TEST_ACCOUNTS;

interface WalletState {
  address: string | null;
  privateKey: string | null;
  balanceMON: string;
  chainId: number;
  isConnected: boolean;
  isConnecting: boolean;
  walletType: 'injected' | 'generated' | 'private_key' | 'demo' | null;
  activePersona: WalletPersona | null;
  
  // Actions
  generateNewWallet: () => Promise<string>;
  connectCustomPrivateKey: (key: string) => Promise<void>;
  connectPersona: (account: WalletPersona) => Promise<void>;
  connectDemoAccount: (account: WalletPersona) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  initializeWallet: () => Promise<void>;
  switchAccount: (accountId: string) => Promise<void>;
  getSigner: () => ethers.Wallet | null;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  privateKey: null,
  balanceMON: '0.000',
  chainId: MONAD_TESTNET.id,
  isConnected: false,
  isConnecting: false,
  walletType: null,
  activePersona: null,

  getSigner: () => {
    const pk = get().privateKey;
    if (!pk) return null;
    return new ethers.Wallet(pk, getProvider());
  },

  initializeWallet: async () => {
    try {
      const savedType = await getItem('splitpay_wallet_type');
      const savedKey = await getItem('splitpay_custom_key');
      const savedAccountId = await getItem('splitpay_demo_account_id');

      if (savedKey) {
        await get().connectCustomPrivateKey(savedKey);
      } else if (savedType === 'demo' && savedAccountId) {
        const acc = QUICK_TEST_ACCOUNTS.find((a) => a.id === savedAccountId) || QUICK_TEST_ACCOUNTS[0];
        await get().connectPersona(acc);
      } else {
        // Automatically generate a real random Monad testnet wallet for first-time launch!
        await get().generateNewWallet();
      }
    } catch {
      await get().generateNewWallet();
    }
  },

  generateNewWallet: async () => {
    set({ isConnecting: true });
    try {
      const randomWallet = ethers.Wallet.createRandom();
      await setItem('splitpay_wallet_type', 'generated');
      await setItem('splitpay_custom_key', randomWallet.privateKey);

      set({
        address: randomWallet.address,
        privateKey: randomWallet.privateKey,
        isConnected: true,
        isConnecting: false,
        walletType: 'generated',
        activePersona: null,
        chainId: MONAD_TESTNET.id,
      });

      await get().refreshBalance();
      return randomWallet.address;
    } catch (e) {
      set({ isConnecting: false });
      throw e;
    }
  },

  connectCustomPrivateKey: async (privateKey: string) => {
    set({ isConnecting: true });
    try {
      const wallet = new ethers.Wallet(privateKey.trim());
      await setItem('splitpay_wallet_type', 'private_key');
      await setItem('splitpay_custom_key', privateKey.trim());

      const matchedPersona = QUICK_TEST_ACCOUNTS.find(
        (p) => p.address.toLowerCase() === wallet.address.toLowerCase()
      );

      set({
        address: wallet.address,
        privateKey: wallet.privateKey,
        isConnected: true,
        isConnecting: false,
        walletType: 'private_key',
        activePersona: matchedPersona || null,
        chainId: MONAD_TESTNET.id,
      });

      await get().refreshBalance();
    } catch (e) {
      set({ isConnecting: false });
      throw e;
    }
  },

  connectPersona: async (account: WalletPersona) => {
    set({ isConnecting: true });
    try {
      await setItem('splitpay_wallet_type', 'demo');
      await setItem('splitpay_demo_account_id', account.id);
      await setItem('splitpay_custom_key', account.privateKey);

      set({
        address: account.address,
        privateKey: account.privateKey,
        isConnected: true,
        isConnecting: false,
        walletType: 'demo',
        activePersona: account,
        chainId: MONAD_TESTNET.id,
      });

      await get().refreshBalance();
    } catch {
      set({ isConnecting: false });
    }
  },

  connectDemoAccount: async (account: WalletPersona) => {
    await get().connectPersona(account);
  },

  switchAccount: async (accountId: string) => {
    const target = QUICK_TEST_ACCOUNTS.find((a) => a.id === accountId);
    if (target) {
      await get().connectPersona(target);
    }
  },

  disconnect: async () => {
    await removeItem('splitpay_wallet_type');
    await removeItem('splitpay_demo_account_id');
    await removeItem('splitpay_custom_key');

    set({
      address: null,
      privateKey: null,
      balanceMON: '0.000',
      isConnected: false,
      isConnecting: false,
      walletType: null,
      activePersona: null,
    });
  },

  refreshBalance: async () => {
    const { address } = get();
    if (!address) return;

    try {
      const provider = getProvider();
      const bal = await provider.getBalance(address);
      const formatted = ethers.formatEther(bal);
      set({ balanceMON: parseFloat(formatted).toFixed(3) });
    } catch {
      // If RPC is temporarily unreachable, fallback gracefully
      set((state) => ({ balanceMON: state.balanceMON || '0.000' }));
    }
  },
}));