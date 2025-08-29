"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export const SettingSideBar = () => {
  const pathname = usePathname();
  return (
    <nav className="grid gap-4 text-sm text-muted-foreground">
      <Link
        href="/dashboard/settings"
        className={cn(
          pathname === "/dashboard/settings" ? "font-bold text-primary" : "",
        )}
      >
        General
      </Link>
      <Link
        href="/dashboard/settings/password"
        className={cn(
          pathname === "/dashboard/settings/password"
            ? "font-bold text-primary"
            : "",
        )}
      >
        Change Password
      </Link>
    </nav>
  );
};
