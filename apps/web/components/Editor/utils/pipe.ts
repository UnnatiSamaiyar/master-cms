import { SlatePlugin } from "@/types/slate-custom-type";
import { Editor } from "slate";

export const pipe =
  (...plugins: SlatePlugin[]) =>
  (editor: Editor) => {
    plugins.forEach((plugin) => {
      editor = plugin(editor);
    });
    return editor;
  };
