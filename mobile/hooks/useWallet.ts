import { useWalletStore, QUICK_TEST_ACCOUNTS, WalletPersona } from '../store/walletStore';
import { useUIStore } from '../store/uiStore';
import { safeHaptics } from '../lib/haptics';

export function useWallet() {
  const {
    address,
    privateKey,
    balanceMON,
    chainId,
    isConnected,
    isConnecting,
    walletType,
    activePersona,
    generateNewWallet,
    connectPersona,
    connectDemoAccount,
    connectCustomPrivateKey,
    disconnect,
    refreshBalance,
    switchAccount,
  } = useWalletStore();

  const { openWalletModal, openWrongNetworkModal, showToast } = useUIStore();

  const handleSwitchAccount = async (account: WalletPersona) => {
    safeHaptics.light();
    await switchAccount(account.id);
    showToast({
      title: `Switched to ${account.name}`,
      message: `Role: ${account.role}`,
      type: 'info',
    });
  };

  const handleGenerateWallet = async () => {
    safeHaptics.success();
    const addr = await generateNewWallet();
    showToast({
      title: 'New Monad Wallet Created!',
      message: `Address: ${addr.slice(0, 10)}...`,
      type: 'success',
    });
  };

  const handleDisconnect = async () => {
    safeHaptics.warning();
    await disconnect();
    showToast({
      title: 'Wallet Disconnected',
      type: 'info',
    });
  };

  return {
    address,
    privateKey,
    balanceMON,
    chainId,
    isConnected,
    isConnecting,
    walletType,
    activePersona,
    activeDemoAccount: activePersona,
    demoAccounts: QUICK_TEST_ACCOUNTS,
    generateNewWallet: handleGenerateWallet,
    connectPersona,
    connectDemoAccount,
    connectCustomPrivateKey,
    disconnect: handleDisconnect,
    refreshBalance,
    switchAccount: handleSwitchAccount,
    openWalletModal,
    openWrongNetworkModal,
  };
}