import { MyParagraphElement } from "@/types/slate-custom-type";
import { Editor, Element, Point, Range, Transforms } from "slate";
import { getBlock } from "../utils/getBlock";
import { nanoid } from "nanoid";

const withConverterBlock = (editor: Editor) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (...arg) => {
    const { selection } = editor;
    const blocktype: { [key: string]: string } = {
      "1": "quote-block",
    };

    for (const m in blocktype) {
      if (selection && Range.isCollapsed(selection)) {
        const match = getBlock(editor, blocktype[m]);

        if (match) {
          const [, path] = match;
          const start = Editor.start(editor, path);
          if (Point.equals(selection.anchor, start)) {
            const newProperties: Partial<MyParagraphElement> = {
              type: "p",
              id: nanoid(),
            };
            Transforms.setNodes(editor, newProperties, {
              match: (n) =>
                !Editor.isEditor(n) &&
                Element.isElement(n) &&
                n.type === blocktype[m],
            });
            return;
          }
        }
      }
    }
    deleteBackward(...arg);
  };

  return editor;
};

export default withConverterBlock;
