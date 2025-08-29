"use client";
import { useMediaQuery } from "@/hooks/useMediaquery";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddArticleForm } from "../forms/article/add-article";
import useUIStore from "@/store/uiStore";

interface WriteDrawerProps {
  children?: React.ReactNode;
}

export default function AddArticleModal({ children }: WriteDrawerProps) {
  const { articleAddSheetOpen, articleAddSheetChange } = useUIStore();
  const closeDrawer = (value: boolean) => articleAddSheetChange(!value);

  return (
    <Dialog open={articleAddSheetOpen} onOpenChange={articleAddSheetChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Article</DialogTitle>
          <DialogDescription>
            Add your title and description here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <AddArticleForm closeDrawer={closeDrawer} />
      </DialogContent>
    </Dialog>
  );
}
