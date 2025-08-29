"use client";

import * as React from "react";
import { Baseline, Check, Eraser, PaintBucket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ntc from "ntcjs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { getMarks, toggleMark } from "../utils/marks";
import { useSlate } from "slate-react";
import { RichText } from "@/types/slate-custom-type";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  mark: "highlight" | "color";
}

const defaultColors = [
  // Grays
  [
    "#000000",
    "#424242",
    "#616161",
    "#757575",
    "#9E9E9E",
    "#BDBDBD",
    "#E0E0E0",
    "#EEEEEE",
    "#F5F5F5",
    "#FFFFFF",
  ],
  // Reds to Pinks
  [
    "#FF0000",
    "#FF1744",
    "#FF5252",
    "#FF4081",
    "#EC407A",
    "#E91E63",
    "#D81B60",
    "#C2185B",
    "#AD1457",
    "#880E4F",
  ],
  // Oranges to Yellows
  [
    "#FF9100",
    "#FF6D00",
    "#FF3D00",
    "#DD2C00",
    "#FFD600",
    "#FFAB00",
    "#FF6F00",
    "#FF8F00",
    "#FFA000",
    "#FFB300",
  ],
  // Light Greens
  [
    "#76FF03",
    "#64DD17",
    "#B2FF59",
    "#CCFF90",
    "#F4FF81",
    "#C6FF00",
    "#AEEA00",
    "#9CCC65",
    "#7CB342",
    "#558B2F",
  ],
  // Greens
  [
    "#00E676",
    "#00C853",
    "#69F0AE",
    "#00E5FF",
    "#1DE9B6",
    "#00B8D4",
    "#00BFA5",
    "#009688",
    "#00796B",
    "#004D40",
  ],
  // Blues
  [
    "#2979FF",
    "#2962FF",
    "#448AFF",
    "#82B1FF",
    "#80D8FF",
    "#40C4FF",
    "#00B0FF",
    "#0091EA",
    "#0288D1",
    "#01579B",
  ],
  // Deep Purples
  [
    "#651FFF",
    "#6200EA",
    "#7C4DFF",
    "#B388FF",
    "#E040FB",
    "#D500F9",
    "#AA00FF",
    "#7B1FA2",
    "#6A1B9A",
    "#4A148C",
  ],
];

export default function ColorPicker({ mark }: ColorPickerProps) {
  const [open, setopen] = React.useState<boolean>(false);
  const [value, setValue] = React.useState<string | null>();
  const editor = useSlate();

  const activeMark = getMarks(editor) as RichText | null;

  React.useEffect(() => {
    if (!activeMark) return;
    const myMark = activeMark.hasOwnProperty(mark);
    if (myMark) {
      if (value !== activeMark[mark]) {
        setValue(activeMark[mark]);
      }
    }
  }, [activeMark, value]);

  const getColorName = (color: string) => {
    const n_match = ntc.name(color);
    return n_match[1];
  };

  const handleColorClick = (color: string) => {
    toggleMark(editor, mark, color);
    setopen((prevState) => !prevState);
  };

  const removeMark = () => {
    toggleMark(editor, mark, false);
    setValue(null);
    setopen((prevState) => !prevState);
  };

  return (
    <Tooltip>
      <Popover open={open} onOpenChange={setopen}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              {mark === "color" ? (
                <Baseline className="h-4 w-4" />
              ) : (
                <PaintBucket className="h-4 w-4" />
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <PopoverContent className="w-full px-0 py-2">
          {/* Default Colors Section */}
          <div>
            <h3 className="text-sm text-muted-foreground font-medium mb-2 p-2">
              Default Colors
            </h3>
            <Separator className="my-2" />
            <div className="grid gap-2 p-2">
              {defaultColors.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-2">
                  {row.map((color, colIndex) => (
                    <Tooltip key={`${color}-${colIndex}`}>
                      <TooltipTrigger asChild>
                        <div className="relative transition-transform duration-200 ease-in-out hover:scale-125">
                          <button
                            onClick={() => handleColorClick(color)}
                            className={cn(
                              "w-6 h-6 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ",
                              getColorName(color) === "White" &&
                                "border border-gray-200",
                            )}
                            style={{ backgroundColor: color }}
                          />
                          {/* Check if the color matches the state value */}
                          {value === color && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check
                                className={cn(
                                  "h-4 w-4 text-white translate-y-[0.20rem]",
                                  getColorName(color) === "White" &&
                                    "text-black",
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{getColorName(color)}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {value?.length && (
            <div className="">
              <Separator className="my-1.5" />
              <div className="px-1">
                <Button
                  className="w-full justify-start px-[0.4rem]"
                  variant="ghost"
                  onClick={() => removeMark()}
                >
                  <Eraser /> Clear
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
      <TooltipContent>
        {mark === "color" ? "Text color" : "Background color"}
      </TooltipContent>
    </Tooltip>
  );
}
