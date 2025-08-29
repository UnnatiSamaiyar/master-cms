import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Marks } from "@/types/slate-custom-type";
import {
  Bold,
  Italic,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
} from "lucide-react";
import React from "react";
import { getMarks, toggleMark } from "../../utils/marks";
import { useSlate } from "slate-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const marks: Marks[] = [
  {
    id: "1",
    icon: <Bold className="h-4 w-4" />,
    mark: "bold",
    shortcut: "(Ctrl+B)",
  },
  {
    id: "2",
    icon: <Italic className="h-4 w-4" />,
    mark: "italic",
    shortcut: "(Ctrl+I)",
  },
  {
    id: "3",
    icon: <Underline className="h-4 w-4" />,
    mark: "underline",
    shortcut: "(Ctrl+U)",
  },
  {
    id: "4",
    icon: <Superscript className="h-4 w-4" />,
    mark: "superscript",
    shortcut: "(Ctrl+Shift+P)",
  },
  {
    id: "5",
    icon: <Subscript className="h-4 w-4" />,
    mark: "subscript",
    shortcut: "(Ctrl+Shift+B)",
  },
  {
    id: "6",
    icon: <Strikethrough className="h-4 w-4" />,
    mark: "strike",
    shortcut: "(Ctrl+Shift+X)",
  },
];

export default function MarksButton() {
  const [value, setValue] = React.useState<string[]>([]);
  const editor = useSlate();
  const activeMarks = getMarks(editor);

  React.useEffect(() => {
    if (!activeMarks) return;
    const newMarks = Object.keys(activeMarks);

    // Update state only if the new marks differ from
    // the current state to prevent from indefinite update exceed
    if (JSON.stringify(newMarks) !== JSON.stringify(value)) {
      setValue(newMarks);
    }
  }, [activeMarks, value]);

  return (
    <ToggleGroup
      type="multiple"
      value={value}
      onValueChange={(value) => setValue(value)}
    >
      {marks.map((mark) => (
        <Tooltip key={mark.id}>
          <TooltipTrigger asChild>
            <div>
              <ToggleGroupItem
                key={mark.id}
                onClick={() => toggleMark(editor, mark.mark, true)}
                value={mark.mark}
                aria-label={`Toggle ${mark.mark}`}
              >
                {mark.icon}
              </ToggleGroupItem>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              <span className="capitalize">{mark.mark}</span>
              <span className="ml-1">{mark.shortcut}</span>
            </p>
          </TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  );
}
