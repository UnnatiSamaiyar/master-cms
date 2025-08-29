"use client";
import React, { useState, useTransition } from "react";
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
import { useSession } from "next-auth/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import SubmitButton from "../submit-button";
import { unpublishArticle } from "@/action";
import { toastOptions } from "@/lib/constant";
import { apiClient } from "@/lib/apiClient";

type Props = {
  article: {
    id: string;
    title: string;
    isPublished: boolean;
    articleId: string;
  };
};

export default function UnpublishArticle({ article }: Props) {
  const [open, setopen] = useState<boolean>(false);
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;
  const { id } = useParams();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("websiteId");

  const unpublishHandler = () => {
    if (!id) return;
    startTransition(async () => {
      if (pathname.startsWith("/dashboard/articles")) {
        const { success, error } = await unpublishArticle(token, {
          articleId: article.articleId,
        });
        if (error) {
          toast.error(error, toastOptions);
        } else {
          toast.success(success);
          setopen((prevState) => !prevState);
        }
      } else {
        const { message, error } = await apiClient.post(
          `/api/website-article/website/${websiteId}/unpublish`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ articleId: article.articleId }),
          },
        );
        if (error) {
          toast.error(error, toastOptions);
        } else {
          toast.success(message, toastOptions);
          setopen((prevState) => !prevState);
        }
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setopen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Un Publish</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unpublish {article.title} </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure absolutely sure to unpublish it?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <SubmitButton isPending={isPending} onClick={unpublishHandler}>
            Unpublish
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
