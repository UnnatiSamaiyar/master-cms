import { Website } from "@/types/website";
import { create } from "zustand";

interface sectionState {
  selectedWebsite: Website | null;
  onSelected: (value: Website | null) => void;
}

const useSectionStore = create<sectionState>()((set) => ({
  selectedWebsite: null,
  onSelected: (value) => set(() => ({ selectedWebsite: value })),
}));

export default useSectionStore;
