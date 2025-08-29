import React, { FormEvent } from "react";
import { ReactEditor, useSlate } from "slate-react";
import { Editor, Element } from "slate";
import { toast } from "sonner";
import { toastOptions } from "@/lib/constant";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Copy, ExternalLink, Trash } from "lucide-react";
import { unwrapBlock } from "../utils/transforms";
import { updateLink } from "../utils/updateLink";
import { MyLinkElement } from "@/types/slate-custom-type";

const isSelectionOnLink = (editor: Editor) => {
  if (!editor.selection) return false;

  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === "link",
  });

  return match;
};

export default function LinkPopover() {
  const editor = useSlate();
  const [popoverPosition, setPopoverPosition] = React.useState<{
    top: number;
    left: number;
  } | null>(null);

  const [linkCopied, setLinkCopied] = React.useState(false);
  const [linkUrl, setlinkUrl] = React.useState("");

  React.useEffect(() => {
    const { selection } = editor;

    if (!selection) {
      return;
    }

    const handleSelection = () => {
      const linkNode = isSelectionOnLink(editor);
      if (linkNode) {
        const node = linkNode[0] as MyLinkElement;

        // Avoid resetting the linkUrl if it's already being edited
        if (!popoverPosition) {
          setlinkUrl(node.href);
        }
        const domNode = ReactEditor.toDOMNode(editor, linkNode[0]);
        const rect = domNode.getBoundingClientRect();

        setPopoverPosition({
          top: rect.top + window.scrollY, // Position below the link
          left: rect.left + window.scrollX, // Start of the link
        });
      } else {
        setPopoverPosition(null);
      }
    };

    addEventListener("mouseup", handleSelection);
    return () => removeEventListener("mouseup", handleSelection);
  }, [editor.selection, popoverPosition]);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateLink(editor, linkUrl);
    setPopoverPosition(null);
    toast("Link has been updated successfully.", {
      ...toastOptions,
      description: `Your link is updated to ${linkUrl}`,
    });
  };

  const removeLink = () => {
    unwrapBlock(editor, "link");
    setPopoverPosition(null);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(linkUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 3000);
  };

  return (
    <>
      {popoverPosition && (
        <div
          className="rounded-md z-50 
      absolute dark:bg-secondary transition-shadow
       py-1.5 object-fill overflow-hidden 
     border bg-popover p-4 text-popover-foreground
     shadow-md outline-none"
          style={{
            top: popoverPosition.top + 20,
            left: popoverPosition.left,
          }}
        >
          <form onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 gap-4 w-64">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="link">Link</Label>
                <Input
                  id="link"
                  placeholder="Enter your link"
                  value={linkUrl}
                  type="text"
                  onChange={(e) => {
                    console.log(e.target.value);
                    setlinkUrl(e.target.value);
                  }}
                />
              </div>
              <Button>Submit</Button>
            </div>
          </form>
          <div className="my-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size={"icon"} variant={"ghost"} onClick={copyLink}>
                  {linkCopied ? (
                    <Check size={17} className="text-green-700" />
                  ) : (
                    <Copy size={17} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy link</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size={"icon"} variant={"ghost"} onClick={removeLink}>
                  <Trash
                    size={16}
                    className="text-red-600 hover:text-red-700"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete link</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size={"icon"}
                  variant={"ghost"}
                  onClick={() => window.open(linkUrl, "_blank")}
                >
                  <ExternalLink size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open link</TooltipContent>
            </Tooltip>
          </div>{" "}
        </div>
      )}
    </>
  );
}
