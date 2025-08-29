import { AlignType, MyBlockElement } from "@/types/slate-custom-type";
import { Editor, Transforms } from "slate";

export const toggleAlignment = (editor: Editor, type: AlignType) => {
  const { selection } = editor;
  if (!selection) return;

  let newProperties: Partial<MyBlockElement>;

  newProperties = { align: type };
  Transforms.setNodes(editor, newProperties);
};
