"use client";
import React from "react";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import useUIStore from "@/store/uiStore";

export default function AddArticleButton() {
  const { articleAddSheetOpen, articleAddSheetChange } = useUIStore();
  const handleClick = () => {
    articleAddSheetChange(!articleAddSheetOpen);
  };
  return (
    <Button onClick={handleClick}>
      <PlusCircle className="mr-2 h-4 w-4" />
      Add Article
    </Button>
  );
}
