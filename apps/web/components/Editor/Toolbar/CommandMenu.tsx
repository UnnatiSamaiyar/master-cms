import useEditorStore from "@/store/editorStore";
import React from "react";
import { useSlate } from "slate-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { blockTypes } from "./Fixed/TransformBlock";
import { toggleBlock } from "../utils/toggleBlocks";
import { emptyNode } from "../utils/emptyNode";
import { useMenuPosition } from "@/hooks/useMenu";

export default function CommandMenu() {
  const editor = useSlate();
  const { iscommandMenuOpen, setCommandMenu } = useEditorStore();
  const position = useMenuPosition(editor, iscommandMenuOpen);

  if (!iscommandMenuOpen || !position) return null;
  return (
    <div
      className="z-50 fixed  outline-none"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <DropdownMenu open={iscommandMenuOpen} onOpenChange={setCommandMenu}>
        <DropdownMenuTrigger></DropdownMenuTrigger>
        <DropdownMenuContent
          sideOffset={0}
          alignOffset={0}
          forceMount
          align="start"
          className="w-[12rem]"
        >
          <ScrollArea className="h-56">
            <DropdownMenuLabel>Basic Blocks</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {blockTypes.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onMouseDown={() => {
                  toggleBlock(editor, item.type);
                  emptyNode(editor);
                }}
              >
                {item.icon} {item.lable}
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
