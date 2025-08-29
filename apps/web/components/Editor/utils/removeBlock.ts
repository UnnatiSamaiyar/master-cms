import { Editor, Path, Transforms } from "slate";

export const removeBlock = (editor: Editor, at: Path) =>
  Transforms.removeNodes(editor, { at });
