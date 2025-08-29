import React, { ChangeEvent, useRef, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  ReactEditor,
  RenderElementProps,
  useFocused,
  useSelected,
  useSlateStatic,
} from "slate-react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImperativePanelHandle } from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Transforms } from "slate";
import { MyImageELement } from "@/types/slate-custom-type";
import { removeBlock } from "../utils/removeBlock";
import { ExternalLink, Trash } from "lucide-react";

type DragSide = "left" | "right";

interface Draging {
  isDraging: boolean;
  side: DragSide;
}

export default function ImageBlock({
  attributes,
  children,
  element,
}: RenderElementProps) {
  const selected = useSelected();
  const focused = useFocused();
  const editor = useSlateStatic();
  const path = ReactEditor.findPath(editor, element);
  const [dragSide, setDragSide] = useState<Draging>();
  const [captiontext, setCaptiontext] = useState(
    element.type === "img" ? element.caption || "" : "",
  );
  const [targetUrl, setTargetUrl] = useState(
    element.type === "img" ? element.targetUrl || "" : "",
  );

  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const middlePanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  const onLayout = (newSize: number[]) => {
    if (dragSide?.isDraging && dragSide.side === "left") {
      rightPanelRef.current?.resize(newSize[0] as any);
    } else if (dragSide?.isDraging && dragSide.side === "right") {
      leftPanelRef.current?.resize(newSize[2] as any);
    }
  };

  const CaptionChangeEvent = (e: ChangeEvent<HTMLInputElement>) => {
    const ImageElement: Partial<MyImageELement> = {
      caption: e.target.value,
    };
    Transforms.setNodes(editor, ImageElement);
    setCaptiontext(e.target.value);
  };

  const TargetUrlChangeEvent = (e: ChangeEvent<HTMLInputElement>) => {
    const ImageElement: Partial<MyImageELement> = {
      targetUrl: e.target.value,
    };
    Transforms.setNodes(editor, ImageElement);
    setTargetUrl(e.target.value);
  };

  const handleImageClick = () => {
    // if (element.type !== "img") return;
    // if (!selected && element.targetUrl) {
    //   window.open(element.targetUrl, "_blank", "noopener,noreferrer");
    // }
  };

  return (
    <div {...attributes} contentEditable={false} className="mt-4">
      <ResizablePanelGroup
        direction="horizontal"
        className="max-h-[500px]"
        onLayout={onLayout}
      >
        <ResizablePanel
          defaultSize={20}
          id="left"
          order={1}
          minSize={5}
          maxSize={40}
          ref={leftPanelRef}
        />
        <ResizableHandle
          withHandle
          className="border-none bg-none"
          onDragging={(value: any) =>
            setDragSide((prevState) => ({
              ...prevState,
              side: "left",
              isDraging: value,
            }))
          }
        />
        <ResizablePanel
          id="middle"
          order={2}
          defaultSize={60}
          minSize={20}
          ref={middlePanelRef}
        >
          <div
            className={`${
              selected && focused ? "border-2 rounded-md" : ""
            } mx-2 px-1 py-1 ${!selected && element.type === "img" && element.targetUrl ? "cursor-pointer" : ""}`}
          >
            <AspectRatio
              ratio={10 / 4}
              className={"flex h-full item-center justify-center"}
            >
              {element.type == "img" ? (
                <React.Fragment>
                  <Image
                    src={element.url}
                    fill
                    alt="image"
                    className="rounded-md"
                    onClick={handleImageClick}
                  />

                  {selected && focused && (
                    <div className="absolute top-2 left-3 flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger
                            onMouseDown={(e) => e.preventDefault()}
                            asChild
                            onClick={(e) => {
                              e.preventDefault();
                              removeBlock(editor, path);
                            }}
                          >
                            <Button
                              size={"icon"}
                              className="hover:text-red-900"
                            >
                              <Trash size={17} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete image</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </React.Fragment>
              ) : null}
            </AspectRatio>
          </div>
          {selected && element.type === "img" && (
            <div className="flex flex-col place-items-center gap-2 my-2">
              <input
                value={captiontext}
                placeholder="Write your caption"
                type="text"
                onChange={CaptionChangeEvent}
                className="border-none outline-none px-1"
              />
              <div className="text-center flex items-center">
                <ExternalLink size={14} className="text-gray-600" />
                <input
                  value={targetUrl}
                  placeholder="Add target url"
                  type="url"
                  onChange={TargetUrlChangeEvent}
                  className="border-none outline-none px-1 flex-1"
                />
              </div>
            </div>
          )}
        </ResizablePanel>
        <ResizableHandle
          withHandle
          onDragging={(value: any) =>
            setDragSide((prevState) => ({
              ...prevState,
              side: "right",
              isDraging: value,
            }))
          }
        />
        <ResizablePanel
          id="right"
          order={3}
          defaultSize={20}
          minSize={5}
          maxSize={40}
          ref={rightPanelRef}
        />
      </ResizablePanelGroup>
      {children}
    </div>
  );
}
