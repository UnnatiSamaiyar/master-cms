import React, { Fragment, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import EditCategoryForm from "../forms/category/edit-category";
import useCategoryStore from "@/store/categoryStore";
import { Category } from "@/types/category";

interface Props {
  category: Category;
}

export default function EditCategoryModal({ category }: Props) {
  const [open, setOpen] = useState<boolean>(false);
  const { selectedWebsite } = useCategoryStore();
  if (!selectedWebsite) return null;

  const onClose = (value: boolean) => setOpen(!value);

  return (
    <Fragment>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="text-blue-600 hover:text-blue-800">
            <Pencil className="w-4 h-4" />
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit "{category.name}"</DialogTitle>
            <DialogDescription>
              Enter the name of your category and click on the save button.
            </DialogDescription>
          </DialogHeader>
          <EditCategoryForm data={category} onClose={onClose} />
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}
