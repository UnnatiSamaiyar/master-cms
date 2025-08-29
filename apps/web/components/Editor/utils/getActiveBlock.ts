import { MyBlockElement } from "@/types/slate-custom-type";
import { Editor, Element, Range } from "slate";

export const getTopLevelBlock = (editor: Editor) => {
  const { selection } = editor;
  if (!selection) return null;

  const [start, end] = Range.edges(selection);

  //path[0] gives us the index of the top-level block.
  let startTopLevelBlockIndex = start.path[0];
  const endTopLevelBlockIndex = end.path[0];

  let ParentElement: MyBlockElement | null = null;
  while (startTopLevelBlockIndex <= endTopLevelBlockIndex) {
    const [node, _] = Editor.node(editor, [startTopLevelBlockIndex]);
    ParentElement = node as MyBlockElement;
    startTopLevelBlockIndex++;
  }

  return ParentElement;
};
