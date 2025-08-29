import { Editor } from "slate";

export const getMarks = (editor: Editor) => {
  return Editor.marks(editor);
};

export const isActiveMark = (editor: Editor, format: string) => {
  const marks = getMarks(editor);
  if (!marks) return false;
  return marks.hasOwnProperty(format) ? true : false;
};

export const toggleMark = (
  editor: Editor,
  format: string,
  value: boolean | string,
) => {
  const isActive = isActiveMark(editor, format);
  if (isActive) {
    return Editor.removeMark(editor, format);
  }
  Editor.addMark(editor, format, value);
};
