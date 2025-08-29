import { MyCustomElement } from "@/types/slate-custom-type";
import { nanoid } from "nanoid";
import { Editor, Node, Transforms } from "slate";

const withTrailingBlock = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]) => {
    if (Editor.isEditor(node)) {
      const lastNode = node.children[
        node.children.length - 1
      ] as MyCustomElement;
      if (
        !lastNode ||
        !Editor.isBlock(editor, lastNode) ||
        lastNode.type !== "p"
      ) {
        const newParagraph: Node = {
          id: nanoid(),
          type: "p",
          children: [{ text: "" }],
        };

        Transforms.insertNodes(editor, newParagraph, {
          at: [...path, node.children.length],
        });
        return;
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
};

export default withTrailingBlock;
