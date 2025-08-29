import { MyCustomElement, MyParagraphElement } from "@/types/slate-custom-type";
import { Editor, Transforms } from "slate";
import { nanoid } from "nanoid";

export const insertBlock = (editor: Editor, node: MyCustomElement) => {
  Transforms.insertNodes(editor, node);
  if (node.type === "img") {
    const EmptyParagraph: MyParagraphElement = {
      id: nanoid(),
      type: "p",
      children: [{ text: "" }],
    };
    Transforms.insertNodes(editor, EmptyParagraph, { mode: "highest" });
  }
};
