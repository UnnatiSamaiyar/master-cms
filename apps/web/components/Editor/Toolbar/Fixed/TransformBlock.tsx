import { MyCustomElement } from "@/types/slate-custom-type";
import {
  Check,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  MoreHorizontal,
  Quote,
  TypeOutline,
} from "lucide-react";
import React from "react";
import { useSlate } from "slate-react";
import { getTopLevelBlock } from "../../utils/getActiveBlock";
import { toggleBlock } from "../../utils/toggleBlocks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface Props {
  isFloatingtoolbar: boolean;
}

export interface BlockType {
  id: string;
  icon: React.ReactNode;
  type: MyCustomElement["type"];
  lable: string;
}

export const blockTypes: BlockType[] = [
  {
    id: "1",
    icon: <TypeOutline size={20} />,
    type: "p",
    lable: "Paragraph",
  },
  {
    id: "2",
    icon: <Heading1 size={20} />,
    type: "h1",
    lable: "Heading 1",
  },
  {
    id: "3",
    lable: "Heading 2",
    icon: <Heading2 size={20} />,
    type: "h2",
  },
  {
    id: "4",
    lable: "Heading 3",
    icon: <Heading3 size={20} />,
    type: "h3",
  },
  {
    id: "5",
    lable: "Heading 4",
    icon: <Heading4 size={20} />,
    type: "h4",
  },
  {
    id: "6",
    lable: "Heading 5",
    icon: <Heading5 size={20} />,
    type: "h5",
  },
  {
    id: "7",
    lable: "Heading 6",
    icon: <Heading6 size={20} />,
    type: "h6",
  },
  {
    id: "8",
    lable: "Bulleted List",
    icon: <List size={20} />,
    type: "ul",
  },
  {
    id: "9",
    lable: "Numbered List",
    icon: <ListOrdered size={20} />,
    type: "ol",
  },
  {
    id: "10",
    lable: "Block Quote",
    icon: <Quote size={20} />,
    type: "quote-block",
  },

  {
    id: "11",
    lable: "Line Break",
    icon: <MoreHorizontal size={20} />,
    type: "hr",
  },
];

export default function TransformBlock({ isFloatingtoolbar }: Props) {
  const [open, setOpen] = React.useState(false);
  const [selectedBlock, setselectedBlock] = React.useState("paragraph");
  const editor = useSlate();

  React.useEffect(() => {
    const { selection } = editor;
    if (!selection) return;
    const block = getTopLevelBlock(editor) as MyCustomElement;
    if (!block) return;
    setselectedBlock(block.type);
  }, [editor.selection]);

  const handleClick = (blockType: string) => {
    toggleBlock(editor, blockType);
    setOpen((prevState) => !prevState);
  };

  const typeMapping = (type: string) =>
    blockTypes.filter((item) => item.type === type)[0];

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger
            onClick={(e) => e.preventDefault()}
            className="mr-2 hover:dark:bg-[#3b3b40 hover:bg-accent"
            asChild
          >
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                className={`${
                  isFloatingtoolbar
                    ? "hover:dark:bg-[#3b3b40] rounded-none mx-0 space-x-1"
                    : "rounded-md space-x-2"
                }`}
              >
                <span>{typeMapping(selectedBlock)?.lable || "Paragraph"}</span>
                {
                  <ChevronDown
                    className={cn("h-4 w-4", open ? "rotate-180" : "")}
                  />
                }
              </Button>
            </TooltipTrigger>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[13em]" align="start">
            <DropdownMenuLabel>Turn Into </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Command>
              <CommandList>
                <CommandGroup>
                  {blockTypes.map((block) => (
                    <CommandItem
                      key={block.id}
                      value={block.lable}
                      className="flex items-center justify-between"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleClick(block.type);
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p> {block.icon}</p>
                        <p>{block.lable} </p>
                      </div>
                      {selectedBlock === block.type && (
                        <Check className="h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent>Turn into</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
