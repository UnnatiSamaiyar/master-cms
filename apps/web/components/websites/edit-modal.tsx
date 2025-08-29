import { Website } from "@/types/website";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import EditWebsiteForm from "../forms/websites/edit";

interface Props {
  website: Website;
}

export default function EditWebsiteModal({ website }: Props) {
  const [open, setOpen] = useState(false);

  const onClose = (value: boolean) => setOpen(!value);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="py-1.5 text-sm hover:bg-accent rounded-sm flex px-2 cursor-pointer w-full disabled:cursor-not-allowed">
        Edit Website
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Website</DialogTitle>
        </DialogHeader>
        <EditWebsiteForm website={website} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
