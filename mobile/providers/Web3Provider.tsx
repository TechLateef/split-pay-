import React, { useEffect } from 'react';
import { useWalletStore } from '../store/walletStore';
import { useBillsStore } from '../store/billsStore';

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const { initializeWallet } = useWalletStore();
  const { initializeBills } = useBillsStore();

  useEffect(() => {
    initializeWallet();
    initializeBills();
  }, []);

  return <>{children}</>;
}