import { Editor, Range, Transforms } from "slate";

export const emptyNode = (editor: Editor) => {
  const { selection } = editor;

  if (selection) {
    const [start] = Range.edges(selection);
    const characterBefore = Editor.before(editor, start, {
      unit: "character",
    });
    Transforms.delete(editor, { at: characterBefore });
    Transforms.setNodes(editor, { text: " " });
  }
};
