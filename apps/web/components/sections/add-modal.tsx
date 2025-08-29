import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import AddSectionForm from "../forms/sections/add-section";
import useCategoryStore from "@/store/sectionStore";

export default function AddSectionModal() {
  const [open, setOpen] = useState<boolean>(false);
  const { selectedWebsite } = useCategoryStore();
  if (!selectedWebsite) return null;

  const onClose = (value: boolean) => setOpen(!value);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-1" />
          Add Section
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add Section for "{selectedWebsite.name}"</DialogTitle>
          <DialogDescription>
            Enter the name of your section and click on the save button.
          </DialogDescription>
        </DialogHeader>
        <AddSectionForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
