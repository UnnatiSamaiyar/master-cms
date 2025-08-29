import { Editor, Transforms, Element, Range, insertText } from "slate";
import isUrl from "is-url";
import { MyLinkElement } from "@/types/slate-custom-type";
import { isBlockActive } from "../utils/isBlockActive";

const wrapLink = (editor: Editor, url: string, urlText: string) => {
  const { selection } = editor;
  const isLinkActive = isBlockActive(editor, "link");
  if (isLinkActive) {
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type === "link",
    });
  }
  const isCollapsed = selection && Range.isCollapsed(selection);
  const linkElement: MyLinkElement = {
    type: "link",
    href: url,
    children: [{ text: urlText }],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, linkElement);
  } else {
    Transforms.wrapNodes(editor, linkElement, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
};

const withLink = (editor: Editor) => {
  const { isInline, insertText, insertData } = editor;

  editor.isInline = (element) =>
    ["link"].includes(element.type) || isInline(element);

  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text, "your link");
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data) => {
    const text = data.getData("text/plain");
    if (data && isUrl(text)) {
      wrapLink(editor, text, "your link");
    } else {
      insertData(data);
    }
  };

  return editor;
};

export default withLink;
