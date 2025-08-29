import { Editor, Element, Range, Transforms } from "slate";
import { isBlockActive } from "./isBlockActive";
import { MyLinkElement } from "@/types/slate-custom-type";
import { insertBlock } from "./insertBlock";

export const toggleLink = (editor: Editor, url: string) => {
  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const isLinkActive = isBlockActive(editor, "link");

  if (isLinkActive) {
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type === "link",
    });
  }

  const linkElement: MyLinkElement = {
    type: "link",
    href: url,
    children: [{ text: "Click here" }],
  };
  if (!selection) {
    insertBlock(editor, linkElement);
    return;
  }

  if (isCollapsed) {
    insertBlock(editor, linkElement);
  } else {
    Transforms.wrapNodes(editor, linkElement, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
};
