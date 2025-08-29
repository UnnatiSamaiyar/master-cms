import React from "react";
import { RenderElementProps } from "slate-react";

export default function HorizontalRuleBlock({
  attributes,
  children,
}: RenderElementProps) {
  return (
    <div contentEditable={false} className="py-6 mt-4" {...attributes}>
      <hr
        className="h-[2px] cursor-pointer rounded-md bg-clip-content 
                border-none bg-border"
      />
      {children}
    </div>
  );
}
