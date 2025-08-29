"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Globe, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { toastOptions } from "@/lib/constant";
import Link from "next/link";
import { Website } from "@/types/website";
import { toast } from "sonner";
import EditWebsiteModal from "./edit-modal";
import { useSession } from "next-auth/react";
import { Fragment } from "react";

export const websiteColumns: ColumnDef<Website>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
            <Globe className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-sm font-medium text-gray-900">
            {row.getValue("name")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "domain",
    header: "Domain",
  },
  {
    accessorKey: "backendUrl",
    header: "Backend Url",
  },

  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <p>{format(date, "PPP")}</p>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: "updated At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <p>{format(date, "PPP")}</p>;
    },
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const website = row.original;
      const { data: session } = useSession();

      const hanldeCopyClick = (website: Website) => {
        navigator.clipboard.writeText(website.id);
        toast.success(
          `The website ID ${website.id} has been copied.`,
          toastOptions,
        );
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => hanldeCopyClick(website)}>
              Copy website ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {session?.user.role === "admin" && (
              <Fragment>
                <DropdownMenuItem>
                  <Link href={`/dashboard/websites/${website.id}/admins`}>
                    Assigned admins
                  </Link>
                </DropdownMenuItem>
                <EditWebsiteModal website={website} />
                <DropdownMenuItem asChild>
                  <Link
                    className="w-full cursor-pointer"
                    href={`/dashboard/websites/${website.id}/assign?name=${website.name}`}
                  >
                    Assign admins
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    className="w-full cursor-pointer"
                    href={`/dashboard/websites/${website.id}/assign/remove?name=${website.name}`}
                  >
                    Remove assign admins
                  </Link>
                </DropdownMenuItem>
              </Fragment>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
