"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ColorPickerProps {
  onColorSelect?: (color: string) => void;
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

const customColorPresets = [
  "#8B4513",
  "#808080",
  "#A9A9A9",
  "#4169E1",
  "#800080",
];

export function ColorPicker({ onColorSelect }: ColorPickerProps) {
  const [customColors, setCustomColors] =
    React.useState<string[]>(customColorPresets);
  const [hoveredColor, setHoveredColor] = React.useState<string | null>(null);
  const [hoveredName, setHoveredName] = React.useState<string | null>(null);

  const getColorName = (color: string, rowIndex: number, colIndex: number) => {
    const hueNames = [
      "Gray",
      "Red",
      "Orange",
      "Light Green",
      "Green",
      "Blue",
      "Purple",
    ];
    return `${hueNames[rowIndex]} ${colIndex + 1}`;
  };

  const handleColorClick = (color: string) => {
    onColorSelect?.(color);
    if (!customColors.includes(color) && customColors.length < 10) {
      setCustomColors([...customColors, color]);
    }
  };

  return (
    <TooltipProvider>
      <div className="w-[400px] p-4 bg-white rounded-lg shadow-lg">
        <div className="space-y-4">
          {/* Custom Colors Section */}
          <div>
            <h3 className="text-sm font-medium mb-2">Custom Colors</h3>
            <div className="flex items-center gap-2">
              {customColors.map((color, index) => (
                <Tooltip key={`${color}-${index}`}>
                  <TooltipTrigger>
                    <button
                      onClick={() => handleColorClick(color)}
                      className="w-6 h-6 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      style={{ backgroundColor: color }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{color}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {customColors.length < 10 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="w-6 h-6 rounded-full"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Default Colors Section */}
          <div>
            <h3 className="text-sm font-medium mb-2">Default Colors</h3>
            <div className="grid gap-1">
              {defaultColors.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1">
                  {row.map((color, colIndex) => (
                    <Tooltip key={`${color}-${colIndex}`}>
                      <TooltipTrigger>
                        <button
                          onMouseEnter={() => {
                            setHoveredColor(color);
                            setHoveredName(
                              getColorName(color, rowIndex, colIndex),
                            );
                          }}
                          onMouseLeave={() => {
                            setHoveredColor(null);
                            setHoveredName(null);
                          }}
                          onClick={() => handleColorClick(color)}
                          className="w-6 h-6 hover:scale-125 ease-out rounded-full focus:outline-none"
                          style={{ backgroundColor: color }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{getColorName(color, rowIndex, colIndex)}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
