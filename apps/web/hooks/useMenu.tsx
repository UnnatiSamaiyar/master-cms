import { useEffect, useState } from "react";
import { Editor } from "slate";

interface Position {
  top: number;
  left: number;
}

export function useMenuPosition(editor: Editor, isOpen: boolean) {
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const { selection } = editor;
      if (!selection) return;

      const domSelection = window.getSelection();
      if (!domSelection?.rangeCount) return;

      const domRange = domSelection.getRangeAt(0);
      const rect = domRange.getBoundingClientRect();
      if (!rect) return;

      // Reduced offset for tighter positioning
      const offset = 5;

      // Get the viewport dimensions
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Calculate initial position
      let top = rect.bottom - offset;
      let left = rect.left;

      // Adjust position if it would go off screen
      const menuHeight = 235; // Approximate height of the menu
      const menuWidth = 192; // 12rem in pixels

      // Adjust vertical position if needed
      if (top + menuHeight > viewportHeight) {
        top = rect.top - menuHeight - (offset + 7);
      }

      // Adjust horizontal position if needed
      if (left + menuWidth > viewportWidth) {
        left = viewportWidth - menuWidth - offset;
      }

      // Ensure we don't position off the left edge
      left = Math.max(offset, left);

      setPosition({ top, left });
    };

    // Update position immediately
    updatePosition();

    // Update position on scroll or resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, editor.selection]);

  return position;
}
