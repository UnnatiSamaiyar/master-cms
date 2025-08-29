import { Website } from "@/types/website";
import { create } from "zustand";

interface categoryState {
  selectedWebsite: Website | null;
  onSelected: (value: Website | null) => void;
}

const useCategoryStore = create<categoryState>()((set) => ({
  selectedWebsite: null,
  onSelected: (value) => set(() => ({ selectedWebsite: value })),
}));

export default useCategoryStore;
