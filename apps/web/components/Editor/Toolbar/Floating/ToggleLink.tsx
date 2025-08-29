import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useSlate } from "slate-react";
import { Link } from "lucide-react";
import { toggleLink } from "../../utils/toggleLink";

export default function ToogleLink() {
  const editor = useSlate();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          asChild
          className="mx-0"
          onClick={() => {
            const url = "http://www.google.com";
            toggleLink(editor, url);
          }}
        >
          <Button
            variant={"ghost"}
            size={"sm"}
            className="hover:dark:bg-[#3b3b40] rounded-none mx-0"
          >
            <Link className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Insert Link</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
