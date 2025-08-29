"use client";
import React, { useTransition } from "react";
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
import { toast } from "sonner";
import { tableType } from "@/types/index";
import { toastOptions } from "@/lib/constant";
import SubmitButton from "./submit-button";
import { deleteAdmins } from "@/action";

interface Props {
  type: tableType;
  arr: string[];
}

const AlertDelete = ({ type, arr }: Props) => {
  const [open, setopen] = React.useState<boolean>(false);
  const { data } = useSession();
  const token = data?.user.accessToken as string;
  const isDisable = data?.user.role !== "admin";
  const [isPending, startTransition] = useTransition();

  const deleteData = async () => {
    if (!token) return;
    startTransition(async () => {
      let message = "";
      let error = "";
      switch (type) {
        case "admins":
          const adminResponse = await deleteAdmins(token, { adminIds: arr });
          adminResponse.error
            ? (error = adminResponse.error)
            : (message = adminResponse.success as string);
          break;
        default:
          throw new Error("Invalid type is provided");
      }
      if (error) {
        toast.error(error, toastOptions);
      } else {
        toast.success(message, toastOptions);
        setopen(false);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setopen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          disabled={isDisable}
          className="capitalize"
        >
          Delete {type}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete
            <span className="mx-1">{type}</span> details and remove your data
            from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <SubmitButton isPending={isPending} onClick={deleteData}>
            Delete {type}
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDelete;
