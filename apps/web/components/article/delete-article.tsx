"use client";

import { Fragment, useState, useTransition } from "react";
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
import { Button } from "@/components/ui/button";
import { Loader, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { toastOptions } from "@/lib/constant";
import { Article } from "@/types/article";
import { deleteArticle } from "@/action";

interface AlertDeleteDialogProps {
  article: Article;
  closeDropDown: (value: boolean) => void;
}

export function DeleteArticle({
  closeDropDown,
  article,
}: AlertDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (!article || !token) return;
    startTransition(async () => {
      const { success, error } = await deleteArticle(token, article.id);
      if (error) {
        toast.error(error, toastOptions);
      } else {
        toast.success(success, toastOptions);
        setOpen((prevState) => !prevState);
        closeDropDown(false);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100"
        >
          <Trash className="h-4 w-4" />
          Delete Article
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the "
            {article.title}" article and remove it from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <Fragment>
                <Loader className="animate-spin w-4 h-4 mr-2" />
                Please wait...
              </Fragment>
            ) : (
              "Delete Article"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
