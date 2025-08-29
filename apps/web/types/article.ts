import { Descendant } from "slate";

export interface Article {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  description: string;
  isPublished: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
