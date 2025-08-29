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
import { Grid, Loader, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { toastOptions } from "@/lib/constant";
import { Article } from "@/types/article";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";

interface SectionArticle extends Article {
  articleSectionId: string;
  isMain: boolean;
}

interface AlertMainDialogProps {
  article: SectionArticle;
  closeDropDown: (value: boolean) => void;
}

export function MainSectionArticle({
  closeDropDown,
  article,
}: AlertMainDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("websiteId");

  const handlClick = async () => {
    if (!article || !token) return;
    startTransition(async () => {
      const { message, error } = await apiClient.post(
        `/api/websites/${websiteId}/sections/articles/main`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            articleSectionId: article.articleSectionId,
            isMain: !article.isMain,
          }),
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
        <Button variant="ghost" className="w-full justify-start">
          <Grid className="h-4 w-4" />
          {article.isMain ? "Remove as Main Article" : "Set as Main Article"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm this change</AlertDialogTitle>
          <AlertDialogDescription>
            {article.isMain
              ? `This will remove "${article.title}" as the main article of this section.`
              : `This will set "${article.title}" as the main article of this section.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={handlClick} disabled={isPending}>
            {isPending ? (
              <Fragment>
                <Loader className="animate-spin w-4 h-4 mr-2" />
                Processing...
              </Fragment>
            ) : (
              "Confirm"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
