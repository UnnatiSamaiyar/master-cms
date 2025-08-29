import isHotkey from "is-hotkey";
import { Editor } from "slate";
import { toggleMark } from "./marks";

const HOT_KEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+m": "subscript",
} as const;

const onKeyDown = (
  event: React.KeyboardEvent<HTMLDivElement>,
  editor: Editor,
) => {
  for (const hotkey in HOT_KEYS) {
    if (isHotkey(hotkey, event)) {
      event.preventDefault();
      const markType = HOT_KEYS[hotkey as keyof typeof HOT_KEYS];
      toggleMark(editor, markType, true);
    }

    if (isHotkey("tab", event)) {
      event.preventDefault();
      Editor.insertText(editor, "   ");
    }
  }
};

export { onKeyDown, HOT_KEYS };
