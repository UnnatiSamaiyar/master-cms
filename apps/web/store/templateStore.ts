import { create } from "zustand";

interface templateState {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const useTemplateStore = create<templateState>()((set) => ({
  open: false,
  setOpen: (value) => set(() => ({ open: value })),
}));

export default useTemplateStore;
