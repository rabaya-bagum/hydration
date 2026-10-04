import { create } from 'zustand';

export interface ToastData { id: number; message: string; actionLabel?: string; onAction?: () => void }

interface UiState {
  toast?: ToastData;
  online: boolean;
  syncing: boolean;
  celebrate?: { id: number; goalMl: number };
  showToast: (message: string, action?: { label: string; run: () => void }) => void;
  hideToast: () => void;
  setOnline: (o: boolean) => void;
  setSyncing: (s: boolean) => void;
  triggerCelebration: (goalMl: number) => void;
  endCelebration: () => void;
}

let seq = 0;
export const useUiStore = create<UiState>((set) => ({
  online: true,
  syncing: false,
  showToast: (message, action) => set({ toast: { id: ++seq, message, actionLabel: action?.label, onAction: action?.run } }),
  hideToast: () => set({ toast: undefined }),
  setOnline: (online) => set({ online }),
  setSyncing: (syncing) => set({ syncing }),
  triggerCelebration: (goalMl) => set({ celebrate: { id: ++seq, goalMl } }),
  endCelebration: () => set({ celebrate: undefined }),
}));
