import {
  MyBulletedListElement,
  MyCustomElement,
  MyLinkElement,
  MyListItemElement,
  MyNumberListElement,
} from "@/types/slate-custom-type";
import { nanoid } from "nanoid";
import { Editor, Element, Range, Transforms } from "slate";

const MARKDOWN_SHORTCUT = {
  "*": "ul",
  "-": "ul",
  "+": "ol",
  "1": "ol",
  "[]": "link",
  ">": "quote-block",
  "#": "h1",
  "##": "h2",
  "###": "h3",
  "####": "h4",
  "#####": "h5",
  "######": "h6",
};

const withMarkdown = (editor: Editor) => {
  const { insertText } = editor;

  editor.insertText = (text) => {
    const { selection } = editor;
    if (text.endsWith(" ") && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];

      const start = Editor.start(editor, path);

      const range = { anchor, focus: start };

      const beforeText = Editor.string(editor, range) + text.slice(0, -1);

      const isBlockExist = MARKDOWN_SHORTCUT.hasOwnProperty(beforeText);

      if (isBlockExist) {
        const blockType =
          MARKDOWN_SHORTCUT[beforeText as keyof typeof MARKDOWN_SHORTCUT];
        Transforms.select(editor, range);

        if (!Range.isCollapsed(range)) {
          Transforms.delete(editor);
        }

        const newElement: Partial<Element> = {
          id: nanoid(),
          type: blockType as any,
        };

        if (blockType === "ul" || blockType === "ol") {
          const listElement: Partial<MyListItemElement> = {
            id: nanoid(),
            type: "li",
          };

          Transforms.setNodes<Element>(editor, listElement, {
            match: (node) => Element.isElement(node),
          });

          const listType = blockType === "ul" ? "ul" : "ol";
          const listWrapper: Partial<
            MyBulletedListElement | MyNumberListElement
          > = {
            id: nanoid(),
            type: listType,
          };

          Transforms.wrapNodes(editor, listWrapper as MyCustomElement, {
            split: true,
          });
        } else if (blockType === "link") {
          const linkElement: MyLinkElement = {
            type: "link",
            href: "http://example.com",
            children: [{ text: "your link" }],
          };

          Transforms.insertNodes(editor, linkElement, {
            at: selection,
          });

          Transforms.move(editor, {
            distance: 2,
            unit: "word",
            reverse: false,
          });
        } else {
          Transforms.setNodes<Element>(editor, newElement);
        }
        return;
      }
    }
    insertText(text);
  };

  return editor;
};

export default withMarkdown;
