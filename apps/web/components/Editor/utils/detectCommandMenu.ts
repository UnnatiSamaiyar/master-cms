import { editorState } from "@/store/editorStore";
import { RichText } from "@/types/slate-custom-type";
import { Editor, Range } from "slate";

export const detectCommandMenu = (editor: Editor, store: editorState) => {
  const { iscommandMenuOpen, setCommandMenu } = store;
  const { selection } = editor;

  if (selection && Range.isCollapsed(selection)) {
    const [start] = Range.edges(selection);
    const characterBefore = Editor.before(editor, start, {
      unit: "offset",
    });
    const before = characterBefore && Editor.before(editor, characterBefore);
    const beforeRange = before && Editor.range(editor, before, start);
    const beforeText = beforeRange && Editor.string(editor, beforeRange);
    if (beforeText?.endsWith(" /")) {
      setCommandMenu(true);
      return;
    }

    const [node] = Editor.node(editor, start.path);
    const matchtext = (node as RichText).text;
    if (matchtext.length === 1 && matchtext.endsWith("/")) {
      return setCommandMenu(true);
    }
    setCommandMenu(false);
  }
  if (iscommandMenuOpen) {
    setCommandMenu(false);
  }
};
