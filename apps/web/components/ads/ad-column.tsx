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
import { AdType } from "@/types/ads";
import Image from "next/image";
import Link from "next/link";
import DeleteAds from "./delete-ads-dialoag";

export const adsColumns: ColumnDef<AdType>[] = [
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
              Copy add Id
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/dashboard/ads/${ad.id}/edit`}>Edit Ad</Link>
            </DropdownMenuItem>
            <DeleteAds ad={ad} />
            <DropdownMenuItem>
              <Link href={`/dashboard/ads/${ad.id}/push`}>Push to website</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
