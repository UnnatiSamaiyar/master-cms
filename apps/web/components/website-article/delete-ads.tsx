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
import { Loader2 } from "lucide-react";

import React, { Fragment, useState, useTransition } from "react";
import { Button } from "../ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { toastOptions } from "@/lib/constant";
import { AdType } from "@/types/ads";
import { apiClient } from "@/lib/apiClient";
import { useSearchParams } from "next/navigation";

interface Props {
  ad: AdType;
}

export default function DeleteWebsiteArticleAds({ ad }: Props) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState<boolean>(false);
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("websiteId");

  const handleDelete = () => {
    startTransition(async () => {
      const { error, message } = await apiClient.delete(
        `/api/website-ads/articles/ads/${websiteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ adsId: ad.id }),
        },
      );
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
      <AlertDialogTrigger className="py-1.5 text-sm hover:bg-accent rounded-sm flex px-2 cursor-pointer w-full disabled:cursor-not-allowed">
        Delete Ad
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you absolutely sure to delete {ad.title}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete ad
            realted data. This action cannot be undone. This will permanently
            remove the data from server.
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
