import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'warning' | 'error' | 'info';
  txHash?: string;
}

export interface QRModalData {
  billAddress: string;
  title: string;
  splitAmountMON: string;
}

interface UIState {
  isWalletModalOpen: boolean;
  isWrongNetworkModalOpen: boolean;
  isQRScannerOpen: boolean;
  activeQRData: QRModalData | null;
  activeToast: ToastMessage | null;
  
  // Actions
  openWalletModal: () => void;
  closeWalletModal: () => void;
  openWrongNetworkModal: () => void;
  closeWrongNetworkModal: () => void;
  openQRScanner: () => void;
  closeQRScanner: () => void;
  openQRModal: (data: QRModalData) => void;
  closeQRModal: () => void;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isWalletModalOpen: false,
  isWrongNetworkModalOpen: false,
  isQRScannerOpen: false,
  activeQRData: null,
  activeToast: null,

  openWalletModal: () => set({ isWalletModalOpen: true }),
  closeWalletModal: () => set({ isWalletModalOpen: false }),

  openWrongNetworkModal: () => set({ isWrongNetworkModalOpen: true }),
  closeWrongNetworkModal: () => set({ isWrongNetworkModalOpen: false }),

  openQRScanner: () => set({ isQRScannerOpen: true }),
  closeQRScanner: () => set({ isQRScannerOpen: false }),

  openQRModal: (data) => set({ activeQRData: data }),
  closeQRModal: () => set({ activeQRData: null }),

  showToast: (toast) => {
    const id = Date.now().toString();
    set({ activeToast: { ...toast, id } });
    setTimeout(() => {
      set((state) => (state.activeToast?.id === id ? { activeToast: null } : state));
    }, 4500);
  },

  hideToast: () => set({ activeToast: null }),
}));