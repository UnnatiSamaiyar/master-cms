import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";
import { useSlate } from "slate-react";

interface Props {
  icon: React.ReactNode;
  type: "undo" | "redo";
}
export default function HistoryButton({ icon, type }: Props) {
  const [isDisabled, setisDisabled] = React.useState<boolean>(true);
  const editor = useSlate();
  const historyHanlder = () =>
    type === "undo" ? editor.undo() : editor.redo();

  React.useEffect(() => {
    const updateDisabledState = () => {
      if (type === "undo") {
        setisDisabled(editor.history.undos.length === 0);
      }
      if (type === "redo") {
        setisDisabled(editor.history.redos.length === 0);
      }
    };

    updateDisabledState();

    // Re-run whenever the history changes
    const { undos, redos } = editor.history;
    const interval = setInterval(updateDisabledState, 100); // Small polling interval

    return () => clearInterval(interval);
  }, [type, editor.history.undos.length, editor.history.redos.length]);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size={"icon"}
          variant={"ghost"}
          className="h-8"
          disabled={isDisabled}
          onClick={historyHanlder}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent className="capitalize">
        {type} {""}
        {type === "undo" ? <span>(Ctrl+Z)</span> : <span>(Ctrl+Y)</span>}
      </TooltipContent>
    </Tooltip>
  );
}
