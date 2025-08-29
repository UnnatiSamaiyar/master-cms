import { Editor, Element, Transforms } from "slate";
import { nanoid } from "nanoid";

export const withNodeId = (editor: Editor) => {
  const { apply } = editor;
  editor.apply = (operation) => {
    if (operation.type === "insert_node") {
      if (Element.isElement(operation.node)) {
        Transforms.setNodes(editor, { id: nanoid() });
      }
      return apply(operation);
    }

    if (operation.type === "split_node") {
      Transforms.setNodes(editor, { id: nanoid() });
      return apply(operation);
    }
    return apply(operation);
  };

  return editor;
};
