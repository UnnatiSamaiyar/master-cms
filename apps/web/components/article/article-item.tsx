"use client";
import React, { Fragment } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Article } from "@/types/article";
import { format } from "date-fns";
import {
  ArrowUpFromLine,
  Calendar,
  MoreVertical,
  Pencil,
  Tag,
} from "lucide-react";
import { Badge } from "../ui/badge";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import EditArticle from "./edit-article";
import { DeleteArticle } from "./delete-article";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Props {
  data: Article;
}

export default function ArticleItem({ data }: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const { data: session } = useSession();
  const closeDropDown = (value: boolean) => setIsDropdownOpen(value);

  return (
    <Card className="group  hover:scale-105 ease-in-out overflow-hidden hover:shadow-lg transition-all duration-200">
      <div className="aspect-video relative">
        <Image
          src={data.imageUrl}
          alt={data.title}
          fill
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className={cn(
            "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            isDropdownOpen && "opacity-100",
          )}
        >
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white/90 backdrop-blur-sm"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <EditArticle article={data} closeDropDown={closeDropDown} />
              <Button
                className="cursor-pointer w-full justify-start"
                asChild
                variant="ghost"
              >
                <Link href={`/dashboard/articles/${data.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Write Content
                </Link>
              </Button>

              {session?.user.role !== "content writer" && (
                <Fragment>
                  <DeleteArticle article={data} closeDropDown={closeDropDown} />
                  {data.isPublished && (
                    <Button
                      className="cursor-pointer w-full justify-start"
                      asChild
                      variant="ghost"
                    >
                      <Link href={`/dashboard/articles/${data.id}/push`}>
                        <ArrowUpFromLine className="mr-2 h-4 w-4" />
                        Push to website
                      </Link>
                    </Button>
                  )}
                </Fragment>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CardHeader className="mb-1">
        <CardTitle>{data.title}</CardTitle>
        <CardDescription>
          {data.description.length > 100
            ? `${data.description.slice(0, 100)}...`
            : data.description}
        </CardDescription>{" "}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {data.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center">
              <Tag className="mr-1 h-3 w-3" />
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            {format(new Date(data.createdAt), "PPP")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
