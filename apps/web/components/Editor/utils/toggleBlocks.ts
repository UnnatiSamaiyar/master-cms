import { Editor, Transforms, Element } from "slate";
import { isBlockActive } from "./isBlockActive";
import { LIST_TYPES, TEXT_ALIGN_TYPES } from "../constant";

export const toggleBlock = (editor: Editor, block: string) => {
  const { selection } = editor;
  if (!selection) return;
  const isActive = isBlockActive(editor, block);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      Element.isElement(n) &&
      ["ul", "ol"].includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(block),
    split: true,
  });

  let newProperties: Partial<Element>;

  const isList = LIST_TYPES.includes(block);
  newProperties = {
    type: isActive
      ? "p"
      : isList
        ? "li"
        : (block as keyof typeof newProperties.type),
  };

  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    if (newProperties.type) {
      Transforms.wrapNodes(editor, {
        type: block,
        children: [],
      });
    }
  }
};
