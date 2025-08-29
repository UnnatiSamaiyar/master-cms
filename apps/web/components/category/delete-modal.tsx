import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Category } from "@/types/category";
import { Loader2, Trash2 } from "lucide-react";

import React, { Fragment, useState, useTransition } from "react";
import { Button } from "../ui/button";
import { apiClient } from "@/lib/apiClient";
import useCategoryStore from "@/store/categoryStore";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { toastOptions } from "@/lib/constant";

interface Props {
  category: Category;
}

export default function DeleteCategory({ category }: Props) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState<boolean>(false);
  const { selectedWebsite } = useCategoryStore();
  if (!selectedWebsite) return null;
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;

  const handleDelete = () => {
    startTransition(async () => {
      const url = `/api/websites/${selectedWebsite.id}/categories/${category.id}`;
      const { message, error } = await apiClient.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (error) {
        toast.error(error, toastOptions);
      } else {
        toast.success(message, toastOptions);
        setOpen((prevState) => !prevState);
      }
    });
  };
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button className="text-red-600 hover:text-red-800">
          <Trash2 className="w-4 h-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you absolutely sure to delete {category.name}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete category,
            article, article related content and subcatory. It will remove data
            from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending ? (
              <Fragment>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ...please wait
              </Fragment>
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
