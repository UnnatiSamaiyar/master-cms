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
import { Ellipsis } from "lucide-react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { AdType } from "@/types/ads";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import DeleteAds from "./delete-ads";
import { Badge } from "../ui/badge";

export const WebsiteadsColumns: ColumnDef<AdType>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => {
      return (
        <Image
          src={row.original.imageUrl}
          width={50}
          height={50}
          alt="Ad Image"
        />
      );
    },
  },

  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "targetUrl",
    header: "Target Url",
  },

  {
    accessorKey: "isRightSideBar",
    header: "Sidebar",
    cell: ({ row }) => {
      return row.original.isRightSideBar ? (
        <Badge variant="outline">Right</Badge>
      ) : (
        <Badge variant="outline">Left</Badge>
      );
    },
  },
  {
    accessorKey: "order",
    header: "Order",
    cell: ({ row }) => {
      return <Badge variant="outline">{row.original.order}</Badge>;
    },
  },

  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      return <p>{format(new Date(row.original.startDate), "PPP")}</p>;
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      return <p>{format(new Date(row.original.endDate), "PPP")}</p>;
    },
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
      const searchParams = useSearchParams();
      const websiteId = searchParams.get("websiteId");

      const ad = row.original;
      const copyMessageId = () => {
        navigator.clipboard.writeText(ad.id);
        toast.info(`Ad Id has been copied.`, {
          description: `${ad.id}`,
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
              Copy Ad Id
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link
                href={`/dashboard/website-ads/${ad.id}?websiteId=${websiteId}`}
              >
                Edit Ad
              </Link>
            </DropdownMenuItem>
            <DeleteAds ad={ad} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
