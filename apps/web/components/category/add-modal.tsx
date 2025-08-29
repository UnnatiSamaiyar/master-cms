import React, { Fragment, useState } from "react";
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
import AddCategoryForm from "../forms/category/add-category";
import useCategoryStore from "@/store/categoryStore";
import { Category } from "@/types/category";

interface Props {
  category?: Category;
}

export default function AddCategoryModal({ category }: Props) {
  const [open, setOpen] = useState<boolean>(false);
  const { selectedWebsite } = useCategoryStore();
  if (!selectedWebsite) return null;

  const isSubCategory = !!category; // Check if subcategory
  const titleMessage = isSubCategory
    ? `Add Subcategory for "${category.name}"`
    : `Add Category for "${selectedWebsite.name}"`;

  const onClose = (value: boolean) => setOpen(!value);

  return (
    <Fragment>
      {/* Category Button */}
      {!isSubCategory && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-5 h-5 mr-1" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{titleMessage}</DialogTitle>
              <DialogDescription>
                Enter the name of your category and click on the save button.
              </DialogDescription>
            </DialogHeader>
            <AddCategoryForm onClose={onClose} />
          </DialogContent>
        </Dialog>
      )}

      {/* Subcategory Button */}
      {isSubCategory && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="w-full flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
              <Plus className="w-4 h-4 mr-1" />
              Add Subcategory
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{titleMessage}</DialogTitle>
              <DialogDescription>
                Enter the name of your subcategory and click on the save button.
              </DialogDescription>
            </DialogHeader>
            <AddCategoryForm category={category} onClose={onClose} />
          </DialogContent>
        </Dialog>
      )}
    </Fragment>
  );
}
