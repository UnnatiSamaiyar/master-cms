import { create } from "zustand";

interface Position {
  top: number;
  left: number;
}

export interface editorState {
  iscommandMenuOpen: boolean;
  setCommandMenu: (value: boolean) => void;
  position: Position | undefined;
  setPosition: (value: Position) => void;
}

const useEditorStore = create<editorState>()((set) => ({
  iscommandMenuOpen: false,
  setCommandMenu: (value) => set(() => ({ iscommandMenuOpen: value })),
  position: undefined,
  setPosition: (value) => set(() => ({ position: value })),
}));

export default useEditorStore;
