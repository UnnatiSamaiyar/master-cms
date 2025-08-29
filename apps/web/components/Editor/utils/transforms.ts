import { Editor, Element, Transforms } from "slate";

export const unwrapBlock = (editor: Editor, block: string) => {
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === block,
  });
};
