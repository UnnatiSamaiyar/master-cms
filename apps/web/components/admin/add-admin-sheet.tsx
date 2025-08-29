"use client";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AddAdminForm } from "../forms/admin/add-admin";
import useUIStore from "@/store/uiStore";

const AddAdminSheet = () => {
  const { adminAddSheetOpen, adminAddSheetChange } = useUIStore();
  return (
    <Sheet open={adminAddSheetOpen} onOpenChange={adminAddSheetChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Admin</SheetTitle>
        </SheetHeader>{" "}
        <AddAdminForm />
      </SheetContent>
    </Sheet>
  );
};

export default AddAdminSheet;
