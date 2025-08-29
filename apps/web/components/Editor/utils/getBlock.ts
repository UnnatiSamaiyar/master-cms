import { Editor, Element } from "slate";

export const getBlock = (editor: Editor, block: string) => {
  const [match] = Array.from(
    Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type === block,
    }),
  );
  return match;
};
