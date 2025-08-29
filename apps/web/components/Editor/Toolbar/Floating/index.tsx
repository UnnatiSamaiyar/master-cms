import React from "react";
import dynamic from "next/dynamic";
import { useSlate } from "slate-react";
import { Editor, Range } from "slate";
import MarksButton from "../Fixed/MarksButton";
import TransformBlock from "../Fixed/TransformBlock";
import ToggleLink from "@/components/Editor/Toolbar/Floating/ToggleLink";
import Portal from "@/components/Portal";
const ColorPicker = dynamic(() => import("../ColorPicker"), { ssr: false });

export default function Floating() {
  const toolbarRef = React.useRef<HTMLDivElement | null>(null);
  const editor = useSlate();
  const { selection } = editor;

  React.useEffect(() => {
    const el = toolbarRef.current;
    const { selection } = editor;
    if (!el) return;
    if (
      !selection ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ""
    ) {
      el.removeAttribute("style");
      return;
    }
    const domSelection = getSelection();
    const domRange = domSelection?.getRangeAt(0);
    const rect = domRange?.getBoundingClientRect();
    if (rect) {
      el.style.opacity = "1";
      el.style.top = `${rect.top + window.scrollY - el.offsetHeight}px`;
      let calPos = rect.left - el.offsetWidth / 2;
      if (!el.parentElement) return;

      const ParentContainer = el.parentElement.offsetWidth;
      if (calPos < 0) {
        const diff = ParentContainer + calPos;
        calPos = ParentContainer - diff;
      }
      if (calPos + el.offsetWidth > ParentContainer) {
        const diff = calPos + el.offsetWidth - ParentContainer;
        calPos = ParentContainer - diff - el.offsetWidth;
      }
      el.style.left = `${calPos}px`;
    }
  }, [selection]);

  return (
    <Portal>
      <div
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        ref={toolbarRef}
        className="rounded-md z-50 -top[10000px] opacity-0 -mt-2
      -left[10000px] absolute dark:bg-secondary transition-shadow
      border py-0 object-fill overflow-hidden bg-background"
      >
        <div className="flex items-center h-8">
          <MarksButton />
          <ColorPicker mark="color" />
          <ColorPicker mark="highlight" />
          <TransformBlock isFloatingtoolbar={true} />
          <ToggleLink />
        </div>
      </div>
    </Portal>
  );
}
