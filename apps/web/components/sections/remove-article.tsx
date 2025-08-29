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
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";

interface SectionArticle extends Article {
  articleSectionId: string;
}

interface AlertDeleteDialogProps {
  article: SectionArticle;
  closeDropDown: (value: boolean) => void;
}

export function RemoveSectionArticle({
  closeDropDown,
  article,
}: AlertDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("websiteId");

  const handleDelete = async () => {
    if (!article || !token) return;
    startTransition(async () => {
      const { message, error } = await apiClient.delete(
        `/api/websites/${websiteId}/sections/articles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ articleSectionId: article.articleSectionId }),
        },
      );
      if (error) {
        toast.error(error, toastOptions);
      } else {
        toast.success(message, toastOptions);
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
          Remove Article{" "}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently remove the "
            {article.title}" article from server.
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
              "Remove Article"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
