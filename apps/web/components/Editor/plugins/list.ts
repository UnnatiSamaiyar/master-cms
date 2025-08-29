import { Editor, Transforms, Element, Range, Point } from "slate";

const withList = (editor: Editor) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (unit) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: (n) => Element.isElement(n) && n.type === "li",
      });

      if (match) {
        const [, path] = match;
        const start = Editor.start(editor, path);

        if (Point.equals(selection.anchor, start)) {
          // If the cursor is at the beginning of the list item, unwrap it
          Transforms.unwrapNodes(editor, {
            match: (n) =>
              !Editor.isEditor(n) &&
              Element.isElement(n) &&
              ["ul", "ol"].includes(n.type),
            split: true,
          });
          Transforms.setNodes(editor, { type: "p", children: [{ text: "" }] });
          return;
        }
      }
    }

    deleteBackward(unit);
  };

  return editor;
};

export default withList;
