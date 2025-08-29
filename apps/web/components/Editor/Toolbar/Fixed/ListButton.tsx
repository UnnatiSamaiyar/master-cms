import { List as ListType } from "@/types/slate-custom-type";
import { List, ListOrdered } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSlate } from "slate-react";
import React from "react";
import { toggleBlock } from "../../utils/toggleBlocks";
import { getTopLevelBlock } from "../../utils/getActiveBlock";
import { Element } from "slate";

const lists: ListType[] = [
  {
    id: "1",
    icon: <List className="h-4 w-4" />,
    type: "ul",
  },
  {
    id: "2",
    icon: <ListOrdered className="h-4 w-4" />,
    type: "ol",
  },
];

export default function ListButton() {
  const [value, setValue] = React.useState<string>("");
  const editor = useSlate();

  React.useEffect(() => {
    if (!editor.selection) return;

    const topLevelBlock = getTopLevelBlock(editor) as Element;
    if (!["ul", "ol"].includes(topLevelBlock.type)) return setValue("");
    setValue(topLevelBlock.type);
  }, [editor.selection]);

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(value) => setValue(value)}
    >
      {lists.map((list) => (
        <Tooltip key={list.id}>
          <TooltipTrigger asChild>
            <div>
              <ToggleGroupItem
                key={list.id}
                onClick={() => toggleBlock(editor, list.type)}
                value={list.type}
                aria-label={`Toggle List`}
              >
                {list.icon}
              </ToggleGroupItem>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              <span className="capitalize">
                {list.type === "ul" ? "Bulleted" : "Numbered"} List
              </span>
            </p>
          </TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  );
}
