import { Editor } from "slate";

const withHorizontalRule = (editor: Editor) => {
  const { isVoid } = editor;

  editor.isVoid = (element) => {
    return element.type === "hr" ? true : isVoid(element);
  };

  return editor;
};

export default withHorizontalRule;
