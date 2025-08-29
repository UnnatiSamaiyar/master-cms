import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import useCategoryStore from "@/store/sectionStore";
import { Section } from "@/types/section";
import EditsectionForm from "../forms/sections/edit-section";

interface Props {
  section: Section;
}

export default function EditSectionModal({ section }: Props) {
  const [open, setOpen] = useState<boolean>(false);
  const { selectedWebsite } = useCategoryStore();
  if (!selectedWebsite) return null;

  const onClose = (value: boolean) => setOpen(!value);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-blue-600 hover:text-blue-800">
          <Pencil className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit "{section.name}" Section for "{selectedWebsite.name}"
          </DialogTitle>
          <DialogDescription>
            Enter the name of your section and click on the save button.
          </DialogDescription>
        </DialogHeader>
        <EditsectionForm section={section} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
