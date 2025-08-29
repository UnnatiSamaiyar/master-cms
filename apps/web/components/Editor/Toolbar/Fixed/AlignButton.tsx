import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alignment } from "@/types/slate-custom-type";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";
import { useSlate } from "slate-react";
import { toggleAlignment } from "../../utils/toggleAlignment";
import { getTopLevelBlock } from "../../utils/getActiveBlock";

const alignments: Alignment[] = [
  {
    id: "1",
    icon: <AlignLeft className="h-4 w-4" />,
    type: "left",
  },
  {
    id: "2",
    icon: <AlignCenter className="h-4 w-4" />,
    type: "center",
  },
  {
    id: "3",
    icon: <AlignRight className="h-4 w-4" />,
    type: "right",
  },
  {
    id: "4",
    icon: <AlignJustify className="h-4 w-4" />,
    type: "justify",
  },
];

export default function AlignButton() {
  const [value, setValue] = React.useState<string>("");
  const editor = useSlate();

  React.useEffect(() => {
    if (!editor.selection) return;

    const topLevelBlock = getTopLevelBlock(editor);
    if (!topLevelBlock?.align) return setValue("");
    setValue(topLevelBlock.align);
  }, [editor.selection]);

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(value) => setValue(value)}
    >
      {alignments.map((alignment) => (
        <Tooltip key={alignment.id}>
          <TooltipTrigger asChild>
            <div>
              <ToggleGroupItem
                key={alignment.id}
                onClick={() => toggleAlignment(editor, alignment.type)}
                value={alignment.type}
                aria-label={`Toggle ${alignment.type}`}
              >
                {alignment.icon}
              </ToggleGroupItem>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              <span className="capitalize">Align {alignment.type}</span>
            </p>
          </TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  );
}
