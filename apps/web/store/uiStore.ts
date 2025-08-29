import { create } from "zustand";

export interface uiState {
  articleAddSheetOpen: boolean;
  articleAddSheetChange: (open: boolean) => void;

  // admin
  adminAddSheetOpen: boolean;
  adminAddSheetChange: (open: boolean) => void;
}

export const useUIStore = create<uiState>()((set) => ({
  articleAddSheetOpen: false,
  adminAddSheetOpen: false,
  articleAddSheetChange: (open: boolean) => set({ articleAddSheetOpen: open }),
  adminAddSheetChange: (open: boolean) => set({ adminAddSheetOpen: open }),
}));

export default useUIStore;
