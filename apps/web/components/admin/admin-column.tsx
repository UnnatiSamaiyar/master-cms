"use client";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { adminType } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Ellipsis } from "lucide-react";
import { format } from "date-fns";
import { ChangeRoleForm } from "../forms/admin/change-role";
import Link from "next/link";
import { useSession } from "next-auth/react";

export const adminColumns: ColumnDef<adminType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "isVerified",
    header: "Verified",
    cell: ({ row }) => {
      const isVerified = row.getValue("isVerified");
      return isVerified ? (
        <Badge
          variant="outline"
          className="bg-green-50 rounded-md text-green-700"
        >
          Verified
        </Badge>
      ) : (
        <Badge variant="destructive">UnVerified</Badge>
      );
    },
  },

  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge className="capitalize" variant="outline">
        {row.getValue("role")}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return format(new Date(row.getValue("createdAt")), "PPP");
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const { data: session } = useSession();

      const admin = row.original;
      const copyMessageId = () => {
        navigator.clipboard.writeText(admin.id);
        toast.info(`Admin Id has been copied.`, {
          description: `${admin.id}`,
          action: {
            label: "Undo",
            onClick: () => console.log("Copy"),
          },
        });
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <Ellipsis className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={copyMessageId}
            >
              Copy Admin Id
            </DropdownMenuItem>
            {session?.user.role === "admin" && (
              <DropdownMenuItem>
                <Link href={`/dashboard/admins/${admin.id}`}>
                  Assigned Websites
                </Link>
              </DropdownMenuItem>
            )}
            <ChangeRoleForm admin={admin} />
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
