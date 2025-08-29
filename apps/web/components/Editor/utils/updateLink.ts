import { Editor, Node, Transforms } from "slate";
import { isBlockActive } from "./isBlockActive";
import { ReactEditor } from "slate-react";

export const updateLink = (editor: Editor, href: string) => {
  const { selection } = editor;
  if (!selection) return;
  const isLinkActive = isBlockActive(editor, "link");

  if (!isLinkActive) return;
  const linkNodePath = ReactEditor.findPath(
    editor,
    Node.parent(editor, selection?.focus.path),
  );
  Transforms.setNodes(editor, { href }, { at: linkNodePath });
};
