import React from "react";
import MarksButton from "./MarksButton";
import HistoryButton from "./HistoryButton";
import { Redo, Undo } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import AlignButton from "./AlignButton";
import ListButton from "./ListButton";
import TransformBlock from "./TransformBlock";
import ColorPicker from "../ColorPicker";
import LinkButton from "./LinkButton";
import ImageButton from "./ImageButton";

export default function FixedToolBar() {
  return (
    <div
      className="flex items-center space-x-1 flex-wrap px-2 
               bg-background top-0 py-1 border-b z-50 md:px-10"
      style={{ position: "sticky", top: 0 }}
    >
      <HistoryButton type="undo" icon={<Undo className="h-4 w-4" />} />
      <HistoryButton type="redo" icon={<Redo className="h-4 w-4" />} />
      <TransformBlock isFloatingtoolbar={false} />
      <Separator orientation="vertical" className="h-5 font-semibold" />
      <MarksButton />
      <ColorPicker mark={"color"} />
      <ColorPicker mark={"highlight"} />
      <Separator orientation="vertical" className="h-5 font-semibold" />
      <ListButton />
      <Separator orientation="vertical" className="h-5 font-semibold" />
      <AlignButton />
      <Separator orientation="vertical" className="h-5 font-semibold" />
      <LinkButton />
      <ImageButton />
    </div>
  );
}
