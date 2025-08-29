"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Article } from "@/types/article";
import { format } from "date-fns";
import { Calendar, MoreVertical, Tag } from "lucide-react";
import { Badge } from "../ui/badge";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { RemoveSectionArticle } from "./remove-article";
import { Section } from "@/types/section";
import { MainSectionArticle } from "./main-section-article";

interface SectionArticle extends Article {
  articleSectionId: string;
  isMain: boolean;
}

interface Props {
  article: SectionArticle;
  section: Section;
}

export default function SectionArticleItem({ article, section }: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const closeDropDown = (value: boolean) => setIsDropdownOpen(value);
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-video relative">
        <Image
          src={article.imageUrl}
          alt={article.title}
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
            <DropdownMenuContent align="end" className="w-[200px]">
              {section.layout === 5 && (
                <MainSectionArticle
                  article={article}
                  closeDropDown={closeDropDown}
                />
              )}
              <RemoveSectionArticle
                article={article}
                closeDropDown={closeDropDown}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CardHeader className="mb-1">
        <CardTitle>{article.title}</CardTitle>
        <CardDescription>
          {article.description.length > 100
            ? `${article.description.slice(0, 100)}...`
            : article.description}
        </CardDescription>{" "}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center">
              <Tag className="mr-1 h-3 w-3" />
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            {format(new Date(article.createdAt), "PPP")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
